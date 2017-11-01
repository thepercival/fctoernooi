import { Component, Input, OnInit } from '@angular/core';
import { Tournament } from '../../../tournament';
import { PlanningService } from 'voetbaljs/planning/service';
import { Referee } from 'voetbaljs/referee';
import { Round } from 'voetbaljs/round';
import { IAlert } from '../../../../app.definitions';

@Component({
    selector: 'app-tournament-planning-referees',
    templateUrl: './component.html',
    styleUrls: ['./component.css']
})
export class TournamentPlanningRefereesComponent implements OnInit {

    @Input() tournament: Tournament;
    @Input() round: Round;
    public progressAlert: IAlert;
    public disableEditButtons = false;
    private planningService: PlanningService;
    refereesList: Array<IRefereeListItem>;

    validations: any = {
        'minlengthname' : Referee.MIN_LENGTH_NAME,
        'maxlengthname' : Referee.MAX_LENGTH_NAME
    };

    constructor() {
        this.resetAlert();
    }

    ngOnInit() {
        this.createRefereesList();

        console.log(this.tournament.getCompetitionseason().getStartDateTime());
        this.planningService = new PlanningService(
            this.tournament.getCompetitionseason().getStartDateTime()
        );
    }

    protected resetAlert(): void {
        this.progressAlert = null;
    }

    createRefereesList() {
        const referees = this.tournament.getCompetitionseason().getReferees();
        this.refereesList = [];
        referees.forEach( function( refereeIt ) {
            this.refereesList.push( {
                referee: refereeIt,
                editable: false
            } );
        }, this );
    }

    saveedit( refereeListItem: IRefereeListItem ) {
        refereeListItem.editable = !refereeListItem.editable;
        this.disableEditButtons = refereeListItem.editable;
    }

    addReferee() {
        this.setAlert('velden opslaan');

        const number = this.refereesList.length + 1;
        const referee = new Referee( this.tournament.getCompetitionseason(), number );
        referee.setName( 's' + number );
        const refereeListItem: IRefereeListItem = { referee: referee, editable: false };
        this.refereesList.push( refereeListItem );

        console.log('reschedule');
        this.setAlert('wedstrijden plannen');
        this.planningService.reschedule( this.round );

        this.setAlert('wedstrijden opslaan');

        if ( true ) { // saving is succesvol
            // this.resetAlert();
        }
    }

    removeReferee(refereeItem: IRefereeListItem) {
        this.setAlert('velden opslaan');

        const index = this.refereesList.indexOf( refereeItem );
        if (index > -1) {
            this.refereesList.splice(index, 1);
        }

        const referees = this.tournament.getCompetitionseason().getReferees();
        referees.splice( 0, referees.length );
        let refereeNumber = 1;
        this.refereesList.forEach( (refereeListItem) => {
            if ( refereeListItem.referee.getName() === ( '' + ( refereeNumber + 1 ) ) ) {
                refereeListItem.referee.setName( '' + refereeNumber );
            }
            refereeListItem.referee.setNumber( refereeNumber++ );
            referees.push( refereeListItem.referee );
        });

        console.log('reschedule');

        this.setAlert('wedstrijden plannen');
        this.planningService.reschedule( this.round );

        this.setAlert('wedstrijden opslaan');

        if ( true ) { // saving is succesvol
            // this.resetAlert();
        }
    }

    protected setAlert( message: string ) {
        this.progressAlert = { 'type': 'info', 'message': message };
    }

    // public closeAlert( name: string) {
    //     this.progressAlert = null;
    // }
}

export interface IRefereeListItem {
    referee: Referee;
    editable: boolean;
}
