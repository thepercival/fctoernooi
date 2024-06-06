import { Component, OnDestroy, OnInit, input } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { IconName } from '@fortawesome/fontawesome-svg-core';
import { NgbActiveModal, NgbAlert, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { Subscription, timer } from 'rxjs';
import { PdfRepository, TournamentExportConfig } from '../../lib/pdf/repository';
import { AppErrorHandler } from '../../lib/repository';
import { Tournament } from '../../lib/tournament';
import { IAlert, IAlertType } from '../../shared/common/alert';
import { catchError, switchMap } from 'rxjs/operators';
import { Router } from '@angular/router';
import { TournamentRegistrationSettings } from '../../lib/tournament/registration/settings';
import { PrintServiceModalComponent } from './print-service-modal.component';

@Component({
    selector: 'app-ngbd-modal-export-config',
    templateUrl: './exportmodal.component.html',
    styleUrls: ['./exportmodal.component.scss']
})
export class ExportModalComponent implements OnInit, OnDestroy {
    tournament: Tournament|undefined;
    subjects: number = 0;
    readonlySubjects: number = 0;
    fieldDescription: string = '';
    settings: TournamentRegistrationSettings|undefined;
    
    alert: IAlert|undefined;    
    public typedForm: FormGroup;
    creating = false;
    pdfLink: string | undefined;
    public exportOptions: ExportOption[] = [];
    refreshTimer: Subscription | undefined;
    private appErrorHandler: AppErrorHandler;
    progressPercentage = 0;
    postCreateAlert: IAlert | undefined;

    constructor(
        public activeModal: NgbActiveModal,
        private pdfRepository: PdfRepository,
        private modalService: NgbModal,
        router: Router) {
        this.typedForm = new FormGroup({});
        this.appErrorHandler = new AppErrorHandler(router);
        
    }

    ngOnInit() {      

        for (const [propertyKey, propertyValue] of Object.entries(TournamentExportConfig)) {
            if (!Number.isNaN(Number(propertyKey))) {
                continue;
            }
            if (TournamentExportConfig.registrationForm === +propertyValue && this.settings?.isEnabled() !== true ) {
                continue;
            }
            const exportOption: ExportOption = {
                key: propertyKey,
                value: +propertyValue,
                label: this.getLabel(+propertyValue),
                enabled: (this.subjects & +propertyValue) > 0,
                readonly: (this.readonlySubjects & +propertyValue) > 0,
                iconName: TournamentExportConfig.qrCode === +propertyValue ? 'qrcode' : undefined
            };
            this.exportOptions.push(exportOption);
            this.typedForm.addControl(exportOption.key, new FormControl({ value: exportOption.enabled, disabled: exportOption.readonly }));
        }
        this.exportOptions.sort((exportOptionA: ExportOption, exportOptionB: ExportOption): number => {
            
            if (exportOptionA.value === TournamentExportConfig.registrationForm ) {
                return -1;
            }
            return exportOptionA.value - exportOptionB.value;
        });
    }



    noneSelected(): boolean {
        return this.exportOptions.every(exportOption => !this.typedForm.value[exportOption.key]);
    }

    protected formToSubjects(): number {
        let subjects: number = 0;
        this.exportOptions.forEach((exportOption: ExportOption) => {
            if (this.typedForm.value[exportOption.key] === true) {
                subjects += exportOption.value;
            };
        });
        return subjects;
    }

    getLabel(configItem: number): string {
        switch (configItem) {
            case TournamentExportConfig.registrationForm:
                return 'inschrijfformulier'; 
            case TournamentExportConfig.gameNotes:
                return 'wedstrijdbriefjes';
            case TournamentExportConfig.structure:
                return 'opzet & indeling';
            case TournamentExportConfig.gamesPerPoule:
                return 'wedstrijden per poule';
            case TournamentExportConfig.gamesPerField:
                return 'wedstrijden per ' + this.fieldDescription;
            case TournamentExportConfig.planning:
                return 'wedstrijden';
            case TournamentExportConfig.poulePivotTables:
                return 'poule draaitabellen';
            case TournamentExportConfig.lockerRooms:
                return 'kleedkamers';
            case TournamentExportConfig.qrCode:
                return 'delen met link en qr-code';
        }
        return '';
    }

    createPdfAndShowProgress(tournament: Tournament) {
        const subjects = this.formToSubjects();
        localStorage.setItem('exportSubjects', JSON.stringify(subjects));
        this.postCreateAlert = undefined;
        this.creating = true;
        this.progressPercentage = 0;
        this.pdfRepository.createObject(tournament, subjects)
            .subscribe({
                next: (fileName: string) => {
                    this.showProgress(tournament,fileName);
                },
                error: (e) => {
                    this.setPostCreateAlert(IAlertType.Danger, e);
                }
            });
    }

    showProgress(tournament: Tournament, fileName: string) {
        this.refreshTimer = timer(0, 2000) // repeats every 2 seconds
            .pipe(
                switchMap(() => this.pdfRepository.progress(tournament).pipe()),
                catchError(err => this.appErrorHandler.handleError(err))
            ).subscribe({
                next: (progressPerc: number | undefined) => {
                    if (progressPerc === undefined) {
                        return;
                    }
                    this.progressPercentage = progressPerc;
                    if (progressPerc === 100) {
                        this.stopTimer();
                        this.pdfLink = this.pdfRepository.getPdfUrl(tournament, fileName);
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

    openModalAboutPrintService(tournament: Tournament) {
        const activeModal = this.modalService.open(PrintServiceModalComponent);
        activeModal.result.then((apply: boolean) => {
            if (apply) {
                this.pdfRepository.applyService(tournament)
                    .subscribe({
                        next: () => {
                            this.alert = { type: IAlertType.Info, message: 'je aanvraag wordt verwerkt' };
                        },
                        error: (e) => {
                            this.alert = { type: IAlertType.Danger, message: 'de aanvraag kan niet verwerkt worden' };
                        }
                    });
            }
        }, (reason) => {
        });
    }
}

interface ExportOption {
    key: string;
    label: string;
    enabled: boolean;
    readonly: boolean;
    value: TournamentExportConfig;
    iconName: IconName | undefined;
}
