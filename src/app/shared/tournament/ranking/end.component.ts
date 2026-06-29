import { ChangeDetectionStrategy, Component, effect, input } from '@angular/core';
import { EndRankingItem, VoetbalRange, EndRankingCalculator, Category, StructureNameService } from 'ngx-sport';
import { Favorites } from '../../../lib/favorites';
import { TOURNAMENT_UI_IMPORTS } from '../tournament.ui-imports';
import { faMedal } from '@fortawesome/free-solid-svg-icons';

@Component({
    selector: 'app-tournament-endranking',
    templateUrl: './end.component.html',
    styleUrls: ['./end.component.scss'],
    standalone: true,
    imports: [TOURNAMENT_UI_IMPORTS],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class RankingEndComponent {
  public category = input.required<Category>();
  public structureNameService = input.required<StructureNameService>();
  public favorites = input<Favorites | undefined>(undefined);
  public range = input<VoetbalRange | undefined>(undefined);
  public rankingItems: EndRankingItem[] = [];
  public faMedal = faMedal;

  constructor() {
    effect(() => {
      this.updateItems();
    });
  }

  protected updateItems() {
    const endRankingCalculator = new EndRankingCalculator(this.category());
    this.rankingItems = endRankingCalculator.getItems().filter((item: EndRankingItem): boolean => {
      const range = this.range();
      return range === undefined || (item.getUniqueRank() >= range.min && item.getUniqueRank() <= range.max);
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
    const competitor = this.structureNameService().getStartLocationMap()?.getCompetitor(startLocation);
    const favorites = this.favorites();
    return competitor !== undefined && favorites !== undefined && favorites.hasCompetitor(competitor);
  }

  getName(endRankingItem: EndRankingItem): string {
    const startLocation = endRankingItem.getStartLocation();
    if (startLocation === undefined) {
      return 'nog onbekend';
    }
    return this.structureNameService().getStartLocationMap()?.getCompetitor(startLocation)?.getName() ?? 'onbekend';
  }
}
