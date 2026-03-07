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
import { NgbAlert, NgbModal, NgbNav } from '@ng-bootstrap/ng-bootstrap';
import { TournamentScreen } from '../../shared/tournament/screenNames';
import { TournamentRegistrationRepository } from '../../lib/tournament/registration/repository';
import { TournamentRegistrationSettings } from '../../lib/tournament/registration/settings';
import { CompetitorTab, RegistrationTab } from '../../shared/common/tab-ids';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { CategoryBaseCompetitorListComponent } from "./category.base.component";
import { ReactiveFormsModule } from '@angular/forms';
import { CategoryOrderCompetitorListComponent } from "./category.order.component";
import { RegistrationsNavComponent } from "./registrations/nav.component";
import { CompetitorPresentListComponent } from "./present.component";
import { TournamentNavBarComponent } from "../../shared/tournament/tournamentNavBar/tournamentNavBar.component";
import { faSpinner } from '@fortawesome/free-solid-svg-icons';

@Component({
    selector: 'app-tournament-competitors',
    templateUrl: './list.component.html',
    styleUrls: ['./list.component.scss'],
    standalone: true,
    imports: [NgbAlert, FontAwesomeModule, CategoryBaseCompetitorListComponent, ReactiveFormsModule, NgbNav, CategoryOrderCompetitorListComponent, RegistrationsNavComponent, CompetitorPresentListComponent, TournamentNavBarComponent]
})
export class CompetitorListComponent extends TournamentComponent implements OnInit, AfterViewChecked {

  focusId!: number | string;
  // hasBegun!: boolean;
  lockerRoomValidator!: LockerRoomValidator;
  public structureNameService!: StructureNameService;
  public activeTab!: number;
  public activeRegistrationTab: RegistrationTab|undefined;
  public hasBegun!: boolean;
  public registrationSettings: TournamentRegistrationSettings|undefined;

  faSpinner = faSpinner;
  
  constructor(
    route: ActivatedRoute,
    router: Router,
    tournamentRepository: TournamentRepository,
    sructureRepository: StructureRepository,
    globalEventsManager: GlobalEventsManager,
    private tournamentRegistrationRepository: TournamentRegistrationRepository,
    private planningRepository: PlanningRepository,
    private competitorRepository: CompetitorRepository,
    private myNavigation: MyNavigation
  ) {
    super(route, router, tournamentRepository, sructureRepository, globalEventsManager);
  }

  ngOnInit() {
    this.route.params.subscribe(params => {
        this.activeTab = +params.tabId;
        this.activeRegistrationTab = params.registrationTabId !== undefined ? +params.registrationTabId : undefined; 
        super.myNgOnInit(() => this.postInit(), false);
      });
      
  }

  postInit() {    

    this.competitorRepository.reloadObjects(this.tournament, true)
        .subscribe({
          next: (competitors: TournamentCompetitor[]) => {
            
            this.updateFavoriteCategories(this.structure);
            const startLocationMap = new StartLocationMap(competitors);
            this.structureNameService = new StructureNameService(startLocationMap);
            this.lockerRoomValidator = new LockerRoomValidator(competitors, this.tournament.getLockerRooms());
            this.initFocus(startLocationMap);
            this.hasBegun = this.structure.getFirstRoundNumber().hasBegun();
            this.processing.set(false);
          },
          error: (e: string) => {            
            this.alert.set({ type: IAlertType.Danger, message: e + ', instellingen niet gevonden' });
            this.processing.set(false);
          }
        });      
  }


  get CompetitorsScreen(): TournamentScreen { return TournamentScreen.Competitors }
  alertType(): string { return this.alert()?.type ?? IAlertType.Danger }
  alertMessage(): string { return this.alert()?.message ?? '' }

  updateProcessing(message: string): void {
    if (message.length === 0) {
      this.processing.set(false);
    } else {
      this.processing.set(true);
      this.alert.set({ type: IAlertType.Info, message });
    }
  }

  onTabChange(tabId: CompetitorTab) {
    window.history.replaceState({}, '', 'admin/competitors/' + this.tournament.getId() + '/' + tabId);
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
    this.processing.set(true);
    this.alert.set({ type: IAlertType.Info, message: 'deelnemer ' + competitor.getName() + ' wordt verwijderd' });
    this.competitorRepository.removeObject(competitor, this.tournament)
      .subscribe({
        next: () => {
          this.refreshCompetitors();
          this.alert.set({ type: IAlertType.Success, message: 'deelnemer ' + competitor + ' is verwijderd' });
        },
        error: (e) => {
          this.alert.set({ type: IAlertType.Danger, message: e }); this.processing.set(false);
        }
      });
  }

  public refreshCompetitors(): void {
    const map = new StartLocationMap(this.tournament.getCompetitors());
    this.structureNameService = new StructureNameService(map);
    this.lockerRoomValidator = new LockerRoomValidator(this.tournament.getCompetitors(), this.tournament.getLockerRooms());
    this.processing.set(false);
  }

  public saveStructure(message: string) {
    this.structureRepository.editObject(this.structure, this.tournament)
      .subscribe({
        next: (structure: Structure) => {
          this.structure = structure;
          this.updateFavoriteCategories(this.structure);
          this.planningRepository.create(this.structure, this.tournament)
            .subscribe({
              next: () => {
                this.alert.set({ type: IAlertType.Success, message });
                this.refreshCompetitors();
              },
              error: (e: string) => {
                this.alert.set({ type: IAlertType.Danger, message: e }); this.processing.set(false);
              }
            });
        },
        error: (e) => { this.alert.set({ type: IAlertType.Danger, message: e }); this.processing.set(false); }
      });
  }

  openCategoriesChooseModal(structure: Structure) {
    const activeModal = this.modalService.open(CategoryChooseModalComponent);
    activeModal.componentInstance.categories = structure.getCategories();
    activeModal.componentInstance.tournament = this.tournament;
    activeModal.result.then((result) => {
    }, (reason) => {
        this.updateFavoriteCategories(structure);
    });
  }

  get TabBase(): number { return CompetitorTab.Base; }  
  get TabOrder(): number { return CompetitorTab.Order; }
  get TabRegistrations(): number { return CompetitorTab.Registrations; }
  get TabPresent(): number { return CompetitorTab.Present; }
}