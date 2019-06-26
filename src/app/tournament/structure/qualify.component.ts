import { Component, EventEmitter, Input, Output } from '@angular/core';
import { NameService, QualifyGroup, Round, RoundNumber, StructureService } from 'ngx-sport';

import { IAlert } from '../../common/alert';
import { Tournament } from '../../lib/tournament';

@Component({
    selector: 'app-tournament-structurequalify',
    templateUrl: './qualify.component.html',
    styleUrls: ['./qualify.component.css']
})
export class StructureQualifyComponent {

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
        if (this.round.getNrOfPlaces() < 4) {
            return false;
        }
        // can some merge
        const mergable = [QualifyGroup.WINNERS, QualifyGroup.LOSERS].some(winnersOrLosers => {
            let previous;
            return this.round.getQualifyGroups(winnersOrLosers).some(qualifyGroup => {
                if (this.structureService.areQualifyGroupsMergable(previous, qualifyGroup)) {
                    return true;
                };
                previous = qualifyGroup;
                return false;
            });
        });
        if (mergable) {
            return true;
        }
        // can some split
        return [QualifyGroup.WINNERS, QualifyGroup.LOSERS].some(winnersOrLosers => {
            return this.round.getQualifyGroups(winnersOrLosers).some(qualifyGroup => {
                let previous;
                return qualifyGroup.getHorizontalPoules().some(horizontalPoule => {
                    if (this.structureService.isQualifyGroupSplittable(previous, horizontalPoule)) {
                        return true;
                    };
                    previous = horizontalPoule;
                    return false;
                });
            });
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
