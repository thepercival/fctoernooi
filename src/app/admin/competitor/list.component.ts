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
import { IAlertType } from '../../shared/common/alert';
import { GlobalEventsManager } from '../../shared/common/eventmanager';
import { CategoryChooseModalComponent } from '../../shared/tournament/category/chooseModal.component';
import { FavoritesRepository } from '../../lib/favorites/repository';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { TournamentScreen } from '../../shared/tournament/screenNames';

@Component({
  selector: 'app-tournament-competitors',
  templateUrl: './list.component.html',
  styleUrls: ['./list.component.scss']
})
export class CompetitorListComponent extends TournamentComponent implements OnInit, AfterViewChecked {

  focusId!: number | string;
  // hasBegun!: boolean;
  lockerRoomValidator!: LockerRoomValidator;
  public structureNameService!: StructureNameService;


  constructor(
    route: ActivatedRoute,
    router: Router,
    tournamentRepository: TournamentRepository,
    sructureRepository: StructureRepository,
    globalEventsManager: GlobalEventsManager,
    modalService: NgbModal,
    favRepository: FavoritesRepository,
    private planningRepository: PlanningRepository,
    private competitorRepository: CompetitorRepository,
    private myNavigation: MyNavigation
  ) {
    super(route, router, tournamentRepository, sructureRepository, globalEventsManager, modalService, favRepository);
  }

  ngOnInit() {
    super.myNgOnInit(() => {
      this.updateFavoriteCategories(this.structure);
      const competitors = this.tournament.getCompetitors();
      const startLocationMap = new StartLocationMap(competitors);
      this.structureNameService = new StructureNameService(startLocationMap);
      this.lockerRoomValidator = new LockerRoomValidator(competitors, this.tournament.getLockerRooms());
      this.initFocus(startLocationMap);
      // this.hasBegun = this.structure.getFirstRoundNumber().hasBegun();
      this.processing = false;
    });
  }

  get CompetitorsScreen(): TournamentScreen { return TournamentScreen.Competitors }
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



  removeCompetitor(competitor: TournamentCompetitor): void {
    this.processing = true;
    this.setAlert(IAlertType.Info, 'deelnemer ' + competitor.getName() + ' wordt verwijderd');
    this.competitorRepository.removeObject(competitor, this.tournament)
      .subscribe({
        next: () => {
          this.refreshCompetitors();
          this.setAlert(IAlertType.Success, 'deelnemer ' + competitor + ' is verwijderd');
        },
        error: (e) => {
          this.setAlert(IAlertType.Danger, e); this.processing = false;
        }
      });
  }

  public refreshCompetitors(): void {
    const map = new StartLocationMap(this.tournament.getCompetitors());
    this.structureNameService = new StructureNameService(map);
    this.lockerRoomValidator = new LockerRoomValidator(this.tournament.getCompetitors(), this.tournament.getLockerRooms());
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
                this.setAlert(IAlertType.Success, message);
                this.refreshCompetitors();
              },
              error: (e: string) => {
                this.setAlert(IAlertType.Danger, e); this.processing = false;
              }
            });
        },
        error: (e) => { this.setAlert(IAlertType.Danger, e); this.processing = false; }
      });
  }
}

