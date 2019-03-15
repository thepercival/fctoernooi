import { Component, Input, OnInit } from '@angular/core';
import { EndRanking, EndRankingItem, RankingService, Round } from 'ngx-sport';

@Component({
  selector: 'app-tournament-endranking-view',
  templateUrl: './end.component.html',
  styleUrls: ['./end.component.scss']
})
export class TournamentEndRankingViewComponent implements OnInit {

  @Input() rootRound: Round;
  @Input() filterStart: number;
  @Input() filterEnd: number;

  public items: EndRankingItem[];

  constructor() {
  }

  ngOnInit() {
    const endRankingService = new EndRanking(RankingService.RULESSET_WC);
    let items = endRankingService.getItems(this.rootRound);
    if (this.filterStart !== undefined && this.filterEnd !== undefined) {
      items = items.filter(item => item.getUniqueRank() >= this.filterStart && item.getUniqueRank() <= this.filterEnd);
    }
    this.items = items;
  }

  hasMedal(rank: number): boolean {
    return (rank === 1 || rank === 2 || rank === 3);
  }

  getMedalColor(rank: number): string {
    return 'text-' + (rank === 1 ? 'gold' : (rank === 2 ? 'silver' : 'bronze'));
  }
}
