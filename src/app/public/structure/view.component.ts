import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

import { MyNavigation } from '../../shared/common/navigation';
import { TournamentRepository } from '../../lib/tournament/repository';
import { StructureRepository } from '../../lib/ngx-sport/structure/repository';
import { TournamentComponent } from '../../shared/tournament/component';
import { Competitor } from 'ngx-sport';
import { Favorites } from '../../lib/favorites';
import { FavoritesRepository } from '../../lib/favorites/repository';

@Component({
  selector: 'app-tournament-structure-view',
  templateUrl: './view.component.html',
  styleUrls: ['./view.component.css']
})
export class StructureViewComponent extends TournamentComponent implements OnInit {
  competitors: Competitor[] = [];
  private favorites: Favorites;

  constructor(
    route: ActivatedRoute,
    router: Router,
    tournamentRepository: TournamentRepository,
    private myNavigation: MyNavigation,
    structureRepository: StructureRepository,
    public favRepository: FavoritesRepository
  ) {
    super(route, router, tournamentRepository, structureRepository);
  }

  ngOnInit() {
    super.myNgOnInit(() => {
      this.favorites = this.favRepository.getItem(this.tournament);
      if (this.favorites.hasCompetitors()) {
        const competitors = this.structure.getFirstRoundNumber().getCompetitors();
        this.competitors = this.favorites.filterCompetitors(competitors);
      }
      this.processing = false;
    });
  }

  navigateBack() {
    this.myNavigation.back();
  }
}
