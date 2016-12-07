/**
 * Created by coen on 23-11-16.
 */

import {Component, Input, OnInit, AfterViewInit } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { Router } from '@angular/router';
import { CompetitionSeason } from '../../voetbal/competitionseason';
import { CompetitionSeasonService } from '../service';
import { CompetitionSeasonInMemoryService } from '../service.inmemory';
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
        private competitionSeasonInMemoryService: CompetitionSeasonInMemoryService
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

        let jsonCompetitionSeason = { name : this.model.name, seasonname : this.model.seasonname, nrofteams : this.model.nrofteams };

        service.createObject( jsonCompetitionSeason )
        .subscribe(
            /* happy path */ cs => {
                this.activeModal.close();
                this.router.navigate(['/toernooi-index', cs.id ]); // met id
            },
            /* error path */ e => { this.error = e; this.loading = false; },
            /* onComplete */ () => this.loading = false
        );
        //service.createObject( competitionSeason )
          //  .forEach(competitionseason => console.log( competitionseason ) );

        return true;
    }
}

