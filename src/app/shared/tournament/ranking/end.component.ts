import { Component, Input, OnInit, OnChanges, SimpleChanges } from '@angular/core';
import { EndRankingItem, VoetbalRange, EndRankingCalculator, Category, StructureNameService } from 'ngx-sport';
import { Favorites } from '../../../lib/favorites';

@Component({
  selector: 'app-tournament-endranking',
  templateUrl: './end.component.html',
  styleUrls: ['./end.component.scss']
})
export class RankingEndComponent implements OnInit, OnChanges {

  @Input() category!: Category;
  @Input() structureNameService!: StructureNameService;
  @Input() favorites: Favorites | undefined;
  @Input() range: VoetbalRange | undefined;
  public rankingItems: EndRankingItem[] = [];

  constructor() {
  }

  ngOnInit() {
    this.updateItems();
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes.category !== undefined && changes.category.currentValue !== changes.category.previousValue
      && changes.category.firstChange === false) {
      this.updateItems();
    } else if (changes.range !== undefined && changes.range.isFirstChange() === false
      && changes.range.currentValue !== changes.range.previousValue) {
      this.updateItems();
    }
  }

  protected updateItems() {
    const endRankingCalculator = new EndRankingCalculator(this.category);
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
    const startLocation = endRankingItem.getStartLocation();
    if (startLocation === undefined) {
      return false;
    }
    const competitor = this.structureNameService.getStartLocationMap()?.getCompetitor(startLocation);
    return this.favorites !== undefined && competitor !== undefined && this.favorites.hasCompetitor(competitor);
  }

  getName(endRankingItem: EndRankingItem): string {
    const startLocation = endRankingItem.getStartLocation();
    if (startLocation === undefined) {
      return 'nog onbekend';
    }
    return this.structureNameService.getStartLocationMap()?.getCompetitor(startLocation)?.getName() ?? 'onbekend';
  }
}
