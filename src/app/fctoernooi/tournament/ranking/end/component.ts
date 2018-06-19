import { Component, Input } from '@angular/core';
import { EndRanking, Ranking, RankingItem, Round, StructureNameService } from 'ngx-sport';

@Component({
  selector: 'app-tournament-endranking-view',
  templateUrl: './component.html',
  styleUrls: ['./component.scss']
})
export class TournamentEndRankingViewComponent {

  @Input() scorebord: boolean;
  @Input() firstRound: Round;

  endRankingService: EndRanking;

  constructor(public nameService: StructureNameService) {
    this.endRankingService = new EndRanking(Ranking.RULESSET_WC);
  }

  getRankingItems(): RankingItem[] {
    return this.endRankingService.getItems(this.firstRound);
  }

  getRankingItemName(rankingItem: RankingItem): string {
    if (rankingItem.isSpecified() === false || rankingItem.getPoulePlace().getTeam() === undefined) {
      return 'nog onbekend';
    }
    return this.nameService.getPoulePlaceName(rankingItem.getPoulePlace(), true);
  }
}
