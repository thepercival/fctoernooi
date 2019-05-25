import { Component, EventEmitter, Input, Output } from '@angular/core';
import { NameService, QualifyGroup, Round, RoundNumber, StructureService } from 'ngx-sport';

import { IAlert } from '../../common/alert';
import { Tournament } from '../../lib/tournament';

@Component({
    selector: 'app-tournament-structurequalify',
    templateUrl: './qualify.component.html',
    styleUrls: ['./qualify.component.css']
})
export class TournamentStructureQualifyComponent {

    @Input() round: Round;
    @Output() viewTypeChanged = new EventEmitter<number>();
    @Output() roundNumberChanged = new EventEmitter<RoundNumber>();
    viewType: number = StructureViewType.ROUNDSTRUCTURE;
    alert: IAlert;
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

    get ViewTypeQualifyGroups(): number {
        return StructureViewType.QUALIFYGROUPS;
    }

    removeQualifier(winnersOrLosers: number) {
        this.resetAlert();
        try {
            this.structureService.removeQualifier(this.round, winnersOrLosers);
            this.roundNumberChanged.emit(this.round.getNumber());
        } catch (e) {
            this.setAlert('danger', e.message);
        }
    }

    addQualifier(winnersOrLosers: number) {
        this.resetAlert();
        try {
            this.structureService.addQualifier(this.round, winnersOrLosers);
            this.roundNumberChanged.emit(this.round.getNumber());
        } catch (e) {
            this.setAlert('danger', e.message);
        }
    }

    /**
* 1 : wanneer er een kw.groep van minimaal 2 horizontale poules is (grens h poule  moet minimaal twee door laten gaan) 
* 2 : 2 kw.groepen van winners of losers.
*/
    showSwitchView(): boolean {
        if (this.viewType === StructureViewType.QUALIFYGROUPS) {
            return true;
        }
        const winnersQualifyGroups = this.round.getQualifyGroups(QualifyGroup.WINNERS);
        const losersQualifyGroups = this.round.getQualifyGroups(QualifyGroup.LOSERS);
        if (winnersQualifyGroups.length > 1 || losersQualifyGroups.length > 1) {
            return true;
        }
        const qualifyGroups = winnersQualifyGroups.concat(losersQualifyGroups);
        return qualifyGroups.some(qualifyGroup => {
            if (qualifyGroup.getHorizontalPoules().length < 2) {
                return false;
            }
            if (qualifyGroup.getHorizontalPoules().length > 2) {
                return true;
            }
            return (!qualifyGroup.isBorderGroup() || qualifyGroup.getBorderPoule().getNrOfQualifiers() >= 2);
        });
    }

    switchView() {
        const newViewType = this.viewType === StructureViewType.QUALIFYGROUPS ? StructureViewType.ROUNDSTRUCTURE : StructureViewType.QUALIFYGROUPS;
        this.viewType = newViewType;
        this.viewTypeChanged.emit(this.viewType);
    }

    protected resetAlert(): void {
        this.alert = undefined;
    }

    protected setAlert(type: string, message: string) {
        this.alert = { type: type, message: message };
    }
}


export enum StructureViewType {
    ROUNDSTRUCTURE = 1,
    QUALIFYGROUPS = 2
}
