import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

import { AuthService } from '../../lib/auth/auth.service';
import { MyNavigation } from '../../shared/common/navigation';
import { Role } from '../../lib/role';
import { TournamentRepository } from '../../lib/tournament/repository';
import { TournamentComponent } from '../../shared/tournament/component';
import { StructureRepository } from '../../lib/ngx-sport/structure/repository';
import { TournamentUser } from '../../lib/tournament/user';
import { Observable, of } from 'rxjs';
import { GlobalEventsManager } from '../../shared/common/eventmanager';
import { Category, RoundNumber, SelfReferee, StartLocationMap, Structure, StructureNameService } from 'ngx-sport';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { FavoritesRepository } from '../../lib/favorites/repository';
import { TournamentScreen } from '../../shared/tournament/screenNames';
import { OptionalGameColumn } from '../../shared/tournament/games/roundnumber.component';
import { TournamentCompetitor } from '../../lib/competitor';

@Component({
  selector: 'app-tournament-games-edit',
  templateUrl: './list.component.html',
  styleUrls: ['./list.component.css']
})
export class GameListComponent extends TournamentComponent implements OnInit {
  userRefereeId: number | string | undefined;
  roles: number = 0;
  public structureNameService!: StructureNameService;
  public categoryMap: Map<number, Category> = new Map();
  public optionalGameColumns: Map<OptionalGameColumn, boolean> = new Map(); 

  constructor(
    route: ActivatedRoute,
    router: Router,
    tournamentRepository: TournamentRepository,
    structureRepository: StructureRepository,
    globalEventsManager: GlobalEventsManager,
    modalService: NgbModal,
    favRepository: FavoritesRepository,
    private authService: AuthService,
    private myNavigation: MyNavigation,
  ) {
    super(route, router, tournamentRepository, structureRepository, globalEventsManager, modalService, favRepository);
  }

  ngOnInit() {
    super.myNgOnInit(() => {
      this.updateFavoriteCategories(this.structure);
      const loggedInUserId = this.authService.getLoggedInUserId();
      const tournamentUser = loggedInUserId ? this.tournament.getUser(loggedInUserId) : undefined;
      if (tournamentUser === undefined) {
        this.processing = false;
        return;
      }
      this.initGameColumnDefinitions(this.structure);
      const startLocationMap = new StartLocationMap(this.tournament.getCompetitors());
      this.structureNameService = new StructureNameService(startLocationMap);
      this.roles = tournamentUser ? tournamentUser.getRoles() : 0;
      this.getUserRefereeId(tournamentUser)
        .subscribe({
          next: (userRefereeId: string | number | undefined) => {
            this.userRefereeId = userRefereeId;
            this.processing = false;
          },
          error: (e) => this.processing = false
        });
    });
  }

  private initGameColumnDefinitions(structure: Structure): void {
    let roundNumbers = structure.getRoundNumbers();
    
    const enableTime = roundNumbers.some((roundNumber: RoundNumber): boolean => {
      return roundNumber.getValidPlanningConfig().getEnableTime();
    });     
    this.optionalGameColumns.set(OptionalGameColumn.Start, enableTime);

    const nrOfReferees = this.tournament.getCompetition().getReferees().length;
    const hasSomeReferees = roundNumbers.some((roundNumber: RoundNumber): boolean => {
      return nrOfReferees > 0 || roundNumber.getValidPlanningConfig().getSelfReferee() !== SelfReferee.Disabled
    });
    this.optionalGameColumns.set(OptionalGameColumn.Referee, hasSomeReferees);
  }

  get GamesScreen(): TournamentScreen { return TournamentScreen.Games }

  hasAdminRole(): boolean {
    return (this.roles & Role.Admin) === Role.Admin;
  }

  getUserRefereeId(tournamentUser: TournamentUser): Observable<string | number | undefined> {
    if (!tournamentUser.hasRoles(Role.Referee)) {
      return of(0);
    }
    return this.tournamentRepository.getUserRefereeId(this.tournament);
  }

  scroll() {
    this.myNavigation.scroll();
  }
}
