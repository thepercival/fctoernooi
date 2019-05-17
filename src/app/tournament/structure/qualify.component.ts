import { Component, Input } from '@angular/core';
import { NameService, QualifyGroup, Round, StructureService } from 'ngx-sport';

import { Tournament } from '../../lib/tournament';

@Component({
    selector: 'app-tournament-structurequalify',
    templateUrl: './qualify.component.html',
    styleUrls: ['./qualify.component.css']
})
export class TournamentStructureQualifyComponent {

    @Input() round: Round;
    public alert: any;
    private structureService: StructureService;

    constructor(
        // public cssService: CSSService
        public nameService: NameService
    ) {
        this.resetAlert();
        this.structureService = new StructureService({ min: Tournament.MINNROFCOMPETITORS, max: Tournament.MAXNROFCOMPETITORS });
    }

    get QualifyGroupWINNERS(): number {
        return QualifyGroup.WINNERS;
    }

    get QualifyGroupLOSERS(): number {
        return QualifyGroup.LOSERS;
    }

    qualifyGroupsEditable() {
        return true;
        // if one qualifygroup with 2 complete horizontalpoules
        // or 2 full qualifygroups for winners or losers
    }

    switchView() {
        // call Output
    }

    removeQualifier(winnersOrLosers: number) {
        this.resetAlert();
        try {
            this.structureService.removeQualifier(this.round, winnersOrLosers);
        } catch (e) {
            this.setAlert('danger', e.message);
        }
    }

    addQualifier(winnersOrLosers: number) {
        this.resetAlert();
        try {
            this.structureService.addQualifier(this.round, winnersOrLosers);
        } catch (e) {
            this.setAlert('danger', e.message);
        }
    }

    protected resetAlert(): void {
        this.alert = undefined;
    }

    protected setAlert(type: string, message: string) {
        this.alert = { type: type, message: message };
    }
}
