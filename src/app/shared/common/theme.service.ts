import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ThemeSwitcherService } from './theme-switcher.service';

@Injectable({
    providedIn: 'root'
})
export class ThemeService {
    private theme: string;

    constructor(private themeSwitcher: ThemeSwitcherService) {
        this.themeSwitcher.getTheme().subscribe(theme => {
            this.theme = theme;
            this.applyTheme();
        });
    }

    getTheme() {
        return this.theme;
    }

    applyTheme() {
        const themeLink = document.getElementById('theme-link') as HTMLLinkElement;
        themeLink.href = `assets/css/${this.theme}.css`;
    }

    switchTheme(theme: string) {
        this.themeSwitcher.switchTheme(theme);
        this.applyTheme();
    }
}