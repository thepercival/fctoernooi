import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

import { StructureRepository } from '../../../lib/ngx-sport/structure/repository';
import { TournamentRepository } from '../../../lib/tournament/repository';
import { TournamentComponent } from '../component';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { LockerRoom } from '../../../lib/lockerroom';
import { MyNavigation } from '../../common/navigation';
import { AuthService } from '../../../lib/auth/auth.service';
import { Role } from '../../../lib/role';
import { NameModalComponent } from '../namemodal/namemodal.component';
import { Competitor } from 'ngx-sport';
import { LockerRoomValidator } from '../../../lib/lockerroom/validator';


@Component({
  selector: 'app-tournament-lockerrooms',
  templateUrl: './lockerrooms.component.html',
  styleUrls: ['./lockerrooms.component.scss']
})
export class LockerRoomsComponent extends TournamentComponent implements OnInit {
  lockerRooms: LockerRoom[];
  hasCompetitors = false;
  validator: LockerRoomValidator;
  changed = false;

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
  ) {
    super(route, router, tournamentRepository, sructureRepository);
  }

  ngOnInit() {
    super.myNgOnInit(() => this.initLockerRooms());
  }

  initLockerRooms() {
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
    return this.tournament && this.tournament.hasRole(this.authService.getLoggedInUserId(), Role.ADMIN);
  }

  add() {
    const activeModal = this.modalService.open(NameModalComponent);
    activeModal.componentInstance.header = 'kleedkamernaam';
    activeModal.componentInstance.range = { min: LockerRoom.MIN_LENGTH_NAME, max: LockerRoom.MAX_LENGTH_NAME };

    activeModal.result.then((result) => {
      const tmp = new LockerRoom(this.tournament, result);
      this.changed = true;
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
