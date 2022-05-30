import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { Category } from 'ngx-sport';
import { Favorites } from '../../../lib/favorites';

@Component({
    selector: 'app-list-category-choose',
    templateUrl: './chooseList.component.html',
    styleUrls: ['./chooseList.component.scss']
})
export class CategoryChooseListComponent implements OnInit {
    @Input() categoryItems!: CategoryItem[];

    @Output() updateCategory = new EventEmitter<CategoryItem>();



    constructor() {
    }

    ngOnInit() {
        console.log(this.categoryItems);
    }

    // hasSelectableCompetitors(): boolean {
    //     return this.validator && this.validator.getCompetitors().length > 0;
    // }

    getId(category: Category): string {
        return 'category-select-' + category.getNumber();
    }

    toggle(categorytItem: CategoryItem) {
        categorytItem.selected = !categorytItem.selected;
        this.updateCategory.emit(categorytItem);
    }

    // getSelectedCategories(): Category[] {
    //     return this.categoryItems.filter(categoryItem => categoryItem.selected).map(categoryItem => categoryItem.category);
    // }
}

export interface CategoryItem {
    category: Category;
    selected: boolean;
}
