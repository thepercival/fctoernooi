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
import { TournamentRegistrationRepository } from '../../lib/tournament/registration/repository';
import { JsonRegistrationSettings } from '../../lib/tournament/registration/settings/json';
import { TournamentRegistrationSettings } from '../../lib/tournament/registration/settings';
import { TournamentRegistrationTextSubject } from '../../lib/tournament/registration/text';
import { TextEditorModalComponent } from '../textEditor/texteditormodal.component';

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
  public activeTab!: number;
  public hasBegun!: boolean;
  public registrationSettings: TournamentRegistrationSettings|undefined;
  public showRegistrationSettings: boolean = false;
  public showRegistrationFormBtn: boolean = false;

  constructor(
    route: ActivatedRoute,
    router: Router,
    tournamentRepository: TournamentRepository,
    sructureRepository: StructureRepository,
    globalEventsManager: GlobalEventsManager,
    modalService: NgbModal,
    favRepository: FavoritesRepository,
    private tournamentRegistrationRepository: TournamentRegistrationRepository,
    private planningRepository: PlanningRepository,
    private competitorRepository: CompetitorRepository,
    private myNavigation: MyNavigation
  ) {
    super(route, router, tournamentRepository, sructureRepository, globalEventsManager, modalService, favRepository);
  }

  ngOnInit() {
    this.route.params.subscribe(params => {
        this.activeTab = +params.tabId;
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

            this.tournamentRegistrationRepository.getSettings(this.tournament)
              .subscribe({
                next: (settings: TournamentRegistrationSettings) => {
                  this.registrationSettings = settings;
                  this.showRegistrationSettings = !settings.isEnabled();
                  this.showRegistrationFormBtn = settings.isEnabled();
                  this.processing = false;
                },
                error: (e: string) => {
                  this.setAlert(IAlertType.Danger, e + ', instellingen niet gevonden');
                  this.processing = false;
                }
              });
          },
          error: (e: string) => {            
            this.setAlert(IAlertType.Danger, e + ', instellingen niet gevonden');
            this.processing = false;
          }
        });      
  }


  get CompetitorsScreen(): TournamentScreen { return TournamentScreen.Competitors }
  alertType(): string { return this.alert?.type ?? IAlertType.Danger }
  alertMessage(): string { return this.alert?.message ?? '' }

  updateProcessing(message: string): void {
    if (message.length === 0) {
      this.processing = false;
    } else {
      this.processing = true;
      this.setAlert(IAlertType.Info, message);
    }
  }

  onTabChange(tabId: CompetitorTab) {
    window.history.replaceState({}, '', 'admin/competitors/' + this.tournament.getId() + '/' + tabId);
  }

  ngAfterViewChecked() {
    this.myNavigation.scroll();
  }

  updateLinkToRegistrationForm(enabled: boolean): void {
    this.showRegistrationFormBtn = enabled;
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

  toggleShowRegistrationSettings(): void {
    this.showRegistrationSettings = !this.showRegistrationSettings; 
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
    console.log('refreshCompetitors');
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
          this.planningRepository.create(this.structure, this.tournament)
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

  get TabBase(): number { return CompetitorTab.Base; }  
  get TabOrder(): number { return CompetitorTab.Order; }
  get TabSignUp(): number { return CompetitorTab.SignUp; }
  get TabRegister(): number { return CompetitorTab.Register; }

  getTextSubjects(): TournamentRegistrationTextSubject[] {
    return [
      TournamentRegistrationTextSubject.Accept, TournamentRegistrationTextSubject.AcceptAsSubstitute
      , TournamentRegistrationTextSubject.Decline]
  }


  getTextSubjectDescription(subject: TournamentRegistrationTextSubject): string {
    if (subject === TournamentRegistrationTextSubject.Accept) {
      return 'tekst bevestiging'
    }
    if (subject === TournamentRegistrationTextSubject.AcceptAsSubstitute) {
      return 'tekst als-reserve'
    }
    return 'tekst afwijzing'
  }

  openTextEditorModal(subject: TournamentRegistrationTextSubject): void {
    this.tournamentRegistrationRepository.getText(this.tournament, subject)
      .subscribe({
        next: (text: string) => {
          // console.log(text);
          const activeModal = this.modalService.open(TextEditorModalComponent, { size: 'xl' });
          activeModal.componentInstance.header = this.getTextSubjectDescription(subject);
          activeModal.componentInstance.tournament = this.tournament;
          activeModal.componentInstance.subject = subject;
          activeModal.componentInstance.initialText = text;

          activeModal.result.then((newText: string) => {
            // this.registrationRepository.editText(newText, this.tournament, this.subject)
            //   .subscribe({
            //     next: (text: string) => {
            //       this.text = text;
            //       this.copied = false;
            //     }
            //   });
          }, (reason) => {
          });
        }
      });
  }
}

export enum CompetitorTab {
  Base = 1, SignUp, Order, Register
}