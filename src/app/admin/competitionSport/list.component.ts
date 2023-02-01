import { Component, OnInit, TemplateRef } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import {
  Sport,
  CompetitionSport,
  PouleStructure,
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
import { SportWithFields } from '../sport/createSportWithFields.component';
import { IAlertType } from '../../shared/common/alert';
import { GameModeModalComponent } from '../gameMode/modal.component';
import { GlobalEventsManager } from '../../shared/common/eventmanager';
import { FavoritesRepository } from '../../lib/favorites/repository';
@Component({
  selector: 'app-tournament-sport',
  templateUrl: './list.component.html',
  styleUrls: ['./list.component.scss']
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

  constructor(
    route: ActivatedRoute,
    router: Router,
    tournamentRepository: TournamentRepository,
    sructureRepository: StructureRepository,
    globalEventsManager: GlobalEventsManager,
    modalService: NgbModal,
    favRepository: FavoritesRepository,
    private competitionSportRepository: CompetitionSportRepository,
    private planningRepository: PlanningRepository
  ) {
    super(route, router, tournamentRepository, sructureRepository, globalEventsManager, modalService, favRepository);
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
    this.processing = false;
    if (this.hasBegun) {
      this.setAlert(IAlertType.Warning, 'er zijn al wedstrijden gespeeld, je kunt niet meer wijzigen');
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

    this.setAlert(IAlertType.Info, 'de sport(en) worden toegevoegd');
    this.processing = true;

    const gameMode = sportWithFields.variant.getGameMode();
    const pointsCalculation = gameMode === GameMode.Against ? PointsCalculation.AgainstGamePoints : PointsCalculation.Scores;
    const json = this.competitionSportRepository.sportWithFieldsToJson(pointsCalculation, sportWithFields, true);
    this.competitionSportRepository.createObject(json, this.tournament, this.structure)
      .subscribe({
        next: (competitionSport: CompetitionSport) => {
          this.planningRepository.create(this.structure, this.tournament)
            .subscribe({
              next: () => this.setAlert(IAlertType.Success, 'de sport is toegevoegd'),
              error: (e) => {
                this.setAlert(IAlertType.Danger, e); this.processing = false;
              },
              complete: () => this.processing = false
            });
        },
        error: (e) => { this.setAlert(IAlertType.Danger, e); this.processing = false; }
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
    this.setAlert(IAlertType.Info, 'de sport wordt verwijderd');
    this.processing = true;

    this.competitionSportRepository.removeObject(competitionSport, this.tournament, this.structure)
      .subscribe({
        next: () => {
          this.planningRepository.create(this.structure, this.tournament)
            .subscribe({
              next: () => this.setAlert(IAlertType.Success, 'de sport is verwijderd'),
              error: (e) => {
                this.setAlert(IAlertType.Danger, e); this.processing = false;
              },
              complete: () => this.processing = false
            });
        },
        error: (e) => {
          this.setAlert(IAlertType.Danger, e); this.processing = false;
        }
      });
  }
}
