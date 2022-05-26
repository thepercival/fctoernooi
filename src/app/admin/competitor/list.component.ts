import { AfterViewChecked, Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import {
  Place,
  Structure,
  Category,
  StructureNameService,
  StartLocationMap,
} from 'ngx-sport';

import { MyNavigation } from '../../shared/common/navigation';
import { TournamentRepository } from '../../lib/tournament/repository';
import { StructureRepository } from '../../lib/ngx-sport/structure/repository';
import { CompetitorRepository } from '../../lib/ngx-sport/competitor/repository';
import { PlanningRepository } from '../../lib/ngx-sport/planning/repository';
import { TournamentComponent } from '../../shared/tournament/component';
import { LockerRoomValidator } from '../../lib/lockerroom/validator';
import { TournamentCompetitor } from '../../lib/competitor';
import { CompetitorMapper } from '../../lib/competitor/mapper';
import { IAlertType } from '../../shared/common/alert';
import { GlobalEventsManager } from '../../shared/common/eventmanager';

@Component({
  selector: 'app-tournament-competitors',
  templateUrl: './list.component.html',
  styleUrls: ['./list.component.scss']
})
export class CompetitorListComponent extends TournamentComponent implements OnInit, AfterViewChecked {

  focusId!: number | string;
  // hasBegun!: boolean;
  lockerRoomValidator!: LockerRoomValidator;
  areSomeCompetitorsArranged!: boolean;
  public structureNameService!: StructureNameService;

  constructor(
    route: ActivatedRoute,
    router: Router,
    tournamentRepository: TournamentRepository,
    sructureRepository: StructureRepository,
    globalEventsManager: GlobalEventsManager,
    private planningRepository: PlanningRepository,
    private competitorRepository: CompetitorRepository,
    private mapper: CompetitorMapper,
    private myNavigation: MyNavigation
  ) {
    super(route, router, tournamentRepository, sructureRepository, globalEventsManager);
  }

  ngOnInit() {
    super.myNgOnInit(() => {
      const competitors = this.tournament.getCompetitors();
      const startLocationMap = new StartLocationMap(competitors);
      this.structureNameService = new StructureNameService(startLocationMap);
      this.lockerRoomValidator = new LockerRoomValidator(competitors, this.tournament.getLockerRooms());
      this.areSomeCompetitorsArranged = this.lockerRoomValidator.areSomeArranged(); // caching
      this.initFocus(startLocationMap);
      // this.hasBegun = this.structure.getFirstRoundNumber().hasBegun();
      this.processing = false;
    });
  }

  alertType(): string { return this.alert?.type ?? IAlertType.Danger }
  alertMessage(): string { return this.alert?.message ?? '' }

  updateProcessing(message: string | false): void {
    if (message === false) {
      this.processing = false;
    } else {
      this.processing = true;
      this.setAlert(IAlertType.Info, message);
    }
  }

  ngAfterViewChecked() {
    this.myNavigation.scroll();
  }

  initFocus(startLocationMap: StartLocationMap) {
    this.structure.getCategories().some((category: Category) => {
      return category.getRootRound().getPlaces().some((place: Place) => {
        const startLocation = place.getStartLocation();
        if (startLocation && startLocationMap.getCompetitor(startLocation) === undefined) {
          this.focusId = place.getId();
          return true;
        }
        return false;
      });
    });
  }

  /**
   * verwijder de deelnemer van de pouleplek
   */
  registerCompetitor(competitor: TournamentCompetitor): void {
    this.processing = true;
    const jsonCompetitor = this.mapper.toJson(competitor);
    jsonCompetitor.registered = competitor.getRegistered() === true ? false : true;
    const prefix = jsonCompetitor.registered ? 'aan' : 'af';
    this.setAlert(IAlertType.Info, 'deelnemer ' + competitor.getName() + ' wordt ' + prefix + 'gemeld');
    this.competitorRepository.editObject(jsonCompetitor, competitor, this.tournament)
      .subscribe({
        next: (competitorRes: TournamentCompetitor) => {
          this.setAlert(IAlertType.Success, 'deelnemer ' + competitor.getName() + ' is ' + prefix + 'gemeld');
        },
        error: (e) => {
          this.setAlert(IAlertType.Danger, e); this.processing = false;
        },
        complete: () => this.processing = false
      });
  }



  removeCompetitor(competitor: TournamentCompetitor): void {
    this.processing = true;
    this.setAlert(IAlertType.Info, 'deelnemer ' + competitor.getName() + ' wordt verwijderd');
    this.competitorRepository.removeObject(competitor, this.tournament)
      .subscribe({
        next: () => {
          this.structureNameServiceUpdate();
          this.setAlert(IAlertType.Success, 'deelnemer ' + competitor + ' is verwijderd');
        },
        error: (e) => {
          this.setAlert(IAlertType.Danger, e); this.processing = false;
        }
      });
  }

  public structureNameServiceUpdate(): void {
    const map = new StartLocationMap(this.tournament.getCompetitors());
    this.structureNameService = new StructureNameService(map);
    this.processing = false;
  }

  public saveStructure(message: string) {
    this.structureRepository.editObject(this.structure, this.tournament)
      .subscribe({
        next: (structure: Structure) => {
          this.structure = structure;
          this.planningRepository.create(this.structure, this.tournament, 1)
            .subscribe({
              next: () => {
                this.structureNameService = new StructureNameService(new StartLocationMap(this.tournament.getCompetitors()));
                this.setAlert(IAlertType.Success, message);
              },
              error: (e) => {
                this.setAlert(IAlertType.Danger, e); this.processing = false;
              },
              complete: () => this.processing = false
            });
        },
        error: (e) => { this.setAlert(IAlertType.Danger, e); this.processing = false; }
      });
  }
}

