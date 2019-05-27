import { Component, Input, OnInit } from '@angular/core';
import { NameService, Poule, RankedRoundItem, RankingService } from 'ngx-sport';

import { CSSService } from '../../common/cssservice';
import { Favorites } from '../../lib/favorites';
import { FavoritesRepository } from '../../lib/favorites/repository';
import { Tournament } from '../../lib/tournament';

@Component({
  selector: 'app-tournament-pouleranking',
  templateUrl: './poule.component.html',
  styleUrls: ['./poule.component.scss']
})
export class TournamentPouleRankingComponent implements OnInit {
  public rankingItems: RankedRoundItem[];
  @Input() poule: Poule;
  @Input() tournament: Tournament;
  public showDifferenceDetail = false;
  favorites: Favorites;
  public processing = true;

  constructor(
    public nameService: NameService,
    public cssService: CSSService,
    public favRepository: FavoritesRepository) {
  }

  ngOnInit() {
    this.processing = true;
    this.favorites = this.favRepository.getItem(this.tournament);
    const ranking = new RankingService(this.poule.getRound(), this.tournament.getCompetition().getRuleSet());
    this.rankingItems = ranking.getItemsForPoule(this.poule);
    this.processing = false;
  }

  hasMultipleScoreConfigs() {
    return this.poule.getRound().getNumber().getConfig().getCalculateScore()
      !== this.poule.getRound().getNumber().getConfig().getInputScore();
  }
}