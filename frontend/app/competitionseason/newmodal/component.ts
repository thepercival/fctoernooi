/**
 * Created by coen on 23-11-16.
 */

import {Component, Input} from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { AuthenticationService } from '../../auth/service';
import { CompetitionSeasonService } from '../service';

@Component({
    moduleId: module.id,
    selector: 'ngbd-modal-content',
    templateUrl: 'component.html'
})
export class NgbdModalContent {
    // @Input() name;

    model: any = {};
    loading = false;
    error = '';

    constructor(
        public activeModal: NgbActiveModal,
        private authService: AuthenticationService,
        private competitionSeasonService: CompetitionSeasonService,
    ) {}

    add(): boolean {
        this.model.name = this.model.name.trim();
        if (!this.model.name) { return; }
        this.model.seasonname = this.model.seasonname.trim();
        if (!this.model.seasonname) { return; }

        // voer hier logica uit die ronde, poules, places, etc aanmaakt
        
        this.competitionSeasonService.create(
            this.model.name,
            this.model.seasonname,
            this.model.nrofteams,
            this.authService.userid 
        )
        .subscribe(
            /* happy path */ p => { this.error = 'balbla'; }/*this.router.navigate(['/'])*/,
            /* error path */ e => { this.error = e; this.loading = false; },
            /* onComplete */ () => this.loading = false
        );
        //.forEach(competitionseason => {
          //  this.competitionSeasons.push(competitionseason);
          //  this.selectedCompetitionSeason = null;
       // });

        // voeg cs toe aan lijst
            
        return true;
    }
}

