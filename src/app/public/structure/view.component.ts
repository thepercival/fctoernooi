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
import { TournamentScreen } from '../../shared/tournament/screenNames';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { IconName } from '@fortawesome/fontawesome-svg-core';
import { WebsitePart } from '../../shared/tournament/structure/admin-public-switcher.component';

@Component({
  selector: 'app-tournament-structure-view',
  templateUrl: './view.component.html',
  styleUrls: ['./view.component.scss']
})
export class StructureViewComponent extends TournamentComponent implements OnInit {
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
    modalService: NgbModal,
    favRepository: FavoritesRepository,
    private myNavigation: MyNavigation,
    public structureEditor: StructureEditor,
    private authService: AuthService
  ) {
    super(route, router, tournamentRepository, structureRepository, globalEventsManager, modalService, favRepository);
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
      this.processing = false;
    });
  }

  get StructureScreen(): TournamentScreen { return TournamentScreen.Structure }
  get PublicWebsitePart(): WebsitePart { return WebsitePart.Public } 

  showCompetitorIconClass(): IconName {
    return <IconName>('eye' + (this.showCompetitors ? '-slash' : ''));
  }

  isCategoryFilterActive(): boolean {
    return this.favorites.hasCategories() && this.favoriteCategories.length > 0
  }

  navigateBack() {
    this.myNavigation.back();
  }

  isAdmin(): boolean {
    return this.hasRole(this.authService, Role.Admin);
  }
}
