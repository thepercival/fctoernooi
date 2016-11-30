/**
 * Created by coen on 23-11-16.
 */

import {Component, Input, OnInit, AfterViewInit } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { Router } from '@angular/router';
import { CompetitionSeasonService } from '../service';
import { CompetitionSeasonInMemoryService } from '../inmemory.service';
import * as moment from 'moment/moment';

@Component({
    moduleId: module.id,
    selector: 'ngbd-modal-content',
    templateUrl: 'component.html'
})
export class NgbdModalContent implements OnInit{
    @Input() demo;
    model: any = {};
    loading = false;
    error = '';

    constructor(
        public activeModal: NgbActiveModal,
        private router: Router,
        private competitionSeasonService: CompetitionSeasonService,
        private competitionSeasonInMemoryService: CompetitionSeasonInMemoryService,
    ) {}

    ngOnInit() {
        if ( this.demo ) {
            this.model.name = 'demo toernooi';
            this.model.seasonname = moment().format('YYYY');
        }
    }

    add(): boolean {
        this.model.name = this.model.name.trim();
        if (!this.model.name) { return; }
        this.model.seasonname = this.model.seasonname.trim();
        if (!this.model.seasonname) { return; }

        let service = this.demo ? this.competitionSeasonInMemoryService : this.competitionSeasonService;
        // console.log( service ); return true;
        /*service.getObject( 12 )
            .subscribe(
                cs => {
                    let x = cs.name;
                },
                e => { this.error = e; this.loading = false; },
                () => this.loading = false
            );*/

        let props = { 'name' : this.model.name, 'seasonname' : this.model.seasonname, 'nrofteams' : this.model.nrofteams };
//        this.competitionSeasonInMemoryService.createObject( props )
//        .subscribe(
//            /* happy path */ cs => {
//                console.log(123);
//                console.log(cs);
//                // this.router.navigate(['/toernooi-index']); // met id
//            },
//            /* error path */ e => { this.error = e; this.loading = false; },
//            /* onComplete */ () => this.loading = false
//        );

        this.competitionSeasonInMemoryService.createObject( props )
            .forEach(competitionseason => console.log( competitionseason ) );

        return true;
    }
}

