import { Component, OnInit, TemplateRef } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { NgbAlert, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import {
  Sport,
  CompetitionSport,
  Round,
  Poule,
  NameService,
  AgainstH2h,
  AllInOneGame,
  Single,
  AgainstGpp,
  GameMode,
  PointsCalculation,
  Category,
  Structure,
} from 'ngx-sport';

import { TournamentRepository } from '../../lib/tournament/repository';
import { TournamentComponent } from '../../shared/tournament/component';
import { StructureRepository } from '../../lib/ngx-sport/structure/repository';
import { PlanningRepository } from '../../lib/ngx-sport/planning/repository';
import { CompetitionSportTab } from '../../shared/tournament/competitionSportTab';
import { CompetitionSportRepository } from '../../lib/ngx-sport/competitionSport/repository';
import { CreateSportWithFieldsComponent, SportWithFields } from '../sport/createSportWithFields.component';
import { IAlertType } from '../../shared/common/alert';
import { GameModeModalComponent } from '../gameMode/modal.component';
import { GlobalEventsManager } from '../../shared/common/eventmanager';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { TournamentNavBarComponent } from '../../shared/tournament/tournamentNavBar/tournamentNavBar.component';
import { faSpinner } from '@fortawesome/free-solid-svg-icons';
import { facSoccerField } from '../../shared/customicons';
@Component({
    selector: 'app-tournament-sport',
    templateUrl: './list.component.html',
    styleUrls: ['./list.component.scss'],
    standalone: true,
    imports: [TournamentNavBarComponent,FontAwesomeModule,NgbAlert,CreateSportWithFieldsComponent]
})
export class CompetitionSportListComponent extends TournamentComponent implements OnInit {
  public smallestNrOfPoulePlaces!: number;
  public competitionSports: CompetitionSport[] = [];
  public showCreateSportWithFields = false;
  public nameService = new NameService();
  public hasBegun!: boolean;
  public maxReached = true;

  validations: any = {
    'minlengthname': Sport.MIN_LENGTH_NAME,
    'maxlengthname': Sport.MAX_LENGTH_NAME
  };
  faSpinner = faSpinner;
  facSoccerField = facSoccerField;

  constructor(
    route: ActivatedRoute,
    router: Router,
    tournamentRepository: TournamentRepository,
    sructureRepository: StructureRepository,
    globalEventsManager: GlobalEventsManager,
    private competitionSportRepository: CompetitionSportRepository,
    private planningRepository: PlanningRepository
  ) {
    super(route, router, tournamentRepository, sructureRepository, globalEventsManager);
  }

  ngOnInit() {
    super.myNgOnInit(() => this.initSports());
  }

  initSports() {
    this.createCompetitionSportsList();
    this.smallestNrOfPoulePlaces = this.getSmallestNrOfPoulePlaces(this.structure);
    // console.log('smallestNrOfPoulePlaces', this.smallestNrOfPoulePlaces);
    this.hasBegun = this.structure.getFirstRoundNumber().hasBegun();
    this.maxReached = this.competition.getSports().length >= 10;
    this.processing.set(false);
    if (this.hasBegun) {
      this.alert.set({ type: IAlertType.Warning, message: 'er zijn al wedstrijden gespeeld, je kunt niet meer wijzigen' });
    }
  }

  protected getSmallestNrOfPoulePlaces(structure: Structure): number {
    const smallestNrOfPoulePlaces = structure.getCategories().map((category: Category): number => {
      return this.getSmallestNrOfPoulePlacesHelper(category.getRootRound());
    });
    return Math.max(...smallestNrOfPoulePlaces);
  }

  protected getSmallestNrOfPoulePlacesHelper(round: Round, smallestNrOfPoulePlaces?: number | undefined): number {
    const smallestNrOfRoundPoulePlaces = round.getPoules().map((poule: Poule) => poule.getPlaces().length)
      .reduce((min, current) => current < min ? min : current, 0);

    if (smallestNrOfPoulePlaces === undefined || smallestNrOfRoundPoulePlaces < smallestNrOfPoulePlaces) {
      smallestNrOfPoulePlaces = smallestNrOfRoundPoulePlaces;
    }
    round.getChildren().forEach((childRound: Round) => {
      smallestNrOfPoulePlaces = this.getSmallestNrOfPoulePlacesHelper(childRound, smallestNrOfPoulePlaces);
    });
    return smallestNrOfPoulePlaces;
  }

  createCompetitionSportsList() {
    this.competitionSports = this.competition.getSports();
  }

  get TabFields(): CompetitionSportTab { return CompetitionSportTab.Fields; }

  getSportsWithFields(): SportWithFields[] {
    return this.competitionSports.map((competitionSport: CompetitionSport): SportWithFields => {
      return { variant: competitionSport.getVariant(), nrOfFields: competitionSport.getFields().length };
    });
  }

  public openMultiSportsModal(content: TemplateRef<any>) {
    this.modalService.open(content, { windowClass: 'info-modal' });
  }

  public getNrOfGamePlacesDescription(sportVariant: AgainstH2h | AgainstGpp | AllInOneGame | Single): string {
    if (sportVariant instanceof AllInOneGame) {
      return 'poule-grootte';
    } else if (sportVariant instanceof Single) {
      return '' + sportVariant.getNrOfGamePlaces();
    }
    return sportVariant.getNrOfHomePlaces() + '(thuis), ' + sportVariant.getNrOfAwayPlaces() + '(uit)';
  }

  openGameModeInfoModal() {
    this.modalService.open(GameModeModalComponent, { windowClass: 'info-modal' });
  }

  add(sportWithFields: SportWithFields) {
    // const sportsName = this.sports.map((sport: Sport) => sport.getName()).join(',');
    // this.form.controls.sportsName.setValue(sportsName);
    this.showCreateSportWithFields = false;

    this.alert.set({ type: IAlertType.Info, message: 'de sport(en) worden toegevoegd' });
    this.processing.set(true);

    const gameMode = sportWithFields.variant.getGameMode();
    const pointsCalculation = gameMode === GameMode.Against ? PointsCalculation.AgainstGamePoints : PointsCalculation.Scores;
    const json = this.competitionSportRepository.sportWithFieldsToJson(pointsCalculation, sportWithFields, true);
    this.competitionSportRepository.createObject(json, this.tournament, this.structure)
      .subscribe({
        next: (competitionSport: CompetitionSport) => {
          this.planningRepository.create(this.structure, this.tournament)
            .subscribe({
              next: () => this.alert.set({ type: IAlertType.Success, message: 'de sport is toegevoegd' }),
              error: (e) => {
                this.alert.set({ type: IAlertType.Danger, message: e }); this.processing.set(false);
              },
              complete: () => this.processing.set(false)
            });
        },
        error: (e) => { this.alert.set({ type: IAlertType.Danger, message: e }); this.processing.set(false); }
      });
  }

  // addSport() {
  //   this.linkToEdit(this.tournament);
  // }

  openRemoveModal(content: TemplateRef<any>, competitionSport: CompetitionSport) {
    this.modalService.open(content).result.then((result) => {
      if (result === 'remove') {
        this.remove(competitionSport);
      }
    }, (reason) => {

    });
  }

  remove(competitionSport: CompetitionSport) {
    this.alert.set({ type: IAlertType.Info, message: 'de sport wordt verwijderd' });
    this.processing.set(true);

    this.competitionSportRepository.removeObject(competitionSport, this.tournament, this.structure)
      .subscribe({
        next: () => {
          this.planningRepository.create(this.structure, this.tournament)
            .subscribe({
              next: () => this.alert.set({ type: IAlertType.Success, message: 'de sport is verwijderd' }),
              error: (e) => {
                this.alert.set({ type: IAlertType.Danger, message: e }); this.processing.set(false);
              },
              complete: () => this.processing.set(false)
            });
        },
        error: (e) => {
          this.alert.set({ type: IAlertType.Danger, message: e }); this.processing.set(false);
        }
      });
  }

  linkToPlanningConfig() {
    this.router.navigate(['/admin/planningconfig', this.tournament.getId(),
      this.structure.getFirstRoundNumber().getNumber()
    ]);
  }
}
