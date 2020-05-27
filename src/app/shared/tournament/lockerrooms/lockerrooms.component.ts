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



@Component({
  selector: 'app-tournament-lockerrooms',
  templateUrl: './lockerrooms.component.html',
  styleUrls: ['./lockerrooms.component.scss']
})
export class LockerRoomsComponent extends TournamentComponent implements OnInit {
  lockerRooms: LockerRoom[];
  hasCompetitors = false;
  validator: LockerRoomValidator;
  favorites: Favorites;
  changed = false;
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
    private myNavigation: MyNavigation,
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
      this.favorites = this.favRepository.getItem(this.tournament);
      this.editMode = false;
    }
    const competitors = this.structure.getFirstRoundNumber().getCompetitors();
    this.validator = new LockerRoomValidator(competitors, this.tournament.getLockerRooms());
    this.hasCompetitors = competitors.length > 0;

    this.lockerRooms = this.tournament.getLockerRooms();

    if (this.hasCompetitors && this.validator.areAllArranged()) {
      this.setAlert('success', 'alle deelnemers zijn ingedeeld');
    }

    this.processing = false;
  }

  isAdmin(): boolean {
    return this.tournament?.getUser(this.authService.getUser())?.hasRoles(Role.ADMIN);
  }

  add() {
    const modal = this.getChangeNameModel();
    modal.result.then((result) => {
      const lockerRoom = new LockerRoom(this.tournament, result);
      this.changeCompetitors(lockerRoom);
    }, (reason) => {
    });
  }

  remove(lockerRoom: LockerRoom) {
    const idx = this.lockerRooms.indexOf(lockerRoom);
    if (idx >= 0) {
      this.lockerRooms.splice(idx, 1);
      this.changed = true;
    }
  }

  changeName(lockerRoom: LockerRoom) {
    const modal = this.getChangeNameModel();
    modal.componentInstance.name = lockerRoom.getName();
    modal.result.then((result) => {
      lockerRoom.setName(result);
      this.changed = true;
    });
  }

  getChangeNameModel(): NgbModalRef {
    const activeModal = this.modalService.open(NameModalComponent);
    activeModal.componentInstance.header = 'kleedkamernaam';
    activeModal.componentInstance.range = { min: LockerRoom.MIN_LENGTH_NAME, max: LockerRoom.MAX_LENGTH_NAME };
    activeModal.componentInstance.buttonName = 'naar deelnemers toevoegen';
    activeModal.componentInstance.labelName = 'naam';
    activeModal.componentInstance.buttonOutline = true;
    return activeModal;
  }

  changeCompetitors(lockerRoom: LockerRoom) {
    console.log(this.validator.getCompetitors());
    const activeModal = this.modalService.open(CompetitorChooseModalComponent);
    activeModal.componentInstance.validator = this.validator;
    activeModal.componentInstance.places = this.structure.getFirstRoundNumber().getPlaces();
    activeModal.componentInstance.lockerRoom = lockerRoom;
    activeModal.componentInstance.selectedCompetitors = lockerRoom.getCompetitors().slice();
    activeModal.result.then((selectedCompetitors: Competitor[]) => {
      console.log(selectedCompetitors);
      console.log(lockerRoom.getCompetitors());
      lockerRoom.getCompetitors().splice(0);
      selectedCompetitors.forEach((selectedCompetito: Competitor) => lockerRoom.getCompetitors().push(selectedCompetito));
      this.changed = true;
    }, (reason) => { });
  }


  save() {
    this.setAlert('info', 'de kleedkamers worden opgeslagen');
    this.processing = true;

    this.tournamentRepository.syncLockerRooms(this.tournament)
      .subscribe(
        /* happy path */ lockerRoomRes => {
          this.myNavigation.back();
        },
        /* error path */ e => { this.setAlert('danger', e); this.processing = false; },
        /* onComplete */() => { this.setAlert('success', 'de kleedkamers zijn opgeslagen'); this.processing = false; }
      );
  }
}
