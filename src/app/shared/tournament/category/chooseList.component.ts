import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { Category } from 'ngx-sport';
import { TOURNAMENT_UI_IMPORTS } from '../tournament.ui-imports';

@Component({
    selector: 'app-list-category-choose',
    templateUrl: './chooseList.component.html',
    styleUrls: ['./chooseList.component.scss'],
    standalone: true,
    imports: [TOURNAMENT_UI_IMPORTS],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class CategoryChooseListComponent {
    readonly _categoryItems = input.required<CategoryItem[]>();

    readonly onCategoryUpdate = output<CategoryItem>();



    constructor() {
    }

    get categoryItems(): CategoryItem[] {
        return this._categoryItems();
    }

    // hasSelectableCompetitors(): boolean {
    //     return this.validator && this.validator.getCompetitors().length > 0;
    // }

    getId(category: Category): string {
        return 'category-select-' + category.getNumber();
    }

    toggle(categorytItem: CategoryItem) {
        categorytItem.selected = !categorytItem.selected;
        this.onCategoryUpdate.emit(categorytItem);
    }

    // getSelectedCategories(): Category[] {
    //     return this.categoryItems.filter(categoryItem => categoryItem.selected).map(categoryItem => categoryItem.category);
    // }
}

export interface CategoryItem {
    category: Category;
    selected: boolean;
}
