/**
 * Created by coen on 18-11-16.
 */
import { Component, Input, OnInit, OnDestroy } from '@angular/core';
import { AuthenticationService } from '../auth/service';
import { Router } from '@angular/router';
import { ActivatedRoute, Params }   from '@angular/router';
import {GlobalEventsManager} from "./../global-events-manager";

@Component({
    moduleId: module.id,
    selector: 'navbar',
    templateUrl: 'component.html',
    styleUrls: [ 'component.css' ]
})
export class NavbarComponent {
    @Input()
    title: string;
    showCompetitionSeasonDetails: boolean = false;

    constructor(
        private authenticationService: AuthenticationService,
        private globalEventsManager: GlobalEventsManager
    )
    {
        this.globalEventsManager.showCompetitionSeasonDetailsInNavBar.subscribe((mode)=>{
            this.showCompetitionSeasonDetails = mode;
            console.log('in navbar show is ' + mode );
        });
    }
}

