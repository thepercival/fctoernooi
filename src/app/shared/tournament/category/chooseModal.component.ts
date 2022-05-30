import { Component, Input, OnInit } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { Category } from 'ngx-sport';

import { Favorites } from '../../../lib/favorites';
import { FavoritesRepository } from '../../../lib/favorites/repository';
import { Tournament } from '../../../lib/tournament';
import { CategoryItem } from './chooseList.component';

@Component({
    selector: 'app-modal-category-choose',
    templateUrl: './chooseModal.component.html',
    styleUrls: ['./chooseModal.component.scss']
})
export class CategoryChooseModalComponent implements OnInit {
    @Input() categories!: Category[];
    @Input() tournament!: Tournament;

    constructor(
        public favRepository: FavoritesRepository,
        public activeModal: NgbActiveModal) {
    }

    ngOnInit() {

    }

    getCategoryItems(): CategoryItem[] {
        const favorites = this.favRepository.getObject(this.tournament, this.categories);
        console.log(favorites.hasCategories());
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

    initialFill(favorites: Favorites): void {
        this.categories.forEach((category: Category) => {
            favorites.addCategory(category);
        });
    }
}
