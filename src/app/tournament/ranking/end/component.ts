import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { EndRanking, NameService, Ranking, RankingItem, Round } from 'ngx-sport';

@Component({
  selector: 'app-tournament-endranking-view',
  templateUrl: './component.html',
  styleUrls: ['./component.scss']
})
export class TournamentEndRankingViewComponent implements OnChanges {

  @Input() rootRound: Round;
  @Input() filterStart: number;
  @Input() filterEnd: number;
  @Input() recalculate: boolean;

  private endRankingService: EndRanking;
  private rankingItems: RankingItem[];

  constructor(public nameService: NameService) {
    this.endRankingService = new EndRanking(Ranking.RULESSET_WC);
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes.recalculate.currentValue !== changes.recalculate.previousValue) {
      this.rankingItems = undefined;
    }
  }

  getRankingItems(): RankingItem[] {
    if (this.rankingItems === undefined) {
      this.rankingItems = this.endRankingService.getItems(this.rootRound);
    }
    if (this.filterStart !== undefined && this.filterEnd !== undefined) {
      return this.rankingItems.filter(item => item.getUniqueRank() >= this.filterStart && item.getUniqueRank() <= this.filterEnd);
    }
    return this.rankingItems;
  }

  isUnknown(rankingItem: RankingItem): boolean {
    return (rankingItem.isSpecified() === false || rankingItem.getPoulePlace().getTeam() === undefined);
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
