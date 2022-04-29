import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { IconName } from '@fortawesome/fontawesome-svg-core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { Subscription, timer } from 'rxjs';
import { PdfRepository, TournamentExportConfig } from '../../lib/pdf/repository';
import { AppErrorHandler } from '../../lib/repository';
import { Tournament } from '../../lib/tournament';
import { IAlert, IAlertType } from '../../shared/common/alert';
import { catchError, switchMap } from 'rxjs/operators';

@Component({
    selector: 'app-ngbd-modal-export-config',
    templateUrl: './exportmodal.component.html',
    styleUrls: ['./exportmodal.component.scss']
})
export class ExportModalComponent implements OnInit, OnDestroy {
    @Input() tournament!: Tournament;
    @Input() subjects!: number;
    @Input() fieldDescription!: string;
    form: FormGroup;
    creating = false;
    exportOptions: ExportOption[] = [];
    refreshTimer: Subscription | undefined;
    private appErrorHandler: AppErrorHandler;
    progressPercentage = 0;
    postCreateAlert: IAlert | undefined;

    constructor(
        public activeModal: NgbActiveModal,
        private formBuilder: FormBuilder,
        private pdfRepository: PdfRepository) {
        this.form = formBuilder.group({});
        this.appErrorHandler = new AppErrorHandler();
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
                enabled: (this.subjects & +propertyValue) > 0,
                iconName: TournamentExportConfig.qrCode === +propertyValue ? 'qrcode' : undefined
            };
            this.exportOptions.push(exportOption);
            this.form.addControl(exportOption.key, this.formBuilder.control(exportOption.enabled));
        }
    }



    noneSelected(): boolean {
        return this.exportOptions.every(exportOption => !this.form.value[exportOption.key]);
    }

    protected formToSubjects(): number {
        let subjects: number = 0;
        this.exportOptions.forEach((exportOption: ExportOption) => {
            if (this.form.value[exportOption.key] === true) {
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

    createPdfAndShowProgress() {
        const subjects = this.formToSubjects();
        localStorage.setItem('exportSubjects', JSON.stringify(subjects));
        this.postCreateAlert = undefined;
        this.creating = true;
        this.progressPercentage = 0;
        this.pdfRepository.createObject(this.tournament, subjects)
            .subscribe({
                next: (fileName: string) => {
                    this.showProgress(fileName);
                },
                error: (e) => {
                    this.setPostCreateAlert(IAlertType.Danger, e);
                }
            });
    }

    showProgress(fileName: string) {
        this.refreshTimer = timer(0, 2000) // repeats every 2 seconds
            .pipe(
                switchMap(() => this.pdfRepository.progress(this.tournament).pipe()),
                catchError(err => this.appErrorHandler.handleError(err))
            ).subscribe({
                next: (progressPerc: number | undefined) => {
                    if (progressPerc === undefined) {
                        return;
                    }
                    this.progressPercentage = progressPerc;
                    if (progressPerc === 100) {
                        this.stopTimer();
                        this.activeModal.close(this.pdfRepository.getPdfUrl(this.tournament, fileName));
                    }
                },
                error: (e) => {
                    this.setPostCreateAlert(IAlertType.Danger, e);
                }
            });
    }

    ngOnDestroy() {
        this.stopTimer();
    }

    stopTimer() {
        if (this.refreshTimer !== undefined) {
            this.refreshTimer.unsubscribe();
        }
    }

    protected setPostCreateAlert(type: IAlertType, message: string) {
        this.postCreateAlert = { 'type': type, 'message': message };
        this.creating = false;
    }
}

interface ExportOption {
    key: string;
    label: string;
    enabled: boolean;
    value: TournamentExportConfig;
    iconName: IconName | undefined;
}
