import { Injectable } from '@angular/core';
import { Router, RoutesRecognized } from '@angular/router';
import { filter, pairwise } from 'rxjs/operators';

@Injectable()
export class MyNavigation {
    private previousUrl: string;

    constructor(
        private router: Router
    ) {
        this.router.events.pipe(filter((e: any) => e instanceof RoutesRecognized),
            pairwise()
        ).subscribe((e: any) => {
            this.previousUrl = e[0].urlAfterRedirects; // previous url
        });
    }

    public getPreviousUrl(defaultUrl: string): string {
        if (this.previousUrl === undefined) {
            return defaultUrl;
        }
        return this.previousUrl;
    }
}