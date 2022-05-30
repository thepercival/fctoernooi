import { Category } from "ngx-sport";

export class CategoryNameChecker {

    constructor() {
    }

    doesNameExists(categories: Category[], newName: string, existingCategory?: Category): boolean {
        return categories.some((category: Category): boolean => {
            return category.getName() === newName
                && (existingCategory === undefined || existingCategory !== category)
        });
    }
}
