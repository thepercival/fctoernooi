import { AfterViewInit, Component, EventEmitter, Input, OnInit, Output, TemplateRef, OnDestroy, OnChanges, SimpleChanges } from '@angular/core';
import { Router } from '@angular/router';
import { NgbPopover, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import {
  Game,
  Poule,
  RoundNumber,
  ScoreConfigService,
  Round,
  PlanningConfig,
  ScoreConfig,
  Place,
  AgainstGame,
  SelfReferee,
  TogetherGame,
  CompetitionSport,
  AgainstSide,
  TogetherGamePlace,
  PlanningEditMode,
  GameOrder,
  GameState,
  AgainstVariant,
  StructureNameService,
  Category,
  CategoryMap,
  StructureCell,
  GameGetter,
  Competitor,
  StartLocationMap,
  Field
} from 'ngx-sport';

import { AuthService } from '../../../lib/auth/auth.service';
import { CSSService } from '../../common/cssservice';
import { Favorites } from '../../../lib/favorites';
import { Role } from '../../../lib/role';
import { Tournament } from '../../../lib/tournament';
import { PlanningRepository } from '../../../lib/ngx-sport/planning/repository';
import { PouleRankingModalComponent } from '../poulerankingmodal/rankingmodal.component';
import { CompetitionSportRouter } from '../competitionSport.router';
import { CompetitionSportTab } from '../competitionSportTab';
import { InfoModalComponent } from '../infomodal/infomodal.component';
import { IAlert, IAlertType } from '../../common/alert';
import { DateFormatter } from '../../../lib/dateFormatter';
import { of, Subscription, timer } from 'rxjs';
import { catchError, switchMap } from 'rxjs/operators';
import { AppErrorHandler } from '../../../lib/repository';
import { Recess } from '../../../lib/recess';
import { TranslateScoreService } from '../../../lib/translate/score';
import { TournamentCompetitor } from '../../../lib/competitor';
import { CompetitorRepository } from '../../../lib/ngx-sport/competitor/repository';

@Component({
  selector: 'tbody[app-tournament-roundnumber-planning]',
  templateUrl: './roundnumber.component.html',
  styleUrls: ['./roundnumber.component.scss']
})
export class RoundNumberPlanningComponent implements OnInit, AfterViewInit, OnDestroy, OnChanges {

  @Input() tournament!: Tournament;
  @Input() roundNumber!: RoundNumber;
  @Input() optionalGameColumns!: Map<OptionalGameColumn, boolean>; 
  @Input() favoriteCategories!: Category[];
  @Input() structureNameService!: StructureNameService;
  @Input() showLinksToAdmin = false;
  @Input() userRefereeId: number | string | undefined;
  @Input() roles: number = 0;
  @Input() favorites: Favorites | undefined;
  @Input() refreshingData: boolean | undefined;
  @Output() refreshData = new EventEmitter();
  @Output() scrolling = new EventEmitter();
  alert: IAlert | undefined;
  public sameDay = true;
  public gameOrder: GameOrder = GameOrder.ByDate;
  public filterFavorites = false;
  public allFilteredSubjects: string[] = [];
  public showToggleFavorites: boolean | undefined;
  public hasBegun: boolean = false;
  public tournamentHasBegun: boolean = false;
  public gameDatas: GameData[] = [];
  public allGamesFiltered: boolean = false;
  private scoreConfigService: ScoreConfigService;
  public needsRanking: boolean = false;
  public hasMultiplePoules: boolean = false;
  public planningConfig!: PlanningConfig;
  public hasOnlyGameModeAgainst: boolean = true;
  public hasGameModeAgainst: boolean = true;
  public showStartColumn = false;
  public showRefereeColumn = false;
  public showSportColumn = false;
  public nrOfColumns = 0;
  private refreshTimer: Subscription | undefined;
  private appErrorHandler: AppErrorHandler;
  public progressPerc = 0;

  constructor(
    private router: Router,
    public competitionSportRouter: CompetitionSportRouter,
    private authService: AuthService,
    public cssService: CSSService,
    public dateFormatter: DateFormatter,
    public translate: TranslateScoreService,
    private modalService: NgbModal,
    protected planningRepository: PlanningRepository,
    public competitorRepository: CompetitorRepository) {
    // this.winnersAndLosers = [Round.WINNERS, Round.LOSERS];
    this.resetAlert();
    this.scoreConfigService = new ScoreConfigService();
    this.appErrorHandler = new AppErrorHandler(router);
  }

  ngOnInit() {
    this.planningConfig = this.roundNumber.getValidPlanningConfig();
    const loggedInUserId = this.authService.getLoggedInUserId();
    const currentUser = loggedInUserId ? this.tournament.getUser(loggedInUserId) : undefined;
    this.roles = currentUser?.getRoles() ?? 0;
    this.needsRanking = this.roundNumber.getStructureCells().some(structureCell => structureCell.needsRanking());
    const rounds = this.roundNumber.getRounds(undefined);
    this.hasMultiplePoules = rounds.length > 1 || rounds.every(round => round.getPoules().length > 1);
    this.hasBegun = this.roundNumber.hasBegun();
    this.tournamentHasBegun = this.roundNumber.getFirst().hasBegun();
    const categoryMap = new CategoryMap(this.favoriteCategories);
    if (this.favorites) {
      this.filterFavorites = (this.favorites.hasCompetitors(categoryMap) || this.favorites.hasReferees());
    }
    this.loadGameData();
    this.hasOnlyGameModeAgainst = this.hasOnlyAgainstGameMode();
    this.hasGameModeAgainst = this.hasAgainstGameMode();
    this.showStartColumn = this.planningConfig.getEnableTime() || this.optionalGameColumns.get(OptionalGameColumn.Start) === true;
    this.showRefereeColumn = this.planningConfig.getSelfReferee() !== SelfReferee.Disabled || this.optionalGameColumns.get(OptionalGameColumn.Referee) === true;
    const nrOfColumnsForPlacesAndScores = this.hasOnlyGameModeAgainst ? 3 : 1;
    this.nrOfColumns = 4 + (this.showRefereeColumn ? 1 : 0 ) + (this.showStartColumn ? 1 : 0) + nrOfColumnsForPlacesAndScores;
    this.showSportColumn = this.tournament.getCompetition().hasMultipleSports();
    
    if (this.gameDatas.length === 0) {
      this.showProgress()
    }
  }

  ngAfterViewInit() {
    if (this.roundNumber.getNext() === undefined) {
      this.scrolling.emit();
    }
  }
  

  ngOnChanges(changes: SimpleChanges) {
    if (changes.favoriteCategories !== undefined && changes.favoriteCategories.currentValue !== changes.favoriteCategories.previousValue
      && changes.favoriteCategories.firstChange === false) {
      if (this.favorites) {
        const categoryMap = new CategoryMap(this.favoriteCategories);
        this.filterFavorites = (this.favorites.hasCompetitors(categoryMap) || this.favorites.hasReferees());
      }
      this.loadGameData();
    }
  }

  private loadGameData() {
    const categoryMap = new CategoryMap(this.favoriteCategories);
    this.showToggleFavorites = undefined;
    this.gameDatas = this.getGameData(categoryMap);
    this.sameDay = this.gameDatas.length > 1 ? this.isSameDay(this.gameDatas[0], this.gameDatas[this.gameDatas.length - 1]) : true;
  }

  get Home(): AgainstSide { return AgainstSide.Home; }
  get Away(): AgainstSide { return AgainstSide.Away; }
  get SportConfigTabFields(): number { return CompetitionSportTab.Fields; }
  get SportConfigTabScore(): number { return CompetitionSportTab.Score; }
  get OrderByPoule(): GameOrder { return GameOrder.ByPoule; }
  get OrderByDate(): GameOrder { return GameOrder.ByDate; }
  get GameColumnStart(): number { return OptionalGameColumn.Start; }

  private getGameData(categoryMap: CategoryMap) {
    const gameDatas: GameData[] = [];
    const gameGetter = new GameGetter();
    const games = gameGetter.getGames(this.gameOrder, this.roundNumber);
    const recessItems = games.length > 0 ? this.getRecessItems(this.roundNumber) : [];
    const pouleDataMap = this.getPouleDataMap();
    let nrOfFilteredByFavorites = 0, nrOfFilteredByCategories = 0;
    games.forEach((game: AgainstGame | TogetherGame) => {

      const poule = game.getPoule();
      const pouleData: PouleData | undefined = pouleDataMap.get(poule.getId());
      if (pouleData === undefined) {
        return;
      }

      const filterByCategory = !categoryMap.has(pouleData.categoryNr);

      const category = categoryMap.get(pouleData.categoryNr);
      const filterByFavorite = this.filterFavorites && this.favorites
        && (!this.favorites.hasGameReferee(game)
          && (pouleDataMap.somePlaceHasCompetitor && category && !this.favorites.hasGameCompetitor(game)));

      if (filterByCategory || filterByFavorite) {
        if (filterByCategory) {
          nrOfFilteredByCategories++;
        }
        if (filterByFavorite) {
          nrOfFilteredByFavorites++;
        }
        return;
      }

      const somePlaceHasACompetitor = this.somePlaceHasACompetitor(game);
      const gameData: GameData = {
        canChangeResult: this.canChangeResult(game),
        somePlaceHasACompetitor: somePlaceHasACompetitor,
        poule: pouleData,
        hasPopover: pouleData.needsRanking || (!this.roundNumber.isFirst() && somePlaceHasACompetitor),
        game: game,
        recess: this.removeRecessBeforeGame(game, recessItems)
      };
      gameDatas.push(gameData);
    });
    this.allGamesFiltered = games.length > 0 && gameDatas.length === 0;

    this.allFilteredSubjects = [];
    if (this.allGamesFiltered && nrOfFilteredByFavorites === games.length) {
      this.allFilteredSubjects.push('favorieten');
    }
    let allGamesFilteredByCategories = false;
    if (this.allGamesFiltered && nrOfFilteredByCategories === games.length) {
      allGamesFilteredByCategories = true;
      this.allFilteredSubjects.push('categoriën');
    }
    if (this.showToggleFavorites === undefined) {
      this.showToggleFavorites = !allGamesFilteredByCategories && pouleDataMap.somePlaceHasCompetitor
        && (this.favorites?.hasCompetitors(categoryMap) || this.favorites?.hasReferees())
        && (!this.filterFavorites || nrOfFilteredByFavorites > 0)
    }

    return gameDatas;
  }

  private getRecessItems(roundNumber: RoundNumber): JsonRecessItem[] {
    const previousLastEndDateTime = this.getPreviousEndDateTime(roundNumber);
    return this.tournament.getRecesses().map((recess: Recess): JsonRecessItem => {
      const startDateTime = recess.getStartDateTime().getTime() < previousLastEndDateTime.getTime() ? previousLastEndDateTime : recess.getStartDateTime();
      return {
        name: recess.getName(),
        startDate: this.dateFormatter.toString(startDateTime, this.dateFormatter.date()),
        startTime: this.dateFormatter.toString(startDateTime, this.dateFormatter.time()),
        endDateTime: recess.getEndDateTime()
      };
    });
  }

  protected removeRecessBeforeGame(game: Game, recessItems: JsonRecessItem[]): JsonRecessItem | undefined {
    if (!this.planningConfig.getEnableTime() || this.gameOrder === GameOrder.ByPoule) {
      return undefined;
    }
    const recessItem: JsonRecessItem | undefined = recessItems.find((recessItemIt: JsonRecessItem) => {
      return game.getStartDateTime()?.getTime() === recessItemIt.endDateTime.getTime();
    });
    if (recessItem === undefined) {
      return undefined;
    }
    const idx = recessItems.indexOf(recessItem);
    if (idx >= 0) {
      recessItems.splice(idx, 1);
    }
    return recessItem;
  }

  private getPreviousEndDateTime(roundNumber: RoundNumber): Date {
    const previous = roundNumber.getPrevious();
    if (previous === undefined) {
      return roundNumber.getCompetition().getStartDateTime();
    }
    return previous.getEndDateTime();
  }

  getRefereeName(game: AgainstGame | TogetherGame): string | undefined {
    const referee = game.getReferee();
    if (referee) {
      return referee.getInitials();
    }
    const refereePlace = game.getRefereePlace();
    if (refereePlace) {
      return this.structureNameService.getPlaceName(refereePlace, true, false);
    }
    return '';
  }

  toggleFilterFavorites() {
    this.filterFavorites = !this.filterFavorites;
    this.loadGameData();
  }

  private hasAgainstGameMode(): boolean {
    return this.tournament.getCompetition().getSports().some((competitionSport: CompetitionSport): boolean => {
      return competitionSport.getVariant() instanceof AgainstVariant;
    });
  }

  private hasOnlyAgainstGameMode(): boolean {
    return this.tournament.getCompetition().getSports().every((competitionSport: CompetitionSport): boolean => {
      return competitionSport.getVariant() instanceof AgainstVariant;
    });
  }

  isAgainst(game: AgainstGame | TogetherGame): boolean {
    return (game instanceof AgainstGame);
  }

  private getPouleDataMap(): PouleDataMap {
    const map = new PouleDataMap();
    const startLocationMap = this.structureNameService.getStartLocationMap();
    this.roundNumber.getRounds(undefined).forEach((round: Round) => round.getPoules().forEach(poule => {
      map.set(poule.getId(), {
        name: this.structureNameService.getPouleName(poule, false),
        needsRanking: poule.needsRanking(),
        round,
        categoryNr: round.getCategory().getNumber(),
        categoryName: round.getCategory().getName()
      });
      if (!map.somePlaceHasCompetitor && startLocationMap) {
        map.checkIfSomePlaceHasCompetitor(poule, startLocationMap);
      }
    }));
    return map;
  }

  getAgainstScore(game: AgainstGame): string {
    const score = ' - ';
    if (game.getState() !== GameState.Finished) {
      return score;
    }
    const finalScore = this.scoreConfigService.getFinalAgainstScore(game);
    if (finalScore === undefined) {
      return score;
    }
    return finalScore.getHome() + score + finalScore.getAway();
  }

  getTogetherScore(gamePlace: TogetherGamePlace): string {
    const sScore = ' - ';
    if (gamePlace.getGame().getState() !== GameState.Finished) {
      return sScore;
    }
    const finalScore = this.scoreConfigService.getFinalTogetherScore(gamePlace);
    return finalScore === undefined ? sScore : '' + finalScore;
  }

  getTogetherScoreBtnBorderClass(gamePlace: TogetherGamePlace): string {
    return gamePlace.getGame().getState() === GameState.Finished ? IAlertType.Success : 'primary';
  }

  isFinished(game: Game): boolean {
    return game.getState() === GameState.Finished;
  }

  canChangeResult(game: Game): boolean {
    if (this.hasRole(Role.GameResultAdmin)) {
      return true;
    }
    const referee = game.getReferee();
    if (referee === undefined) {
      return false;
    }
    return this.hasRole(Role.Referee) && this.userRefereeId === referee.getId();
  }

  protected hasRole(role: number): boolean {
    return (this.roles & role) === role;
  }

  getCompetitor(place: Place): TournamentCompetitor | undefined {
    const startLocation = place.getStartLocation();
    if (startLocation === undefined) {
      return undefined;
    }
    return <TournamentCompetitor>this.structureNameService.getStartLocationMap()?.getCompetitor(startLocation);
  }

  private hasCompetitor(place: Place): boolean {
    return this.getCompetitor(place) !== undefined;
  }

  somePlaceHasACompetitor(game: Game): boolean {
    return game.getPlaces().some(gamePlace => this.hasCompetitor(gamePlace.getPlace()));
  }

  linkToGameEdit(game: AgainstGame | TogetherGame) {
    const suffix = ((game instanceof AgainstGame) ? 'against' : 'together')
    this.router.navigate(['/admin/game' + suffix, this.tournament.getId(), game.getId()]);
  }

  linkToGameAdd() {
    const competitionSport = this.roundNumber.getCompetition().getSingleSport();
    const suffix = ((competitionSport.getVariant() instanceof AgainstVariant) ? 'against' : 'together')
    this.router.navigate(['/admin/game/new', this.tournament.getId(), this.roundNumber.getNumber()]);
  }

  linkToPlanningConfig() {
    this.router.navigate(['/admin/planningconfig', this.tournament.getId(), this.roundNumber.getNumber()]);
  }

  linkToCompetitionSport(tab: CompetitionSportTab) {
    this.competitionSportRouter.navigate(this.tournament, tab);
  }

  linkToReferee() {
    this.router.navigate(['/admin/referees', this.tournament.getId()]);
  }

  public startDateTimeToString(date: Date): string {

    const formatOptions: Intl.DateTimeFormatOptions = {
      month: 'short',
      day: 'numeric',
      weekday: 'long'
    };

    return this.dateFormatter.toString(date, formatOptions)
      + ' om ' + this.dateFormatter.toString(date, this.dateFormatter.time()) + ' uur';
  }


  showPouleRanking(popOver: NgbPopover, poule: Poule) {
    if (popOver.isOpen()) {
      popOver.close();
    } else {
      const tournament = this.tournament;
      popOver.open({ poule, tournament });
    }
  }

  sortGames() {
    this.gameOrder = this.gameOrder === GameOrder.ByDate ? GameOrder.ByPoule : GameOrder.ByDate;
    this.loadGameData();
  }

  protected isSameDay(gameDataOne: GameData, gameDataTwo: GameData): boolean {
    const gameOne = gameDataOne.game;
    const gameTwo = gameDataTwo.game;
    const dateOne: Date | undefined = gameOne.getStartDateTime();
    const dateTwo: Date | undefined = gameTwo.getStartDateTime();
    if (dateOne === undefined || dateTwo === undefined) {
      return true;
    }
    return (dateOne.getDate() === dateTwo.getDate()
      && dateOne.getMonth() === dateTwo.getMonth()
      && dateOne.getFullYear() === dateTwo.getFullYear());
  }

  protected resetAlert(): void {
    this.alert = undefined;
  }

  protected setAlert(type: IAlertType, message: string): boolean {
    this.alert = { 'type': type, 'message': message };
    return (type === IAlertType.Success);
  }

  getGameQualificationDescription(game: AgainstGame | TogetherGame): string {
    if (game instanceof AgainstGame) {
      return this.structureNameService.getPlacesFromName(game.getSidePlaces(AgainstSide.Home), false, true)
        + ' - ' + this.structureNameService.getPlacesFromName(game.getSidePlaces(AgainstSide.Away), false, true);
    }
    return this.structureNameService.getPlacesFromName(game.getPlaces(), false, true)
  }

  openModalPouleRank(poule: Poule) {
    const modalRef = this.modalService.open(PouleRankingModalComponent, { size: 'xl' });
    modalRef.componentInstance.poule = poule;
    modalRef.componentInstance.competitionSports = this.roundNumber.getCompetitionSports();
    modalRef.componentInstance.favorites = this.favorites;
    modalRef.componentInstance.structureNameService = this.structureNameService;
  }

  openInfoModal(header: string, modalContent: TemplateRef<any>) {
    const activeModal = this.modalService.open(InfoModalComponent, { windowClass: 'info-modal' });
    activeModal.componentInstance.header = header;
    activeModal.componentInstance.noHeaderBorder = true;
    activeModal.componentInstance.modalContent = modalContent;
  }

  getUniqueScoreConfigs(): ScoreConfig[] {
    const sameScoreConfigs: ScoreConfig[] = [];
    this.roundNumber.getCompetitionSports().forEach((competitionSport: CompetitionSport) => {
      const sameScoreConfig = this.getSameScoreConfig(competitionSport);
      if (sameScoreConfig !== undefined) {
        sameScoreConfigs.push(sameScoreConfig);
      }
    });
    return sameScoreConfigs;
  }

  getSameScoreConfig(competitionSport: CompetitionSport): ScoreConfig | undefined {
    let scoreConfig: ScoreConfig | undefined;
    this.roundNumber.getRounds(undefined).some((round: Round) => {
      const roundScoreConfig = round.getValidScoreConfig(competitionSport);
      if (scoreConfig === undefined) {
        scoreConfig = roundScoreConfig;
      } else if (roundScoreConfig !== scoreConfig) {
        scoreConfig = undefined;
        return false;
      }
      return true;
    });
    return scoreConfig;
  }

  inManualMode(): boolean {
    return this.roundNumber.getValidPlanningConfig().getEditMode() === PlanningEditMode.Manual;
  }

  getSportName(field: Field|undefined): string {
    return field?.getCompetitionSport().getSport().getName() ?? 'onbekend';
  }

  /////////////////  NO PLANNING ///////////////////////////

  private showProgress() {
    this.refreshTimer = timer(0, 2000) // repeats every 2 seconds
      .pipe(
        switchMap((value: number) => {
          if (!this.validTimeValue(value)) {
            return of();
          }
          return this.planningRepository.progress(this.roundNumber, this.tournament).pipe();
        }),
        catchError(err => this.appErrorHandler.handleError(err))
      ).subscribe({
        next: (progressPerc: number | undefined) => {
          if (progressPerc === undefined) {
            return;
          }
          const previous = this.roundNumber.getPrevious();
          if (previous && !this.hasGames(previous)) {
            return;
          }
          this.progressPerc = progressPerc;
          if (progressPerc === 100) {
            this.stopShowProgress();
            this.planningRepository.get(this.roundNumber, this.tournament)
              .subscribe({
                next: () => {
                  this.progressPerc = 0;
                  this.loadGameData();
                },
                error: (e) => {
                  this.setAlert(IAlertType.Danger, e);
                }
              });
          }
        },
        error: (e) => {          
          this.setAlert(IAlertType.Danger, e);                
        }
      })
  }

  private hasGames(roundNumber: RoundNumber): boolean {
    return roundNumber.getStructureCells().every((structureCell: StructureCell): boolean => {
      return structureCell.getRounds().some((round: Round): boolean => {
        return round.getPoules().some((poule: Poule): boolean => {
          return poule.getNrOfGames() > 0;
        })
      })
    })
  }

  public hasLogo(place: Place): boolean {
    const competitor = this.getCompetitor(place);
    return competitor ? this.competitorRepository.hasLogoExtension(competitor) : false;
  }

  public getCompetitorLogoUrl(place: Place): string {
    const competitor = this.getCompetitor(place);
    return competitor ? this.competitorRepository.getLogoUrl(competitor, 20) : '';
  } 

  validTimeValue(count: number): boolean {
    return count <= 5 || (count % 10) === 0;
  }

  public showError(): boolean {
    return this.alert?.type === IAlertType.Danger;
  }

  ngOnDestroy() {
    this.stopShowProgress();
  }

  stopShowProgress() {
    if (this.refreshTimer !== undefined) {
      this.refreshTimer.unsubscribe();
    }
  }


}

interface GameData {
  canChangeResult: boolean;
  somePlaceHasACompetitor: boolean;
  poule: PouleData;
  hasPopover: boolean;
  game: AgainstGame | TogetherGame;
  recess: JsonRecessItem | undefined;
}

interface JsonRecessItem {
  name: string,
  startDate: string,
  startTime: string,
  endDateTime: Date
}

interface PouleData {
  name: string;
  needsRanking: boolean;
  round: Round;
  categoryNr: number
  categoryName: string
}

class PouleDataMap extends Map<string | number, PouleData> {
  public somePlaceHasCompetitor: boolean = false;

  checkIfSomePlaceHasCompetitor(poule: Poule, startLocationMap: StartLocationMap): void {
    this.somePlaceHasCompetitor = poule.getPlaces().some((place: Place): boolean => {
      const startLoc = place.getStartLocation();
      return startLoc !== undefined && startLocationMap.getCompetitor(startLoc) !== undefined;
    });
  }
}

export enum OptionalGameColumn {
  Start, Referee
}

// type GameColumnUsage = Record<GameColumnDefinition, boolean>