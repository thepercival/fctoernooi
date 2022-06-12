import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { AuthService } from '../../lib/auth/auth.service';
import { Favorites } from '../../lib/favorites';
import { FavoritesRepository } from '../../lib/favorites/repository';
import { LockerRoom } from '../../lib/lockerroom';
import { StructureRepository } from '../../lib/ngx-sport/structure/repository';
import { Role } from '../../lib/role';
import { TournamentRepository } from '../../lib/tournament/repository';
import { GlobalEventsManager } from '../../shared/common/eventmanager';
import { TournamentComponent } from '../../shared/tournament/component';


@Component({
  selector: 'app-tournament-lockerrooms-view',
  templateUrl: './lockerrooms.component.html',
  styleUrls: ['./lockerrooms.component.scss']
})
export class LockerRoomsViewComponent extends TournamentComponent implements OnInit {
  hasCompetitors = false;
  favorites!: Favorites;
  editMode: boolean = true;

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
    private authService: AuthService
  ) {
    super(route, router, tournamentRepository, sructureRepository, globalEventsManager, modalService, favRepository);
  }

  ngOnInit() {
    super.myNgOnInit(() => this.initLockerRooms());
  }

  initLockerRooms() {
    this.hasCompetitors = this.tournament.getCompetitors().length > 0;
    this.processing = false;
  }

  isAdmin(): boolean {
    return this.hasRole(this.authService, Role.Admin);
  }
}
