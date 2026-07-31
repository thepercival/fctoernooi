import { ChangeDetectionStrategy, Component, input, inject } from '@angular/core';
import { Tournament } from '../../../lib/tournament';
import { Router } from '@angular/router';
import { TOURNAMENT_UI_IMPORTS } from '../tournament.ui-imports';
import { faCogs, faEye } from '@fortawesome/free-solid-svg-icons';

@Component({
    selector: 'app-admin-public-switcher',
    templateUrl: './admin-public-switcher.component.html',
    styleUrls: ['./admin-public-switcher.component.scss'],
    standalone: true,
    imports: [TOURNAMENT_UI_IMPORTS],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class AdminPublicSwitcherComponent {
    private router = inject(Router);

    public tournament = input.required<Tournament>();
    public currentWebsitePart = input.required<WebsitePart>(); 
    public routerLink = input.required<any[]>(); 
    public faCogs = faCogs;
    public faEye = faEye;    
    constructor() {        
    }

    get PublicWebsitePart(): WebsitePart { return WebsitePart.Public }
    get AdminWebsitePart(): WebsitePart { return WebsitePart.Admin }

    linkToAdminOrPublic(): void {
        this.router.navigate(this.routerLink());
    }

    getOppositeWebsitePartName(): string {
        return this.currentWebsitePart() === WebsitePart.Admin ? 'publieke ' : 'beheer ';
    }     
}

export enum WebsitePart {
    Admin = 1, Public
}