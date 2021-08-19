import { AfterViewInit, Component, EventEmitter, Input, OnInit, Output, OnChanges, SimpleChanges, TemplateRef, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { NgbPopover, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import {
  Game,
  NameService,
  Poule,
  RoundNumber,
  ScoreConfigService,
  State,
  Round,
  PlanningConfig,
  ScoreConfig,
  CompetitorMap,
  Place,
  Period,
  AgainstGame,
  SelfReferee,
  TogetherGame,
  CompetitionSport,
  AgainstSide,
  AgainstSportVariant,
  TogetherGamePlace,
  PlanningEditMode,
  GameOrder,
  Competitor
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
import { IAlert } from '../../common/alert';
import { DateFormatter } from '../../../lib/dateFormatter';
import { interval, of, Subscription, timer } from 'rxjs';
import { catchError, switchMap } from 'rxjs/operators';

@Component({
  selector: 'app-tournament-roundnumber-planning',
  templateUrl: './roundnumber.component.html',
  styleUrls: ['./roundnumber.component.scss']
})
export class RoundNumberPlanningComponent implements OnInit, AfterViewInit, OnDestroy {

  @Input() tournament!: Tournament;
  @Input() roundNumber!: RoundNumber;
  @Input() userRefereeId: number | string | undefined;
  @Input() roles: number = 0;
  @Input() favorites!: Favorites;
  @Input() refreshingData: boolean | undefined;
  @Output() refreshData = new EventEmitter();
  @Output() scroll = new EventEmitter();
  alert: IAlert | undefined;
  public sameDay = true;
  public breakShown: boolean = false;
  public userIsAdmin: boolean = false;
  public gameOrder: GameOrder = GameOrder.ByDate;
  public filterEnabled = false;
  public hasReferees: boolean = false;
  public hasBegun: boolean = false;
  public tournamentHasBegun: boolean = false;
  public gameDatas: GameData[] = [];
  private scoreConfigService: ScoreConfigService;
  public needsRanking: boolean = false;
  public hasMultiplePoules: boolean = false;
  private competitorMap!: CompetitorMap;
  public nameService!: NameService;
  public planningConfig!: PlanningConfig;
  public hasOnlyGameModeAgainst: boolean = true;
  private refreshTimer: Subscription | undefined;
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
  }

  ngOnInit() {
    this.competitorMap = new CompetitorMap(this.tournament.getCompetitors());
    this.nameService = new NameService(this.competitorMap);
    this.planningConfig = this.roundNumber.getValidPlanningConfig();
    const authUser = this.authService.getUser();
    const currentUser = authUser ? this.tournament.getUser(authUser) : undefined;
    this.userIsAdmin = currentUser ? currentUser.hasRoles(Role.ADMIN) : false;
    this.roles = currentUser?.getRoles() ?? 0;
    this.needsRanking = this.roundNumber.needsRanking();
    this.hasMultiplePoules = this.roundNumber.getPoules().length > 1;
    this.hasReferees = this.tournament.getCompetition().getReferees().length > 0
      || this.planningConfig.getSelfReferee() !== SelfReferee.Disabled;
    this.hasBegun = this.roundNumber.hasBegun();
    this.tournamentHasBegun = this.roundNumber.getFirst().hasBegun();
    this.loadGameData();
    this.hasOnlyGameModeAgainst = this.hasOnlyAgainstGameMode();

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
    const pouleDataMap = this.getPouleDataMap();
    this.roundNumber.getGames(this.gameOrder).forEach((game: AgainstGame | TogetherGame) => {
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
        break: this.isBreakBeforeGame(game) ? this.tournament.getBreak() : undefined
      };
      gameDatas.push(gameData);
    });
    return gameDatas;
  }

  toggleFilter() {
    this.filterEnabled = !this.filterEnabled;
    this.loadGameData();
  }

  private hasOnlyAgainstGameMode(): boolean {
    return this.tournament.getCompetition().getSports().every((competitionSport: CompetitionSport): boolean => {
      return competitionSport.getVariant() instanceof AgainstSportVariant;
    });
  }

  isAgainst(game: AgainstGame | TogetherGame): boolean {
    return (game instanceof AgainstGame);
  }

  private getPouleDataMap(): PouleDataMap {
    const pouleDatas = new PouleDataMap();
    this.roundNumber.getPoules().forEach(poule => {
      pouleDatas.set(poule.getId(), {
        name: this.nameService.getPouleName(poule, false),
        needsRanking: poule.needsRanking(),
        round: poule.getRound()
      });
    });
    return pouleDatas;
  }

  getAgainstScore(game: AgainstGame): string {
    const score = ' - ';
    if (game.getState() !== State.Finished) {
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
    if (gamePlace.getGame().getState() !== State.Finished) {
      return sScore;
    }
    const finalScore = this.scoreConfigService.getFinalTogetherScore(gamePlace);
    return finalScore === undefined ? sScore : '' + finalScore;
  }

  getTogetherScoreBtnBorderClass(gamePlace: TogetherGamePlace): string {
    return gamePlace.getGame().getState() === State.Finished ? 'success' : 'primary';
  }

  isPlayed(game: Game): boolean {
    return game.getState() === State.Finished;
  }

  canChangeResult(game: Game): boolean {
    if (this.hasRole(Role.GAMERESULTADMIN)) {
      return true;
    }
    const referee = game.getReferee();
    if (referee === undefined) {
      return false;
    }
    return this.hasRole(Role.REFEREE) && this.userRefereeId === referee.getId();
  }

  hasAdminRole(): boolean {
    return this.hasRole(Role.ADMIN);
  }

  canFilter(): boolean {
    return !this.hasRole(Role.ADMIN + Role.GAMERESULTADMIN);
  }

  protected hasRole(role: number): boolean {
    return (this.roles & role) === role;
  }
  protected isBreakBeforeGame(game: Game): boolean {
    const breakX: Period | undefined = this.tournament.getBreak();
    if (breakX === undefined || this.breakShown || !this.planningConfig.getEnableTime() || this.gameOrder === GameOrder.ByPoule) {
      return false;
    }
    const startDateTime = game.getStartDateTime();
    this.breakShown = startDateTime?.getTime() === breakX.getEndDateTime().getTime();
    return this.breakShown;
  }

  getCompetitor(place: Place): Competitor | undefined {
    const startLocation = place.getStartLocation();
    if (startLocation === undefined) {
      return undefined;
    }
    return this.competitorMap.getCompetitor(startLocation);
  }

  private hasCompetitor(place: Place): boolean {
    return this.getCompetitor(place) === undefined;
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
    const suffix = ((competitionSport.getVariant() instanceof AgainstSportVariant) ? 'against' : 'together')
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

  protected setAlert(type: string, message: string): boolean {
    this.alert = { 'type': type, 'message': message };
    return (type === 'success');
  }

  getGameQualificationDescription(game: AgainstGame | TogetherGame): string {
    if (game instanceof AgainstGame) {
      return this.nameService.getPlacesFromName(game.getSidePlaces(AgainstSide.Home), false, true)
        + ' - ' + this.nameService.getPlacesFromName(game.getSidePlaces(AgainstSide.Away), false, true);
    }
    return this.nameService.getPlacesFromName(game.getPlaces(), false, true)
  }

  openModalPouleRank(poule: Poule) {
    const modalRef = this.modalService.open(PouleRankingModalComponent, { size: 'xl' });
    modalRef.componentInstance.poule = poule;
    if (!this.roundNumber.getCompetition().hasMultipleSports()) {
      modalRef.componentInstance.competitionSport = this.roundNumber.getCompetition().getSingleSport();
    }
    modalRef.componentInstance.tournament = this.tournament;
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
    this.refreshTimer = timer(0, 1500) // repeats every 1.5 seconds
      .pipe(
        switchMap(() => this.planningRepository.progress(this.roundNumber, this.tournament).pipe()),
        catchError(err => of(undefined))
      ).subscribe(
        /* happy path */(progressPerc: number | undefined) => {
          if (progressPerc === undefined) {
            return;
          }
          this.progressPerc = progressPerc;
          if (progressPerc === 100) {
            this.stopShowProgress();
            this.planningRepository.get(this.roundNumber, this.tournament)
              .subscribe(
            /* happy path */ roundNumber => {
                  this.progressPerc = 0;
                  this.loadGameData();
                },
              /* error path */ e => { this.setAlert('danger', e); }
              );
          }
        });
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
  break: Period | undefined;
}

interface PouleData {
  name: string;
  needsRanking: boolean;
  round: Round;
}

class PouleDataMap extends Map<string | number, PouleData> { }

