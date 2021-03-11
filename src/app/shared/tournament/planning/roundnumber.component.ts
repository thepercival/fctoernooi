import { AfterViewInit, Component, EventEmitter, Input, OnInit, Output, OnChanges, SimpleChanges, TemplateRef } from '@angular/core';
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
  GameMode,
  TogetherGame,
  CompetitionSport,
  AgainstSide
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

@Component({
  selector: 'app-tournament-roundnumber-planning',
  templateUrl: './roundnumber.component.html',
  styleUrls: ['./roundnumber.component.scss']
})
export class RoundNumberPlanningComponent implements OnInit, AfterViewInit, OnChanges {

  @Input() tournament!: Tournament;
  @Input() roundNumber!: RoundNumber;
  @Input() userRefereeId: number | string | undefined;
  @Input() reload: boolean | undefined;
  @Input() roles: number = 0;
  @Input() favorites!: Favorites;
  @Input() refreshingData: boolean = false;
  @Output() refreshData = new EventEmitter();
  @Output() scroll = new EventEmitter();
  alert: IAlert | undefined;
  public sameDay = true;
  public breakShown: boolean = false;
  public userIsAdmin: boolean = false;
  public gameOrder = Game.Order_By_Batch;
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
    this.reloadGameData();
  }

  ngAfterViewInit() {
    if (this.roundNumber.getNext() === undefined) {
      this.scroll.emit();
    }
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes.reload && changes.reload.currentValue !== changes.reload.previousValue && changes.reload.currentValue !== undefined) {
      if (this.gameDatas.length === 0) {
        this.reloadGameData();
      }
    }
  }

  private reloadGameData() {
    this.gameDatas = this.getGameData();
    this.sameDay = this.gameDatas.length > 1 ? this.isSameDay(this.gameDatas[0], this.gameDatas[this.gameDatas.length - 1]) : true;
  }

  get GameModeAgainst(): GameMode { return GameMode.Against; }
  get GameModeTogether(): GameMode { return GameMode.Together; }
  get Home(): AgainstSide { return AgainstSide.Home; }
  get Away(): AgainstSide { return AgainstSide.Away; }
  get SportConfigTabFields(): number { return CompetitionSportTab.Fields; }
  get SportConfigTabScore(): number { return CompetitionSportTab.Score; }

  private getGameData() {
    const gameDatas: GameData[] = [];
    const pouleDataMap = this.getPouleDataMap();
    this.roundNumber.getGames(this.gameOrder).forEach(game => {
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
    this.reloadGameData();
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
    const sScore = ' - ';
    if (game.getState() !== State.Finished) {
      return sScore;
    }
    const finalScore = this.scoreConfigService.getFinalAgainstScore(game);
    if (finalScore === undefined) {
      return sScore;
    }
    return finalScore.getHome() + sScore + finalScore.getAway();
  }

  getTogetherSingleScore(game: TogetherGame): string {
    const sScore = ' - ';
    if (game.getState() !== State.Finished) {
      return sScore;
    }
    const finalScore = this.scoreConfigService.getFinalTogetherScore(game.getTogetherPlaces()[0]);
    return finalScore === undefined ? sScore : '' + finalScore;
  }

  getScoreFinalPhase(game: TogetherGame | AgainstGame): string {
    // TODOSPORT
    // return game.getFinalPhase() === Game.Phase_ExtraTime ? '*' : '';
    return '';
  }

  getTogetherScoreButtonClass(game: Game): string {
    return game.getState() === State.Finished ? 'success' : 'primary';
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
    if (breakX === undefined || this.breakShown || !this.planningConfig.getEnableTime() || !this.gameOrder) {
      return false;
    }
    const startDateTime = game.getStartDateTime();
    this.breakShown = startDateTime?.getTime() === breakX.getEndDateTime().getTime();
    return this.breakShown;
  }

  getCompetitor(place: Place) {
    return this.competitorMap.getCompetitor(place.getStartLocation());
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
    // this.gameOrder = this.gameOrder ? undefined : Game.Order_By_Batch;
    this.reloadGameData();
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

  getGameQualificationDescription(game: Game): string {
    // TODOSPORT
    // return this.nameService.getPlacesFromName(game.getPlaces(AgainstGame.Home), false, true)
    //   + ' - ' + this.nameService.getPlacesFromName(game.getPlaces(AgainstGame.Away), false, true);
    return '';
  }

  openModalPouleRank(poule: Poule) {
    const modalRef = this.modalService.open(PouleRankingModalComponent, { size: 'xl' });
    modalRef.componentInstance.poule = poule;
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

  addGames() {

  }

  removeGames() {

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

