import { Component, inject, OnDestroy, OnInit, signal, WritableSignal } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { IconDefinition, IconName } from '@fortawesome/fontawesome-svg-core';
import { NgbActiveModal, NgbAlert, NgbModal, NgbProgressbar } from '@ng-bootstrap/ng-bootstrap';
import { Subscription, timer } from 'rxjs';
import { PdfRepository, TournamentExportConfig } from '../../lib/pdf/repository';
import { AppErrorHandler } from '../../lib/repository';
import { Tournament } from '../../lib/tournament';
import { IAlert, IAlertType } from '../../shared/common/alert';
import { catchError, switchMap } from 'rxjs/operators';
import { Router } from '@angular/router';
import { TournamentRegistrationSettings } from '../../lib/tournament/registration/settings';
import { PrintServiceModalComponent } from './print-service-modal.component';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faPrint, faQrcode, faSpinner } from '@fortawesome/free-solid-svg-icons';
import { EXPORT_MODAL_INPUTS } from '../../shared/modal-input-interfaces/export-modal-inputs.interface';

@Component({
    selector: 'app-ngbd-modal-export-config',
    templateUrl: './exportmodal.component.html',
    styleUrls: ['./exportmodal.component.scss'],
    standalone: true,
    imports: [NgbAlert, FontAwesomeModule, NgbProgressbar, ReactiveFormsModule]
})
export class ExportModalComponent implements OnInit, OnDestroy {
    activeModal = inject(NgbActiveModal);
    private pdfRepository = inject(PdfRepository);
    private modalService = inject(NgbModal);

    private readonly modalInputs = inject(EXPORT_MODAL_INPUTS, { optional: true });
    faSpinner = faSpinner;
    faPrint = faPrint;
    faQrCode = faQrcode;
    tournament: Tournament|undefined;
    subjects: number = 0;
    readonlySubjects: number = 0;
    fieldDescription: string = '';
    settings: TournamentRegistrationSettings|undefined;
    
    alert: WritableSignal<IAlert|undefined> = signal(undefined);
    public typedForm: FormGroup;
    creating: WritableSignal<boolean> = signal(false);
    pdfLink: WritableSignal<string | undefined> = signal(undefined);
    public exportOptions: ExportOption[] = [];
    refreshTimer: Subscription | undefined;
    private appErrorHandler: AppErrorHandler;
    progressPercentage: WritableSignal<number> = signal(0);
    postCreateAlert: WritableSignal<IAlert | undefined> = signal(undefined);
    constructor() {
        const router = inject(Router);

        this.typedForm = new FormGroup({});
        this.appErrorHandler = new AppErrorHandler(router);
        if (this.modalInputs) {
            this.tournament = this.modalInputs.tournament;
            this.settings = this.modalInputs.settings;
            this.subjects = this.modalInputs.subjects;
            this.readonlySubjects = this.modalInputs.readonlySubjects;
            this.fieldDescription = this.modalInputs.fieldDescription;
        }
        
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
                iconDef: TournamentExportConfig.qrCode === +propertyValue ? faQrcode : undefined
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
        this.postCreateAlert.set(undefined);
        this.creating.set(true);
        this.progressPercentage.set(0);
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
                    this.progressPercentage.set(progressPerc);
                    if (progressPerc === 100) {
                        this.stopTimer();
                        this.pdfLink.set(this.pdfRepository.getPdfUrl(tournament, fileName));
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
        this.postCreateAlert.set({ 'type': type, 'message': message });
        this.creating.set(false);
    }

    openModalAboutPrintService(tournament: Tournament) {
        const activeModal = this.modalService.open(PrintServiceModalComponent);
        activeModal.result.then((apply: boolean) => {
            if (apply) {
                this.pdfRepository.applyService(tournament)
                    .subscribe({
                        next: () => {
                            this.alert.set({ type: IAlertType.Info, message: 'je aanvraag wordt verwerkt' });
                        },
                        error: (e) => {
                            this.alert.set({ type: IAlertType.Danger, message: 'de aanvraag kan niet verwerkt worden' });
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
    iconDef: IconDefinition | undefined;
}
