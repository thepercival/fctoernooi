import { Component, Input, OnInit } from '@angular/core';
import { EndRanking, NameService, Ranking, RankingItem, Round } from 'ngx-sport';

@Component({
  selector: 'app-tournament-endranking-view',
  templateUrl: './end.component.html',
  styleUrls: ['./end.component.scss']
})
export class TournamentEndRankingViewComponent implements OnInit {

  @Input() rootRound: Round;
  @Input() filterStart: number;
  @Input() filterEnd: number;

  private endRankingService: EndRanking;
  public items: RankingItem[];

  constructor(public nameService: NameService) {
    this.endRankingService = new EndRanking(Ranking.RULESSET_WC);
  }

  ngOnInit() {
    let items = this.endRankingService.getItems(this.rootRound);
    if (this.filterStart !== undefined && this.filterEnd !== undefined) {
      items = items.filter(item => item.getUniqueRank() >= this.filterStart && item.getUniqueRank() <= this.filterEnd);
    }
    this.items = items;
  }

  isUnknown(rankingItem: RankingItem): boolean {
    return (rankingItem.isSpecified() === false || rankingItem.getPoulePlace().getCompetitor() === undefined);
  }

  getRankingItemName(rankingItem: RankingItem): string {
    if (this.isUnknown(rankingItem)) {
      return 'nog onbekend';
    }
    return this.nameService.getPoulePlaceFromName(rankingItem.getPoulePlace(), true);
  }

  hasMedal(rank: number): boolean {
    return (rank === 1 || rank === 2 || rank === 3);
  }

  getMedalColor(rank: number): string {
    return 'text-' + (rank === 1 ? 'gold' : (rank === 2 ? 'silver' : 'bronze'));
  }
}
