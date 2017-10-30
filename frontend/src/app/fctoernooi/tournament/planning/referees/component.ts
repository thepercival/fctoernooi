import { Component, Input } from '@angular/core';
import { Tournament } from '../../../tournament';
import { StructureService } from 'voetbaljs/structure/service';
import { Competitionseason } from 'voetbaljs/competitionseason';

@Component({
    selector: 'app-tournament-planning-referees',
    templateUrl: './component.html',
    styleUrls: ['./component.css']
})
export class TournamentPlanningRefereesComponent {

    @Input() competitionseason: Competitionseason;
    @Input() tournament: Tournament;
    @Input() structureService: StructureService;
    public alert: any;

    constructor() {
        this.resetAlert();
    }

    protected resetAlert(): void {
        this.alert = null;
    }

    protected setAlert( type: string, message: string ): boolean {
        this.alert = { 'type': type, 'message': message };
        return ( type === 'success' );
    }

    public closeAlert( name: string) {
        this.alert = null;
    }
}
