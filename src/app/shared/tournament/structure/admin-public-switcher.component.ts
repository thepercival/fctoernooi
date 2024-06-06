import { Component, Input, OnInit, input, output } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { HorizontalSingleQualifyRule, QualifyDistribution, QualifyGroup, QualifyTarget, Round, StructureEditor, StructureNameService, VerticalSingleQualifyRule } from 'ngx-sport';
import { CSSService } from '../../common/cssservice';
import { Tournament } from '../../../lib/tournament';
import { Router } from '@angular/router';

@Component({
    selector: 'app-admin-public-switcher',
    templateUrl: './admin-public-switcher.component.html',
    styleUrls: ['./admin-public-switcher.component.scss']
})
export class AdminPublicSwitcherComponent implements OnInit {
    public tournament = input.required<Tournament>();
    public currentWebsitePart = input.required<WebsitePart>(); 
    public routerLink = input.required<any[]>(); 
    
    constructor(private router: Router,) {
        
    }

    ngOnInit(): void {
        console.log(this.currentWebsitePart());
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