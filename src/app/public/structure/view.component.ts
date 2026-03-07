import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

import { MyNavigation } from '../../shared/common/navigation';
import { TournamentRepository } from '../../lib/tournament/repository';
import { StructureRepository } from '../../lib/ngx-sport/structure/repository';
import { TournamentComponent } from '../../shared/tournament/component';
import { Category, Competitor, StartLocationMap, Structure, StructureEditor, StructureNameService } from 'ngx-sport';
import { Favorites } from '../../lib/favorites';
import { AuthService } from '../../lib/auth/auth.service';
import { Role } from '../../lib/role';
import { GlobalEventsManager } from '../../shared/common/eventmanager';
import { TournamentScreen } from '../../shared/tournament/screenNames';
import { IconDefinition } from '@fortawesome/fontawesome-svg-core';
import { WebsitePart } from '../../shared/tournament/structure/admin-public-switcher.component';
import { AdminPublicSwitcherComponent } from '../../shared/tournament/structure/admin-public-switcher.component';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { StructureRoundComponent } from '../../shared/tournament/structure/round.component';
import { StructureCategoryComponent } from '../../shared/tournament/structure/category.component';
import { TournamentNavBarComponent } from '../../shared/tournament/tournamentNavBar/tournamentNavBar.component';
import { faEye, faEyeSlash, faSpinner } from '@fortawesome/free-solid-svg-icons';
import { facStructure } from '../../shared/customicons';

@Component({
    selector: 'app-tournament-structure-view',
    templateUrl: './view.component.html',
    styleUrls: ['./view.component.scss'],
  imports: [AdminPublicSwitcherComponent, FontAwesomeModule, StructureRoundComponent, StructureCategoryComponent, TournamentNavBarComponent]
    
})
export class StructureViewComponent extends TournamentComponent implements OnInit {
  faSpinner = faSpinner;
  facStructure = facStructure;
  competitors: Competitor[] = [];
  private favorites!: Favorites;
  public structureNameService!: StructureNameService;
  public showCompetitors = true;

  constructor(
    route: ActivatedRoute,
    router: Router,
    tournamentRepository: TournamentRepository,
    structureRepository: StructureRepository,
    globalEventsManager: GlobalEventsManager,
    private myNavigation: MyNavigation,
    public structureEditor: StructureEditor,
    private authService: AuthService
  ) {
    super(route, router, tournamentRepository, structureRepository, globalEventsManager);
  }

  ngOnInit() {
    super.myNgOnInit(() => {
      
      this.updateFavoriteCategories(this.structure);
      this.structureNameService = new StructureNameService(new StartLocationMap(this.tournament.getCompetitors()));
      this.favorites = this.favRepository.getObject(this.tournament, this.structure.getCategories());
      if (this.favorites.hasCompetitors()) {
        const competitors = this.tournament.getCompetitors();
        this.competitors = this.favorites.filterCompetitors(competitors);
      }
      this.processing.set(false);
    });
  }

  get StructureScreen(): TournamentScreen { return TournamentScreen.Structure }
  get PublicWebsitePart(): WebsitePart { return WebsitePart.Public } 

  showCompetitorIconClass(): IconDefinition {
    return this.showCompetitors ? faEyeSlash : faEye;
  }

  isCategoryFilterActive(): boolean {
    return this.favorites.hasCategories() && this.favoriteCategories().length > 0
  }

  navigateBack() {
    this.myNavigation.back();
  }

  isAdmin(): boolean {
    return this.hasRole(this.authService, Role.Admin);
  }
}
