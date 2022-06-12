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
  StartLocationMap
} from 'ngx-sport';

import { AuthService } from '../../../lib/auth/auth.service';
import { CSSService } from '../../common/cssservice';
import { Favorites } from '../../../lib/favorites';
import { Role } from '../../../lib/role';
import { Tournament } from '../../../lib/tournament';
import { PlanningRepository } from '../../../lib/ngx-sport/planning/repository';
import { PouleRankingModalComponent } from '../poulerankingmodal/rankingmodal.component';
import { TranslateService } from '../../../lib/translate';
import { CompetitionSportRouter } from '../competitionSport.router';
import { CompetitionSportTab } from '../competitionSportTab';
import { InfoModalComponent } from '../infomodal/infomodal.component';
import { IAlert, IAlertType } from '../../common/alert';
import { DateFormatter } from '../../../lib/dateFormatter';
import { of, Subscription, timer } from 'rxjs';
import { catchError, switchMap } from 'rxjs/operators';
import { AppErrorHandler } from '../../../lib/repository';
import { Recess } from '../../../lib/recess';

@Component({
  selector: 'app-tournament-roundnumber-planning',
  templateUrl: './roundnumber.component.html',
  styleUrls: ['./roundnumber.component.scss']
})
export class RoundNumberPlanningComponent implements OnInit, AfterViewInit, OnDestroy, OnChanges {

  @Input() tournament!: Tournament;
  @Input() roundNumber!: RoundNumber;
  @Input() favoriteCategories!: Category[];
  @Input() structureNameService!: StructureNameService;
  @Input() showLinksToAdmin = false;
  @Input() userRefereeId: number | string | undefined;
  @Input() roles: number = 0;
  @Input() favorites: Favorites | undefined;
  @Input() refreshingData: boolean | undefined;
  @Output() refreshData = new EventEmitter();
  @Output() scroll = new EventEmitter();
  alert: IAlert | undefined;
  public sameDay = true;
  public gameOrder: GameOrder = GameOrder.ByDate;
  public filterFavorites = false;
  public hasSomeReferees: boolean = false;
  public allFilteredSubjects: string[] = [];
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
  private refreshTimer: Subscription | undefined;
  private appErrorHandler: AppErrorHandler;
  public progressPerc = 0;

  constructor(
    private router: Router,
    public competitionSportRouter: CompetitionSportRouter,
    private authService: AuthService,
    public cssService: CSSService,
    public dateFormatter: DateFormatter,
    public translate: TranslateService,
    private modalService: NgbModal,
    protected planningRepository: PlanningRepository) {
    // this.winnersAndLosers = [Round.WINNERS, Round.LOSERS];
    this.resetAlert();
    this.scoreConfigService = new ScoreConfigService();
    this.appErrorHandler = new AppErrorHandler();
  }

  ngOnInit() {
    this.planningConfig = this.roundNumber.getValidPlanningConfig();
    const loggedInUserId = this.authService.getLoggedInUserId();
    const currentUser = loggedInUserId ? this.tournament.getUser(loggedInUserId) : undefined;
    this.roles = currentUser?.getRoles() ?? 0;
    this.needsRanking = this.roundNumber.getStructureCells().some(structureCell => structureCell.needsRanking());
    const rounds = this.roundNumber.getRounds(undefined);
    this.hasMultiplePoules = rounds.length > 1 || rounds.every(round => round.getPoules().length > 1);
    this.hasSomeReferees = this.tournament.getCompetition().getReferees().length > 0
      || this.planningConfig.getSelfReferee() !== SelfReferee.Disabled;
    this.hasBegun = this.roundNumber.hasBegun();
    // @TODO CDK : wat is de standaard instelling voor 2e ronde met filter
    // dubbele wedstrijden wanneer filter standaard aan
    // ik zou zeggen filter aan, wanneer 1 van de favorites voor komt in de rondenummer
    if (this.favorites) {
      this.filterFavorites = (this.favorites.hasCompetitors() || this.favorites.hasReferees());
    }
    this.tournamentHasBegun = this.roundNumber.getFirst().hasBegun();
    this.loadGameData();
    this.hasOnlyGameModeAgainst = this.hasOnlyAgainstGameMode();
    this.hasGameModeAgainst = this.hasAgainstGameMode();
    if (this.gameDatas.length === 0) {
      this.showProgress()
    }
  }

  ngAfterViewInit() {
    if (this.roundNumber.getNext() === undefined) {
      this.scroll.emit();
    }
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes.favoriteCategories !== undefined && changes.favoriteCategories.currentValue !== changes.favoriteCategories.previousValue
      && changes.favoriteCategories.firstChange === false) {
      this.loadGameData();
    }
  }

  private loadGameData() {
    this.gameDatas = this.getGameData();
    this.sameDay = this.gameDatas.length > 1 ? this.isSameDay(this.gameDatas[0], this.gameDatas[this.gameDatas.length - 1]) : true;
  }

  get Home(): AgainstSide { return AgainstSide.Home; }
  get Away(): AgainstSide { return AgainstSide.Away; }
  get SportConfigTabFields(): number { return CompetitionSportTab.Fields; }
  get SportConfigTabScore(): number { return CompetitionSportTab.Score; }
  get OrderByPoule(): GameOrder { return GameOrder.ByPoule; }
  get OrderByDate(): GameOrder { return GameOrder.ByDate; }

  private getGameData() {
    const gameDatas: GameData[] = [];
    const games = (new GameGetter()).getGames(this.gameOrder, this.roundNumber, new CategoryMap(this.favoriteCategories));
    const recessItems = games.length > 0 ? this.getRecessItems(this.roundNumber) : [];
    const pouleDataMap = this.getPouleDataMap();
    let nrOfFilteredByFavorites = 0, nrOfFilteredByCategories = 0;
    games.forEach((game: AgainstGame | TogetherGame) => {

      const poule = game.getPoule();
      const pouleData: PouleData | undefined = pouleDataMap.get(poule.getId());
      if (pouleData === undefined) {
        return;
      }

      const filterByFavorite = this.filterFavorites && this.favorites
        && (!this.favorites.hasGameReferee(game) && (pouleDataMap.somePlaceHasCompetitor && !this.favorites.hasGameCompetitor(game)));

      const filterByCategory = this.favorites && this.favorites.hasCategories() && !this.favorites.hasCategory(game.getRound().getCategory());

      if (filterByFavorite || filterByCategory) {
        if (filterByFavorite) {
          nrOfFilteredByFavorites++;
        }
        if (filterByCategory) {
          nrOfFilteredByCategories++;
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
    if (this.allGamesFiltered && nrOfFilteredByCategories === games.length) {
      this.allFilteredSubjects.push('categoriën');
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
    const nrOfMinutesToAdd = previous.getValidPlanningConfig().getMaxNrOfMinutesPerGame();
    return new Date(previous.getLastStartDateTime().getTime() + (nrOfMinutesToAdd * 60000));
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

  getCompetitor(place: Place): Competitor | undefined {
    const startLocation = place.getStartLocation();
    if (startLocation === undefined) {
      return undefined;
    }
    return this.structureNameService.getStartLocationMap()?.getCompetitor(startLocation);
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
  categoryName: string
}

class PouleDataMap extends Map<string | number, PouleData> {
  public somePlaceHasCompetitor: boolean = false;

  checkIfSomePlaceHasCompetitor(poule: Poule, startLocationMap: StartLocationMap): void {
    // console.log(startLoc, 'rn' + this.roundNumber.getNumber());
    this.somePlaceHasCompetitor = poule.getPlaces().some((place: Place): boolean => {
      const startLoc = place.getStartLocation();
      return startLoc !== undefined && startLocationMap.getCompetitor(startLoc) !== undefined;
    });
  }
}

