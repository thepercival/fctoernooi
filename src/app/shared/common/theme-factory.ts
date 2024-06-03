import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ThemeService } from './theme.service';
import { ThemeSwitcherService } from './theme-switcher.service';

@Injectable({
    providedIn: 'root'
})
export class ThemeFactory {
    private themeService: ThemeService;

    constructor() {
        this.themeService = new ThemeService(new ThemeSwitcherService());
    }

    getTheme(): Observable<string> {
        return this.themeService.getTheme();
    }

    switchTheme(theme: string) {
        this.themeService.switchTheme(theme);
    }
}