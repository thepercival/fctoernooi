import { Component, Input, OnInit } from '@angular/core';
import { Tournament } from '../../../tournament';
import { Round } from 'voetbaljs/round';
import { StructureService } from 'voetbaljs/structure/service';

@Component({
    selector: 'app-tournament-planning-settings',
    templateUrl: './component.html',
    styleUrls: ['./component.css']
})
export class TournamentPlanningSettingsComponent {

    @Input() tournament: Tournament;
    @Input() round: Round;
    @Input() structureService: StructureService;

    constructor() {
    }

    getWinnersLosersDescription( winnersOrLosers: number ): string {
        const description = this.structureService.getWinnersLosersDescription( winnersOrLosers );
        return ( description !== '' ? description + 's' : description );
    }

    getClassPostfix( winnersOrLosers: number): string {
        return winnersOrLosers === Round.WINNERS ? 'success' : ( winnersOrLosers === Round.LOSERS ? 'danger' : '');
    }
}
