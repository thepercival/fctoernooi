import { Component, Input, OnInit, ViewEncapsulation } from '@angular/core';
import { Tournament } from '../../../tournament';
import { StructureService } from 'voetbaljs/structure/service';
import { Competitionseason } from 'voetbaljs/competitionseason';
import { Field } from 'voetbaljs/field';

@Component({
    selector: 'app-tournament-planning-fields',
    templateUrl: './component.html',
    styleUrls: ['./component.scss']
})
export class TournamentPlanningFieldsComponent implements OnInit {

    @Input() tournament: Tournament;
    public alert: any;
    public disableEditButtons = false;
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
    }

    protected resetAlert(): void {
        this.alert = null;
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
        console.log(this.fieldsList);
    }

    saveedit( fieldListItem: IFieldListItem ) {
        fieldListItem.editable = !fieldListItem.editable;
        this.disableEditButtons = fieldListItem.editable;
    }

    addField() {
        const number = this.fieldsList.length + 1;
        const field = new Field( this.tournament.getCompetitionseason(), number );
        field.setName( '' + number );
        const fieldListItem: IFieldListItem = { field: field, editable: false };
        this.fieldsList.push( fieldListItem );

    }

    removeField(fieldItem: IFieldListItem) {
        const index = this.fieldsList.indexOf( fieldItem );
        if (index > -1) {
            this.fieldsList.splice(index, 1);
        }
    }

    protected setAlert( type: string, message: string ): boolean {
        this.alert = { 'type': type, 'message': message };
        return ( type === 'success' );
    }

    public closeAlert( name: string) {
        this.alert = null;
    }
}

export interface IFieldListItem {
    field: Field;
    editable: boolean;
}