import { Component, Input } from '@angular/core';
import { EndRanking, Ranking, RankingItem, Round, NameService } from 'ngx-sport';

@Component({
  selector: 'app-tournament-endranking-view',
  templateUrl: './component.html',
  styleUrls: ['./component.scss']
})
export class TournamentEndRankingViewComponent {

  @Input() rootRound: Round;

  endRankingService: EndRanking;

  constructor(public nameService: NameService) {
    this.endRankingService = new EndRanking(Ranking.RULESSET_WC);
  }

  getRankingItems(): RankingItem[] {
    return this.endRankingService.getItems(this.rootRound);
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
