import { Component, Injector, OnInit, inject } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';

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
import { NgbAlert } from '@ng-bootstrap/ng-bootstrap';
import { TournamentScreen } from '../../shared/tournament/screenNames';
import { OptionalGameColumn, RoundNumberPlanningComponent } from '../../shared/tournament/games/roundnumber.component';
import { TournamentCompetitor } from '../../lib/competitor';
import { CategoryChooseModalComponent } from '../../shared/tournament/category/chooseModal.component';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { TournamentNavBarComponent } from '../../shared/tournament/tournamentNavBar/tournamentNavBar.component';
import { faSpinner } from '@fortawesome/free-solid-svg-icons';
import { CATEGORY_CHOOSE_MODAL_INPUTS } from '../../shared/modal-input-interfaces/category-choose-modal-inputs.interface';
import { createModalInjector } from '../../shared/modal-input-interfaces/create-modal-injector';

@Component({
    selector: 'app-tournament-games-edit',
    templateUrl: './list.component.html',
    styleUrls: ['./list.component.css'],
    standalone: true,
    imports: [NgbAlert,FontAwesomeModule,RoundNumberPlanningComponent,TournamentNavBarComponent,RouterLink]
})
export class GameListComponent extends TournamentComponent implements OnInit {
  private authService = inject(AuthService);
  private myNavigation = inject(MyNavigation);

  faSpinner = faSpinner;
  userRefereeId: number | string | undefined;
  roles: Role[] = [];
  public structureNameService!: StructureNameService;
  public categoryMap: Map<number, Category> = new Map();
  public optionalGameColumns: Map<OptionalGameColumn, boolean> = new Map();  constructor() {
    const route = inject(ActivatedRoute);
    const router = inject(Router);
    const tournamentRepository = inject(TournamentRepository);
    const structureRepository = inject(StructureRepository);
    const globalEventsManager = inject(GlobalEventsManager);

    super(route, router, tournamentRepository, structureRepository, globalEventsManager);
  }

  ngOnInit() {
    super.myNgOnInit(() => {
      this.updateFavoriteCategories(this.structure);
      const loggedInUserId = this.authService.getLoggedInUserId();
      const tournamentUser = loggedInUserId ? this.tournament.getUser(loggedInUserId) : undefined;
      if (tournamentUser === undefined) {
        this.processing.set(false);
        return;
      }
      this.initGameColumnDefinitions(this.structure);
      const startLocationMap = new StartLocationMap(this.tournament.getCompetitors());
      this.structureNameService = new StructureNameService(startLocationMap);
      this.roles = tournamentUser ? tournamentUser.getRoles() : [];
      this.getUserRefereeId(tournamentUser)
        .subscribe({
          next: (userRefereeId: string | number | undefined) => {
            this.userRefereeId = userRefereeId;
            this.processing.set(false);
          },
          error: (e) => this.processing.set(false)
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
    return this.roles.includes(Role.Admin);
  }

  getUserRefereeId(tournamentUser: TournamentUser): Observable<string | number | undefined> {
    if (!tournamentUser.hasRole(Role.Referee)) {
      return of(0);
    }
    return this.tournamentRepository.getUserRefereeId(this.tournament);
  }

  scroll() {
    this.myNavigation.scroll();
  }

  openCategoriesChooseModal(structure: Structure) {
    const modalInjector = createModalInjector(this.injector, CATEGORY_CHOOSE_MODAL_INPUTS, {
      categories: structure.getCategories(),
      tournament: this.tournament
    });
    const activeModal = this.modalService.open(CategoryChooseModalComponent, { injector: modalInjector });
    activeModal.result.then((result) => {
    }, (reason) => {
        this.updateFavoriteCategories(structure);
    });
}
}
