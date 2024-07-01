import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { AuthService } from '../../lib/auth/auth.service';
import { TournamentCompetitor } from '../../lib/competitor';
import { Favorites } from '../../lib/favorites';
import { FavoritesRepository } from '../../lib/favorites/repository';
import { LockerRoom } from '../../lib/lockerroom';
import { JsonLockerRoom } from '../../lib/lockerroom/json';
import { LockerRoomRepository } from '../../lib/lockerroom/repository';
import { LockerRoomValidator } from '../../lib/lockerroom/validator';
import { StructureRepository } from '../../lib/ngx-sport/structure/repository';
import { Role } from '../../lib/role';
import { TournamentRepository } from '../../lib/tournament/repository';
import { IAlertType } from '../../shared/common/alert';
import { GlobalEventsManager } from '../../shared/common/eventmanager';
import { CompetitorChooseModalComponent } from '../../shared/tournament/competitor/competitorchoosemodal.component';
import { TournamentComponent } from '../../shared/tournament/component';
import { NameModalComponent } from '../../shared/tournament/namemodal/namemodal.component';
import { CompetitorTab } from '../../shared/common/tab-ids';


@Component({
  selector: 'app-tournament-lockerrooms-edit',
  templateUrl: './lockerrooms.component.html',
  styleUrls: ['./lockerrooms.component.scss']
})
export class LockerRoomsEditComponent extends TournamentComponent implements OnInit {
  hasCompetitors = false;
  validator!: LockerRoomValidator;

  validations: any = {
    'minlengthname': LockerRoom.MIN_LENGTH_NAME,
    'maxlengthname': LockerRoom.MAX_LENGTH_NAME
  };

  constructor(
    route: ActivatedRoute,
    router: Router,
    tournamentRepository: TournamentRepository,
    sructureRepository: StructureRepository,
    globalEventsManager: GlobalEventsManager,
    modalService: NgbModal,
    favRepository: FavoritesRepository,
    private lockerRoomRepository: LockerRoomRepository,
    private authService: AuthService
  ) {
    super(route, router, tournamentRepository, sructureRepository, globalEventsManager, modalService, favRepository);
  }

  ngOnInit() {
    super.myNgOnInit(() => this.initLockerRooms());
  }

  initLockerRooms() {
    const competitors = this.tournament.getCompetitors();
    this.validator = new LockerRoomValidator(competitors, this.tournament.getLockerRooms());
    this.hasCompetitors = competitors.length > 0;
    this.processing = false;
  }

  get CompetitorTabBase(): CompetitorTab { return CompetitorTab .Base }

  add() {
    const modal = this.getChangeNameModel('naar "deelnemers selecteren"');
    modal.result.then((resName: string) => {
      this.processing = true;
      const jsonLockerRoom: JsonLockerRoom = { id: 0, name: resName, competitorIds: [] };
      this.lockerRoomRepository.createObject(jsonLockerRoom, this.tournament)
        .subscribe({
          next: (lockerRoomRes: LockerRoom) => this.changeCompetitors(lockerRoomRes),
          error: (e) => {
            this.setAlert(IAlertType.Danger, e); this.processing = false;
          },
          complete: () => {
            this.processing = false
          }
        });
    }, (reason) => {
    });
  }

  remove(lockerRoom: LockerRoom) {
    this.processing = true;
    this.lockerRoomRepository.removeObject(lockerRoom, this.tournament)
      .subscribe({
        next: () => { },
        error: (e) => {
          this.setAlert(IAlertType.Danger, e); this.processing = false;
        },
        complete: () => {
          this.processing = false
        }
      });
  }

  changeName(lockerRoom: LockerRoom) {
    const modal = this.getChangeNameModel('wijzigen');
    modal.componentInstance.initialName = lockerRoom.getName();
    modal.result.then((result) => {
      lockerRoom.setName(result);
      this.processing = true;
      this.lockerRoomRepository.editObject(lockerRoom, this.tournament)
        .subscribe({
          next: () => { },
          error: (e) => {
            this.setAlert(IAlertType.Danger, e); this.processing = false;
          },
          complete: () => {
            this.processing = false
          }
        });
    }, (reason) => { });
  }

  getChangeNameModel(buttonLabel: string): NgbModalRef {
    const activeModal = this.modalService.open(NameModalComponent);
    activeModal.componentInstance.header = 'kleedkamernaam';
    activeModal.componentInstance.range = { min: LockerRoom.MIN_LENGTH_NAME, max: LockerRoom.MAX_LENGTH_NAME };
    activeModal.componentInstance.buttonName = buttonLabel;
    activeModal.componentInstance.labelName = 'naam';
    activeModal.componentInstance.buttonOutline = true;
    return activeModal;
  }

  changeCompetitors(lockerRoom: LockerRoom) {
    const activeModal = this.modalService.open(CompetitorChooseModalComponent);
    activeModal.componentInstance.validator = this.validator;
    if (this.structure) {
      activeModal.componentInstance.structure = this.structure;
    }
    activeModal.componentInstance.competitors = this.tournament.getCompetitors();
    activeModal.componentInstance.competitorsAssignedElsewhere = this.getCompetitorsAssignedElsewhere(lockerRoom);
    activeModal.componentInstance.lockerRoom = lockerRoom;
    activeModal.componentInstance.selectedCompetitors = lockerRoom.getCompetitors().slice();
    activeModal.result.then((selectedCompetitors: TournamentCompetitor[]) => {
      this.processing = true;
      this.lockerRoomRepository.syncCompetitors(lockerRoom, selectedCompetitors)
        .subscribe({
          next: () => { },
          error: (e) => {
            this.setAlert(IAlertType.Danger, e); this.processing = false;
          },
          complete: () => this.processing = false
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
