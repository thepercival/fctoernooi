import { Component, Input, OnInit, OnChanges, SimpleChanges } from '@angular/core';
import { EndRankingService, EndRankingItem, Structure, Competitor, PlaceLocation, PlaceLocationMap } from 'ngx-sport';
import { VoetbalRange } from 'ngx-sport';

@Component({
  selector: 'app-tournament-endranking',
  templateUrl: './end.component.html',
  styleUrls: ['./end.component.scss']
})
export class EndRankingComponent implements OnInit, OnChanges {

  @Input() structure!: Structure;
  @Input() placeLocationMap!: PlaceLocationMap;
  @Input() favorites!: Competitor[];
  @Input() range: VoetbalRange | undefined;
  public items: EndRankingItem[] = [];

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
    const endRankingService = new EndRankingService(this.structure);
    this.items = endRankingService.getItems().filter(item => this.range && item.getUniqueRank() >= this.range.min && item.getUniqueRank() <= this.range.max);
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
    const competitor = this.placeLocationMap.getCompetitor(placeLocation);
    return this.favorites && this.favorites.some(competitorIt => competitorIt === competitor);
  }

  getName(endRankingItem: EndRankingItem): string {
    const placeLocation = endRankingItem.getStartPlaceLocation();
    if (placeLocation === undefined) {
      return '';
    }
    return this.placeLocationMap.getCompetitor(placeLocation).getName();
  }
}
