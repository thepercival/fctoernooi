import { Component, Input, OnInit } from '@angular/core';
import { Tournament } from '../../../tournament';
import { PlanningService } from 'voetbaljs/planning/service';
import { Field } from 'voetbaljs/field';
import { Round } from 'voetbaljs/round';
import { IAlert } from '../../../../app.definitions';

@Component({
    selector: 'app-tournament-planning-fields',
    templateUrl: './component.html',
    styleUrls: ['./component.scss']
})
export class TournamentPlanningFieldsComponent implements OnInit {

    @Input() tournament: Tournament;
    @Input() round: Round;
    public progressAlert: IAlert;
    public disableEditButtons = false;
    private planningService: PlanningService;
    fieldsList: Array<IFieldListItem>;

    validations: any = {
        'minlengthname' : Field.MIN_LENGTH_NAME,
        'maxlengthname' : Field.MAX_LENGTH_NAME
    };

    constructor() {
        this.resetAlert();
    }

    ngOnInit() {
        this.createFieldsList();

        console.log(this.tournament.getCompetitionseason().getStartDateTime());
        this.planningService = new PlanningService(
            this.tournament.getCompetitionseason().getStartDateTime()
        );
    }

    createFieldsList() {
        const fields = this.tournament.getCompetitionseason().getFields();
        this.fieldsList = [];
        fields.forEach( function( fieldIt ) {
            this.fieldsList.push( {
                field: fieldIt,
                editable: false
            } );
        }, this );
    }

    saveedit( fieldListItem: IFieldListItem ) {
        fieldListItem.editable = !fieldListItem.editable;
        this.disableEditButtons = fieldListItem.editable;
    }

    addField() {
        this.setAlert('velden opslaan');

        const number = this.fieldsList.length + 1;
        const field = new Field( this.tournament.getCompetitionseason(), number );
        field.setName( '' + number );
        const fieldListItem: IFieldListItem = { field: field, editable: false };
        this.fieldsList.push( fieldListItem );

        console.log('reschedule');
        this.setAlert('wedstrijden plannen');
        this.planningService.reschedule( this.round );

        this.setAlert('wedstrijden opslaan');

        if ( true ) { // saving is succesvol
            // this.resetAlert();
        }
    }

    removeField(fieldItem: IFieldListItem) {
        this.setAlert('velden opslaan');

        const index = this.fieldsList.indexOf( fieldItem );
        if (index > -1) {
            this.fieldsList.splice(index, 1);
        }

        const fields = this.tournament.getCompetitionseason().getFields();
        fields.splice( 0, fields.length );
        let fieldNumber = 1;
        this.fieldsList.forEach( (fieldListItem) => {
            if ( fieldListItem.field.getName() === ( '' + ( fieldNumber + 1 ) ) ) {
                fieldListItem.field.setName( '' + fieldNumber );
            }
            fieldListItem.field.setNumber( fieldNumber++ );
            fields.push( fieldListItem.field );
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

    protected resetAlert(): void {
        this.progressAlert = null;
    }

    // public closeAlert( name: string) {
    //     this.progressAlert = null;
    // }
}

export interface IFieldListItem {
    field: Field;
    editable: boolean;
}
