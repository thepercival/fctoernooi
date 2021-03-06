import { Component, Input, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { IconName } from '@fortawesome/fontawesome-svg-core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { TournamentExportConfig, TournamentExportFormat } from '../../lib/tournament/repository';

@Component({
    selector: 'app-ngbd-modal-export-config',
    templateUrl: './exportmodal.component.html',
    styleUrls: ['./exportmodal.component.scss']
})
export class ExportModalComponent implements OnInit {
    @Input() enabled!: number;
    @Input() fieldDescription!: string;
    form: FormGroup;
    exportOptions: ExportOption[] = [];

    constructor(public activeModal: NgbActiveModal, private formBuilder: FormBuilder) {
        this.form = formBuilder.group({});
    }

    ngOnInit() {
        for (const [propertyKey, propertyValue] of Object.entries(TournamentExportConfig)) {
            if (!Number.isNaN(Number(propertyKey))) {
                continue;
            }
            const exportOption: ExportOption = {
                key: propertyKey,
                value: +propertyValue,
                label: this.getLabel(+propertyValue),
                enabled: (this.enabled & +propertyValue) > 0,
                iconName: TournamentExportConfig.qrCode === +propertyValue ? 'qrcode' : undefined
            };
            this.exportOptions.push(exportOption);
            this.form.addControl(exportOption.key, this.formBuilder.control(exportOption.enabled));
        }
    }

    noneSelected(): boolean {
        return this.exportOptions.every(exportOption => !this.form.value[exportOption.key]);
    }

    closePdf(): TournamentExportAction {
        return { subjects: this.getSubjects(), format: TournamentExportFormat.Pdf }
    }

    closeExcel(): TournamentExportAction {
        return { subjects: this.getSubjects(), format: TournamentExportFormat.Excel }
    }

    protected getSubjects(): number {
        let subjects: number = 0;
        this.exportOptions.forEach(exportOption => {
            if (this.form.value[exportOption.key]) {
                subjects += exportOption.value;
            };
        });
        return subjects;
    }

    getLabel(configItem: number): string {
        switch (configItem) {
            case TournamentExportConfig.gameNotes:
                return 'wedstrijdbriefjes';
            case TournamentExportConfig.structure:
                return 'opzet & indeling';
            case TournamentExportConfig.gamesPerPoule:
                return 'wedstrijden per poule';
            case TournamentExportConfig.gamesPerField:
                return 'wedstrijden per ' + this.fieldDescription;
            case TournamentExportConfig.planning:
                return 'wedstrijdplanning';
            case TournamentExportConfig.poulePivotTables:
                return 'poule draaitabellen';
            case TournamentExportConfig.lockerRooms:
                return 'kleedkamers';
            case TournamentExportConfig.qrCode:
                return 'delen met link en qr-code';
        }
        return '';
    }
}

export interface TournamentExportAction {
    subjects: number;
    format: TournamentExportFormat;
}

interface ExportOption {
    key: string;
    label: string;
    enabled: boolean;
    value: number;
    iconName: IconName | undefined;
}
