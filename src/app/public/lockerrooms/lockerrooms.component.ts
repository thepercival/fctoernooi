import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { CategoryMap } from 'ngx-sport';
import { AuthService } from '../../lib/auth/auth.service';
import { TournamentCompetitor } from '../../lib/competitor';
import { Favorites } from '../../lib/favorites';
import { FavoritesRepository } from '../../lib/favorites/repository';
import { LockerRoom } from '../../lib/lockerroom';
import { StructureRepository } from '../../lib/ngx-sport/structure/repository';
import { Role } from '../../lib/role';
import { TournamentRepository } from '../../lib/tournament/repository';
import { IAlertType } from '../../shared/common/alert';
import { GlobalEventsManager } from '../../shared/common/eventmanager';
import { TournamentComponent } from '../../shared/tournament/component';
import { TournamentScreen } from '../../shared/tournament/screenNames';


@Component({
  selector: 'app-tournament-lockerrooms-view',
  templateUrl: './lockerrooms.component.html',
  styleUrls: ['./lockerrooms.component.scss']
})
export class LockerRoomsViewComponent extends TournamentComponent implements OnInit {
  hasCompetitors = false;
  favorites!: Favorites;
  favoriteLockerRooms!: LockerRoom[];

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
    this.favorites = this.favRepository.getObject(this.tournament, this.favoriteCategories);
    this.updateFavoriteCategories(this.structure);
    this.hasCompetitors = this.tournament.getCompetitors().length > 0;
    this.initFavoriteLockerRoom();
    if (this.favoriteLockerRooms.length === 0) {
      let msg = 'er is geen kleedkamer gevonden';
      if (!this.favorites.hasCompetitors()) {
        msg += ', voeg een favoriet toe';
      } else {
        if (this.structure.hasSingleCategory()) {
          msg += ', pas je favorieten';
        }
        else {
          if (!this.favorites.hasCompetitors()) {
            msg += ', pas categoriën aan';
          }
        }
      }
      this.setAlert(IAlertType.Info, msg);
    }
    this.processing = false;
  }

  hasFavorite(lockerRoom: LockerRoom): boolean {
    return lockerRoom.getCompetitors().some((competitor: TournamentCompetitor): boolean => {
      return this.favorites.hasCompetitor(competitor);
    });
  }

  initFavoriteLockerRoom() {
    this.favoriteLockerRooms = this.tournament.getLockerRooms().filter(lockerRoom => this.hasFavorite(lockerRoom));
  }

  isAdmin(): boolean {
    return this.hasRole(this.authService, Role.Admin);
  }

  get LockerRoomsScreen(): TournamentScreen { return TournamentScreen.LockerRooms }
}
