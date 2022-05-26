import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

import { MyNavigation } from '../../shared/common/navigation';
import { TournamentRepository } from '../../lib/tournament/repository';
import { StructureRepository } from '../../lib/ngx-sport/structure/repository';
import { TournamentComponent } from '../../shared/tournament/component';
import { Category, Competitor, StartLocationMap, Structure, StructureEditor, StructureNameService } from 'ngx-sport';
import { Favorites } from '../../lib/favorites';
import { FavoritesRepository } from '../../lib/favorites/repository';
import { AuthService } from '../../lib/auth/auth.service';
import { Role } from '../../lib/role';
import { GlobalEventsManager } from '../../shared/common/eventmanager';

@Component({
  selector: 'app-tournament-structure-view',
  templateUrl: './view.component.html',
  styleUrls: ['./view.component.css']
})
export class StructureViewComponent extends TournamentComponent implements OnInit {
  competitors: Competitor[] = [];
  private favorites!: Favorites;
  public structureNameService!: StructureNameService;

  constructor(
    route: ActivatedRoute,
    router: Router,
    tournamentRepository: TournamentRepository,
    structureRepository: StructureRepository,
    globalEventsManager: GlobalEventsManager,
    private myNavigation: MyNavigation,
    public structureEditor: StructureEditor,
    public favRepository: FavoritesRepository,
    private authService: AuthService
  ) {
    super(route, router, tournamentRepository, structureRepository, globalEventsManager);
  }

  ngOnInit() {
    super.myNgOnInit(() => {
      this.structureNameService = new StructureNameService(new StartLocationMap(this.tournament.getCompetitors()));
      this.favorites = this.favRepository.getObject(this.tournament);
      if (this.favorites.hasCompetitors()) {
        const competitors = this.tournament.getCompetitors();
        this.competitors = this.favorites.filterCompetitors(competitors);
      }
      this.processing = false;
    });
  }

  // @TODO CDK CATEGORY - REMOVE FUNCTION
  getDefaultCategory(structure: Structure): Category {
    return structure.getCategories()[0];
  }

  navigateBack() {
    this.myNavigation.back();
  }

  isAdmin(): boolean {
    return this.hasRole(this.authService, Role.ADMIN);
  }
}
