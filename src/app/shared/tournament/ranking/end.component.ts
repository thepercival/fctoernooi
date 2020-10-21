import { Component, Input, OnInit, OnChanges, SimpleChanges } from '@angular/core';
import { EndRankingService, EndRankingItem, RankingService, Structure, Competitor } from 'ngx-sport';
import { VoetbalRange } from 'ngx-sport';

@Component({
  selector: 'app-tournament-endranking',
  templateUrl: './end.component.html',
  styleUrls: ['./end.component.scss']
})
export class EndRankingComponent implements OnInit, OnChanges {

  @Input() structure: Structure;
  @Input() favorites: Competitor[];
  @Input() range: VoetbalRange;

  public items: EndRankingItem[];

  constructor() {
  }

  ngOnInit() {
    this.updateItems();
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes.structure !== undefined && changes.structure.currentValue !== changes.structure.previousValue
      && changes.structure.firstChange === false) {
      this.updateItems();
    } else if (changes.range !== undefined && changes.range.isFirstChange() === false
      && changes.range.currentValue !== changes.range.previousValue) {
      this.updateItems();
    }
  }

  protected updateItems() {
    const endRankingService = new EndRankingService(this.structure, RankingService.RULESSET_WC);
    this.items = endRankingService.getItems();
    if (this.range !== undefined) {
      this.items = this.items.filter(item => item.getUniqueRank() >= this.range.min && item.getUniqueRank() <= this.range.max);
    }
  }

  hasMedal(rank: number): boolean {
    return (rank === 1 || rank === 2 || rank === 3);
  }

  getMedalColor(rank: number): string {
    return 'text-' + (rank === 1 ? 'gold' : (rank === 2 ? 'silver' : 'bronze'));
  }

  isFavorite(competitorName: string) {
    return this.favorites && this.favorites.some(competitor => competitor.getName() === competitorName);
  }
}
