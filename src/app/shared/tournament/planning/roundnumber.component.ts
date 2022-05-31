import { AfterViewInit, Component, EventEmitter, Input, OnInit, Output, TemplateRef, OnDestroy } from '@angular/core';
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
  Period,
  AgainstGame,
  SelfReferee,
  TogetherGame,
  CompetitionSport,
  AgainstSide,
  TogetherGamePlace,
  PlanningEditMode,
  GameOrder,
  Competitor,
  GameState,
  AgainstVariant,
  StructureNameService
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
export class RoundNumberPlanningComponent implements OnInit, AfterViewInit, OnDestroy {

  @Input() tournament!: Tournament;
  @Input() roundNumber!: RoundNumber;
  @Input() structureNameService!: StructureNameService;
  @Input() userRefereeId: number | string | undefined;
  @Input() roles: number = 0;
  @Input() favorites!: Favorites;
  @Input() refreshingData: boolean | undefined;
  @Output() refreshData = new EventEmitter();
  @Output() scroll = new EventEmitter();
  alert: IAlert | undefined;
  public sameDay = true;
  public userIsAdmin: boolean = false;
  public gameOrder: GameOrder = GameOrder.ByDate;
  public filterEnabled = false;
  public hasSomeReferees: boolean = false;
  public hasBegun: boolean = false;
  public tournamentHasBegun: boolean = false;
  public gameDatas: GameData[] = [];
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
    this.userIsAdmin = currentUser ? currentUser.hasRoles(Role.Admin) : false;
    this.roles = currentUser?.getRoles() ?? 0;
    this.needsRanking = this.roundNumber.needsRanking();
    this.hasMultiplePoules = this.roundNumber.getPoules().length > 1;
    this.hasSomeReferees = this.tournament.getCompetition().getReferees().length > 0
      || this.planningConfig.getSelfReferee() !== SelfReferee.Disabled;
    this.hasBegun = this.roundNumber.hasBegun();
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
    const games = this.roundNumber.getGames(this.gameOrder);
    const recesses = games.length > 0 ? this.getRecesses(this.roundNumber) : [];
    const pouleDataMap = this.getPouleDataMap();
    games.forEach((game: AgainstGame | TogetherGame) => {
      const somePlaceHasACompetitor = this.somePlaceHasACompetitor(game);
      if (this.filterEnabled && this.favorites?.hasItems() && !this.favorites?.hasGameItem(game)) {
        return;
      }
      const pouleData: PouleData | undefined = pouleDataMap.get(game.getPoule().getId());
      if (pouleData === undefined) {
        return;
      }
      const gameData: GameData = {
        canChangeResult: this.canChangeResult(game),
        somePlaceHasACompetitor: somePlaceHasACompetitor,
        poule: pouleData,
        hasPopover: pouleData.needsRanking || (!this.roundNumber.isFirst() && somePlaceHasACompetitor),
        game: game,
        recess: this.removeRecessBeforeGame(game, recesses)
      };
      gameDatas.push(gameData);
    });
    return gameDatas;
  }

  private getRecesses(roundNumber: RoundNumber): Period[] {
    const previousLastEndDateTime = this.getPreviousEndDateTime(roundNumber);
    return this.tournament.getRecesses().map((recess: Recess): Period => {
      const startDateTime = recess.getStartDateTime().getTime() < previousLastEndDateTime.getTime() ? previousLastEndDateTime : recess.getStartDateTime();
      return new Period(startDateTime, recess.getEndDateTime());
    });
  }

  protected removeRecessBeforeGame(game: Game, recesses: Period[]): Period | undefined {
    if (!this.planningConfig.getEnableTime() || this.gameOrder === GameOrder.ByPoule) {
      return undefined;
    }
    const recess: Period | undefined = recesses.find((recess: Period) => {
      return game.getStartDateTime()?.getTime() === recess.getEndDateTime().getTime();
    });
    if (recess === undefined) {
      return undefined;
    }
    const idx = recesses.indexOf(recess);
    if (idx >= 0) {
      recesses.splice(idx, 1);
    }
    return recess;
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

  toggleFilter() {
    this.filterEnabled = !this.filterEnabled;
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
    const pouleDatas = new PouleDataMap();
    this.roundNumber.getPoules().forEach(poule => {
      pouleDatas.set(poule.getId(), {
        name: this.structureNameService.getPouleName(poule, false),
        needsRanking: poule.needsRanking(),
        round: poule.getRound()
      });
    });
    return pouleDatas;
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

  hasAdminRole(): boolean {
    return this.hasRole(Role.Admin);
  }

  canFilter(): boolean {
    return !this.hasRole(Role.Admin + Role.GameResultAdmin);
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
    this.roundNumber.getRounds().some((round: Round) => {
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
          if (previous && previous.getNrOfGames() === 0) {
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
  recess: Period | undefined;
}

interface PouleData {
  name: string;
  needsRanking: boolean;
  round: Round;
}

class PouleDataMap extends Map<string | number, PouleData> { }

