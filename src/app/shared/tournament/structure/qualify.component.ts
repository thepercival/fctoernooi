import { Component, EventEmitter, Input, Output } from '@angular/core';
import { HorizontalPoule, NameService, QualifyGroup, Round, RoundNumber, StructureService } from 'ngx-sport';

import { IAlert } from '../../common/alert';
import { Tournament } from '../../../lib/tournament';
import { IconName, IconPrefix } from '@fortawesome/fontawesome-svg-core';
import { facStructure } from '../icons';

export enum StructureViewType {
    ROUNDSTRUCTURE = 1,
    QUALIFYGROUPS = 2
}

@Component({
    selector: 'app-tournament-structurequalify',
    templateUrl: './qualify.component.html',
    styleUrls: ['./qualify.component.css']
})
export class StructureQualifyComponent {

    @Input() round!: Round;
    @Output() viewTypeChanged = new EventEmitter<number>();
    @Output() roundNumberChanged = new EventEmitter<RoundNumber>();
    viewType: number = StructureViewType.ROUNDSTRUCTURE;
    alert: IAlert | undefined;
    public nameService: NameService;

    constructor(private structureService: StructureService) {
        this.resetAlert();
        this.nameService = new NameService(undefined);
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

    get IconStructure(): [IconPrefix, IconName] { return [facStructure.prefix, facStructure.iconName]; }

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
            let previous: QualifyGroup | undefined;
            return this.round.getQualifyGroups(winnersOrLosers).some((qualifyGroup: QualifyGroup) => {
                if (previous && this.structureService.areQualifyGroupsMergable(previous, qualifyGroup)) {
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
                let previous: HorizontalPoule | undefined;
                return qualifyGroup.getHorizontalPoules().some((horizontalPoule: HorizontalPoule) => {
                    if (previous && this.structureService.isQualifyGroupSplittable(previous, horizontalPoule)) {
                        return true;
                    };
                    previous = horizontalPoule;
                    return false;
                });
            });
        });
    }

    switchView() {
        const newViewType = (this.viewType === StructureViewType.QUALIFYGROUPS)
            ? StructureViewType.ROUNDSTRUCTURE : StructureViewType.QUALIFYGROUPS;
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
