import { Component, inject, Injector, OnInit } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { NgbModal, NgbModalRef, NgbAlert } from '@ng-bootstrap/ng-bootstrap';
import { AuthService } from '../../lib/auth/auth.service';
import { TournamentCompetitor } from '../../lib/competitor';
import { LockerRoom } from '../../lib/lockerroom';
import { JsonLockerRoom } from '../../lib/lockerroom/json';
import { LockerRoomRepository } from '../../lib/lockerroom/repository';
import { LockerRoomValidator } from '../../lib/lockerroom/validator';
import { StructureRepository } from '../../lib/ngx-sport/structure/repository';
import { Role } from '../../lib/role';
import { TournamentRepository } from '../../lib/tournament/repository';
import { IAlertType } from '../../shared/common/alert';
import { GlobalEventsManager } from '../../shared/common/eventmanager';
import { COMPETITOR_CHOOSE_MODAL_DATA, CompetitorChooseModalComponent } from '../../shared/tournament/competitor/competitorchoosemodal.component';
import { TournamentComponent } from '../../shared/tournament/component';
import { NAME_MODAL_DATA, NameModalComponent } from '../../shared/tournament/namemodal/namemodal.component';
import { CompetitorTab } from '../../shared/common/tab-ids';
import { TournamentNavBarComponent } from "../../shared/tournament/tournamentNavBar/tournamentNavBar.component";
import { LockerRoomComponent } from "../../shared/tournament/lockerroom/lockerroom.component";
import { FaIconComponent } from "@fortawesome/angular-fontawesome";
import { faSpinner } from '@fortawesome/free-solid-svg-icons';


@Component({
    selector: 'app-tournament-lockerrooms-edit',
    templateUrl: './lockerrooms.component.html',
    styleUrls: ['./lockerrooms.component.scss'],
    imports: [TournamentNavBarComponent, LockerRoomComponent, NgbAlert, FaIconComponent, RouterLink],
    
})
export class LockerRoomsEditComponent extends TournamentComponent implements OnInit {
  faSpinner = faSpinner;
  hasCompetitors = false;
  validator!: LockerRoomValidator;

  validations: any = {
    'minlengthname': LockerRoom.MIN_LENGTH_NAME,
    'maxlengthname': LockerRoom.MAX_LENGTH_NAME
  };
  modalService: NgbModal = inject(NgbModal);

  constructor(
    route: ActivatedRoute,
    router: Router,
    tournamentRepository: TournamentRepository,
    sructureRepository: StructureRepository,
    globalEventsManager: GlobalEventsManager,
    private lockerRoomRepository: LockerRoomRepository,
    private authService: AuthService
  ) {
    super(route, router, tournamentRepository, sructureRepository, globalEventsManager);
  }

  private injector = inject(Injector);

  ngOnInit() {
    super.myNgOnInit(() => this.initLockerRooms());
  }

  initLockerRooms() {
    const competitors = this.tournament.getCompetitors();
    this.validator = new LockerRoomValidator(competitors, this.tournament.getLockerRooms());
    this.hasCompetitors = competitors.length > 0;
    this.processing.set(false);
  }

  get CompetitorTabBase(): CompetitorTab { return CompetitorTab .Base }

  add() {
    const modal = this.getChangeNameModel('naar "deelnemers selecteren"', '', false);
    modal.result.then((resName: string) => {
      this.processing.set(true);
      const jsonLockerRoom: JsonLockerRoom = { id: 0, name: resName, competitorIds: [] };
      this.lockerRoomRepository.createObject(jsonLockerRoom, this.tournament)
        .subscribe({
          next: (lockerRoomRes: LockerRoom) => this.changeCompetitors(lockerRoomRes),
          error: (e) => {
            this.alert.set({ type: IAlertType.Danger, message: e }); this.processing.set(false);
          },
          complete: () => {
            this.processing.set(false)
          }
        });
    }, (reason) => {
    });
  }

  remove(lockerRoom: LockerRoom) {
    this.processing.set(true);
    this.lockerRoomRepository.removeObject(lockerRoom, this.tournament)
      .subscribe({
        next: () => { },
        error: (e) => {
          this.alert.set({ type: IAlertType.Danger, message: e }); this.processing.set(false);
        },
        complete: () => {
          this.processing.set(false)
        }
      });
  }

  changeName(lockerRoom: LockerRoom) {
    const modal = this.getChangeNameModel('wijzigen', lockerRoom.getName());
    modal.result.then((result) => {
      lockerRoom.setName(result);
      this.processing.set(true);
      this.lockerRoomRepository.editObject(lockerRoom, this.tournament)
        .subscribe({
          next: () => { },
          error: (e) => {
            this.alert.set({ type: IAlertType.Danger, message: e }); this.processing.set(false);
          },
          complete: () => {
            this.processing.set(false)
          }
        });
    }, (reason) => { });
  }

  getChangeNameModel(buttonLabel: string, initialName: string = '', buttonOutline: boolean = true): NgbModalRef {
    return this.modalService.open(NameModalComponent, {
      injector: Injector.create({
        providers: [{
          provide: NAME_MODAL_DATA,
          useValue: {
            header: 'kleedkamernaam',
            range: { min: LockerRoom.MIN_LENGTH_NAME, max: LockerRoom.MAX_LENGTH_NAME },
            buttonName: buttonLabel,
            labelName: 'naam',
            buttonOutline,
            initialName
          }
        }],
        parent: this.injector
      })
    });
  }

  changeCompetitors(lockerRoom: LockerRoom) {
    if (!this.structure) {
      return;
    }
    const activeModal = this.modalService.open(CompetitorChooseModalComponent, {
      injector: Injector.create({
        providers: [{
          provide: COMPETITOR_CHOOSE_MODAL_DATA,
          useValue: {
            validator: this.validator,
            structure: this.structure,
            competitors: this.tournament.getCompetitors(),
            competitorsAssignedElsewhere: this.getCompetitorsAssignedElsewhere(lockerRoom),
            lockerRoom,
            selectedCompetitors: lockerRoom.getCompetitors().slice()
          }
        }],
        parent: this.injector
      })
    });
    activeModal.result.then((selectedCompetitors: TournamentCompetitor[]) => {
      this.processing.set(true);
      this.lockerRoomRepository.syncCompetitors(lockerRoom, selectedCompetitors)
        .subscribe({
          next: () => { },
          error: (e) => {
            this.alert.set({ type: IAlertType.Danger, message: e }); this.processing.set(false);
          },
          complete: () => this.processing.set(false)
        });
    }, (reason) => { });
  }

  private getCompetitorsAssignedElsewhere(lockerRoom: LockerRoom): TournamentCompetitor[] {
    let competitors: TournamentCompetitor[] = [];
    this.tournament.getLockerRooms().forEach((lockerRoomIt: LockerRoom) => {
      if (lockerRoomIt !== lockerRoom) {
        competitors = competitors.concat(lockerRoomIt.getCompetitors())
      }
    })
    return competitors;
  }
}
