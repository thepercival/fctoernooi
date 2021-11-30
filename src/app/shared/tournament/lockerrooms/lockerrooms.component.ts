import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

import { StructureRepository } from '../../../lib/ngx-sport/structure/repository';
import { TournamentRepository } from '../../../lib/tournament/repository';
import { TournamentComponent } from '../component';
import { NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { LockerRoom } from '../../../lib/lockerroom';
import { MyNavigation } from '../../common/navigation';
import { AuthService } from '../../../lib/auth/auth.service';
import { Role } from '../../../lib/role';
import { NameModalComponent } from '../namemodal/namemodal.component';
import { Competitor } from 'ngx-sport';
import { LockerRoomValidator } from '../../../lib/lockerroom/validator';
import { CompetitorChooseModalComponent } from '../competitorchoosemodal/competitorchoosemodal.component';
import { FavoritesRepository } from '../../../lib/favorites/repository';
import { Favorites } from '../../../lib/favorites';
import { LockerRoomRepository } from '../../../lib/lockerroom/repository';
import { TournamentCompetitor } from '../../../lib/competitor';
import { JsonLockerRoom } from '../../../lib/lockerroom/json';



@Component({
  selector: 'app-tournament-lockerrooms',
  templateUrl: './lockerrooms.component.html',
  styleUrls: ['./lockerrooms.component.scss']
})
export class LockerRoomsComponent extends TournamentComponent implements OnInit {
  hasCompetitors = false;
  validator!: LockerRoomValidator;
  favorites!: Favorites;
  editMode: boolean = true;

  validations: any = {
    'minlengthname': LockerRoom.MIN_LENGTH_NAME,
    'maxlengthname': LockerRoom.MAX_LENGTH_NAME
  };

  constructor(
    route: ActivatedRoute,
    router: Router,
    private modalService: NgbModal,
    tournamentRepository: TournamentRepository,
    sructureRepository: StructureRepository,
    private lockerRoomRepository: LockerRoomRepository,
    private authService: AuthService,
    public favRepository: FavoritesRepository
  ) {
    super(route, router, tournamentRepository, sructureRepository);
  }

  ngOnInit() {
    super.myNgOnInit(() => this.initLockerRooms());
  }

  initLockerRooms() {
    if (this.router.url.indexOf('/public') === 0) {
      this.favorites = this.favRepository.getObject(this.tournament);
      this.editMode = false;
    }
    const competitors = this.tournament.getCompetitors();
    this.validator = new LockerRoomValidator(competitors, this.tournament.getLockerRooms());
    this.hasCompetitors = competitors.length > 0;
    this.processing = false;
  }

  isAdmin(): boolean {
    return this.hasRole(this.authService, Role.ADMIN);
  }

  add() {
    const modal = this.getChangeNameModel('naar "deelnemers selecteren"');
    modal.result.then((resName: string) => {
      this.processing = true;
      const jsonLockerRoom: JsonLockerRoom = { id: 0, name: resName, competitorIds: [] };
      this.lockerRoomRepository.createObject(jsonLockerRoom, this.tournament)
        .subscribe({
          next: (lockerRoomRes: LockerRoom) => this.changeCompetitors(lockerRoomRes),
          error: (e) => {
            this.setAlert('danger', e); this.processing = false;
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
          this.setAlert('danger', e); this.processing = false;
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
            this.setAlert('danger', e); this.processing = false;
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
      activeModal.componentInstance.places = this.structure.getFirstRoundNumber().getPlaces();
    }
    activeModal.componentInstance.competitors = this.tournament.getCompetitors();
    activeModal.componentInstance.lockerRoom = lockerRoom;
    activeModal.componentInstance.selectedCompetitors = lockerRoom.getCompetitors().slice();
    activeModal.result.then((selectedCompetitors: TournamentCompetitor[]) => {
      this.processing = true;
      this.lockerRoomRepository.syncCompetitors(lockerRoom, selectedCompetitors)
        .subscribe({
          next: () => { },
          error: (e) => {
            this.setAlert('danger', e); this.processing = false;
          },
          complete: () => this.processing = false
        });
    }, (reason) => { });
  }
}
