import { ChangeDetectionStrategy, Component, effect, input } from '@angular/core';
import { EndRankingItem, VoetbalRange, EndRankingCalculator, Category, StructureNameService } from 'ngx-sport';
import { Favorites } from '../../../lib/favorites';
import { TOURNAMENT_UI_IMPORTS } from '../tournament.ui-imports';

@Component({
    selector: 'app-tournament-endranking',
    templateUrl: './end.component.html',
    styleUrls: ['./end.component.scss'],
    standalone: true,
    imports: [TOURNAMENT_UI_IMPORTS],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class RankingEndComponent {
  readonly _category = input.required<Category>();
  readonly _structureNameService = input.required<StructureNameService>();
  readonly _favorites = input<Favorites | undefined>(undefined);
  readonly _range = input<VoetbalRange | undefined>(undefined);
  public rankingItems: EndRankingItem[] = [];

  constructor() {
    effect(() => {
      this.updateItems();
    });
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

  get category(): Category {
    return this._category();
  }

  get structureNameService(): StructureNameService {
    return this._structureNameService();
  }

  get favorites(): Favorites | undefined {
    return this._favorites();
  }

  get range(): VoetbalRange | undefined {
    return this._range();
  }
}
