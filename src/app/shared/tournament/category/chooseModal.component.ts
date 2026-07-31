import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { Category } from 'ngx-sport';

import { Favorites } from '../../../lib/favorites';
import { FavoritesRepository } from '../../../lib/favorites/repository';
import { Tournament } from '../../../lib/tournament';
import { CategoryItem } from './chooseList.component';
import { CategoryChooseListComponent } from './chooseList.component';
import { TOURNAMENT_UI_IMPORTS } from '../tournament.ui-imports';
import { faGrip } from '@fortawesome/free-solid-svg-icons';
import { CATEGORY_CHOOSE_MODAL_INPUTS } from '../../modal-input-interfaces/category-choose-modal-inputs.interface';

@Component({
    selector: 'app-modal-category-choose',
    templateUrl: './chooseModal.component.html',
    styleUrls: ['./chooseModal.component.scss'],
    standalone: true,
    imports: [TOURNAMENT_UI_IMPORTS, CategoryChooseListComponent],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class CategoryChooseModalComponent { // implements OnInit {
    private readonly modalInputs = inject(CATEGORY_CHOOSE_MODAL_INPUTS, { optional: true });
    public categories: Category[] = [];
    public tournament!: Tournament;
    public favRepository = inject(FavoritesRepository);
    public activeModal = inject(NgbActiveModal);
    public faGrip = faGrip;

    constructor() {
        if (this.modalInputs) {
            this.categories = this.modalInputs.categories;
            this.tournament = this.modalInputs.tournament;
        }
    }

    getCategoryItems(): CategoryItem[] {
        const favorites = this.favRepository.getObject(this.tournament, this.categories);
        return this.categories.map((category: Category) => {
            return {
                category: category,
                selected: !favorites.hasCategories() || favorites.hasCategory(category)
            }
        });
    }

    updateFavorites(categoryItem: CategoryItem): void {
        const favorites = this.favRepository.getObject(this.tournament, this.categories);

        if (!favorites.hasCategories() && categoryItem.selected === false) {
            this.initialFill(favorites);
        }

        const category = categoryItem.category;
        categoryItem.selected ? favorites.addCategory(category) : favorites.removeCategory(category);

        if (favorites.hasCategories()) {
            const allFavorite = this.categories.every((category: Category) => favorites.hasCategory(category));
            if (allFavorite) {
                favorites.resetCategories();
            }
        }

        this.favRepository.editObject(favorites);
    }

    private initialFill(favorites: Favorites): void {
        this.categories.forEach((category: Category) => {
            favorites.addCategory(category);
        });
    }

    // get categories(): Category[] {
    //     return this.categoryRepository.getCategories(this.tournament);
    // }

    // get tournament(): Tournament {
    //     return this.tournamentRepository.getCurrent();
    // }
}
