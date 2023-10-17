import { Category } from "ngx-sport";

export class CategoryUniqueChecker {

    constructor() {
    }

    doesNameExists(categories: Category[], newName: string, existingCategory?: Category): boolean {
        return categories.some((category: Category): boolean => {
            return category.getName() === newName
                && (existingCategory === undefined || existingCategory !== category)
        });
    }

    doesAbbreviationExists(categories: Category[], newAbbreviation: string, existingCategory?: Category): boolean {
        return categories.some((category: Category): boolean => {
            return category.getAbbreviation() === newAbbreviation
                && (existingCategory === undefined || existingCategory !== category)
        });
    }
}
