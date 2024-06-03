import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
    providedIn: 'root'
})
export class ThemeSwitcherService {
    private themeSubject = new BehaviorSubject<string>('light');

    constructor() { }

    switchTheme(theme: string) {
        this.themeSubject.next(theme);
    }

    getTheme() {
        return this.themeSubject.asObservable();
    }
}