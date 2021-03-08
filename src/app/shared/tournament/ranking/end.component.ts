import { Component, Input, OnInit, OnChanges, SimpleChanges } from '@angular/core';
import { EndRankingItem, Structure, CompetitorMap, VoetbalRange, EndRankingCalculator } from 'ngx-sport';
import { Favorites } from '../../../lib/favorites';

@Component({
  selector: 'app-tournament-endranking',
  templateUrl: './end.component.html',
  styleUrls: ['./end.component.scss']
})
export class EndRankingComponent implements OnInit, OnChanges {

  @Input() structure!: Structure;
  @Input() competitorMap!: CompetitorMap;
  @Input() favorites!: Favorites;
  @Input() range: VoetbalRange | undefined;
  public rankingItems: EndRankingItem[] = [];

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
    const endRankingCalculator = new EndRankingCalculator(this.structure);
    this.rankingItems = endRankingCalculator.getItems().filter((item: EndRankingItem): boolean => {
      return this.range === undefined || (item.getUniqueRank() >= this.range.min && item.getUniqueRank() <= this.range.max);
    });
  }

  hasMedal(rank: number): boolean {
    return (rank === 1 || rank === 2 || rank === 3);
  }

  getMedalColor(rank: number): string {
    return 'text-' + (rank === 1 ? 'gold' : (rank === 2 ? 'silver' : 'bronze'));
  }

  isFavorite(endRankingItem: EndRankingItem): boolean {
    const placeLocation = endRankingItem.getStartPlaceLocation();
    if (placeLocation === undefined) {
      return false;
    }
    const competitor = this.competitorMap.getCompetitor(placeLocation);
    return this.favorites && this.favorites.hasCompetitor(competitor);
  }

  getName(endRankingItem: EndRankingItem): string {
    const placeLocation = endRankingItem.getStartPlaceLocation();
    if (placeLocation === undefined) {
      return 'nog onbekend';
    }
    return this.competitorMap.getCompetitor(placeLocation)?.getName() ?? 'onbekend';
  }
}
