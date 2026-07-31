import { Component, inject, OnInit, TemplateRef, ChangeDetectionStrategy } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';

import { MyNavigation } from '../../shared/common/navigation';
import { TournamentRepository } from '../../lib/tournament/repository';
import { StructureRepository } from '../../lib/ngx-sport/structure/repository';
import { TournamentComponent } from '../../shared/tournament/component';
import { NgbAlert, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { InfoModalComponent } from '../../shared/tournament/infomodal/infomodal.component';
import { IAlertType } from '../../shared/common/alert';
import { GlobalEventsManager } from '../../shared/common/eventmanager';
import { League } from 'ngx-sport';
import { TournamentMapper } from '../../lib/tournament/mapper';
import { JsonTournament } from '../../lib/tournament/json';
import { Tournament } from '../../lib/tournament';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { TournamentNavBarComponent } from '../../shared/tournament/tournamentNavBar/tournamentNavBar.component';
import { faSpinner } from '@fortawesome/free-solid-svg-icons';
import { INFO_MODAL_INPUTS, InfoModalInputs } from '../../shared/modal-input-interfaces/info-modal-inputs.interface';
import { createModalInjector } from '../../shared/modal-input-interfaces/create-modal-injector';

@Component({
    selector: 'app-tournament-name-and-theme',
    templateUrl: './name-and-theme.component.html',
    styleUrls: ['./name-and-theme.component.scss'],
    standalone: true,
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [FontAwesomeModule, NgbAlert, TournamentNavBarComponent, ReactiveFormsModule]
})
export class TournamentNameAndThemeComponent extends TournamentComponent implements OnInit {
    private tournamentMapper = inject(TournamentMapper);
    private myNavigation = inject(MyNavigation);

    faSpinner = faSpinner;
    public typedForm: FormGroup<{
        name: FormControl<string>,
        textColor: FormControl<string>,
        bgColor: FormControl<string>,
        logoExtension: FormControl<string|null>,
        logoFileStream: FormControl<Blob|null>,
      }>;

    base64Logo!: string | ArrayBuffer | null;

    logoInputType: LogoInput;    
    newLogoUploaded: boolean;
    private readonly LOGO_ASPECTRATIO_THRESHOLD = 0.34;
    
    validations: TournamentNameValidations = {
        minlengthname: League.MIN_LENGTH_NAME,
        maxlengthname: League.MAX_LENGTH_NAME
    };

    modalService: NgbModal = inject(NgbModal);
    constructor() {
        const route = inject(ActivatedRoute);
        const router = inject(Router);
        const tournamentRepository = inject(TournamentRepository);
        const structureRepository = inject(StructureRepository);
        const globalEventsManager = inject(GlobalEventsManager);

        super(route, router, tournamentRepository, structureRepository, globalEventsManager);
        this.logoInputType = LogoInput.ByUpload;
        this.newLogoUploaded = false;
        
        this.typedForm = new FormGroup({
            name: new FormControl('', { 
                nonNullable: true, 
                validators: [
                    Validators.required,
                    Validators.minLength(this.validations.minlengthname),
                    Validators.maxLength(this.validations.maxlengthname)
                ] 
            }),
            textColor: new FormControl('#93c54b', {
                nonNullable: true, 
                validators:[
                        Validators.maxLength(15)
                    ]
            }),
            bgColor: new FormControl('#3e3f3a', {
                nonNullable: true, 
                validators: [
                    Validators.maxLength(15)
                ]
            }),
            logoExtension: new FormControl('', { 
                validators: [
                    Validators.maxLength(this.validations.maxlengthname)
                ] 
            }),
            logoFileStream:  new FormControl(),
        });
    }

    get LogoInputTypeByUpload(): LogoInput { return LogoInput.ByUpload; }

    // initialsValidator(control: FormControl): { [s: string]: boolean } {
    //     if (control.value.length < this.validations.minlengthinitials || control.value.length < this.validations.maxlengthinitials) {
    //         return { invalidInitials: true };
    //     }
    // }

    ngOnInit() {
        this.route.params.subscribe(params => {
            super.myNgOnInit(() => {
                this.typedForm.controls.name.setValue(this.tournament.getName());
                const theme = this.tournament.getTheme();
                console.log('textcolor', theme?.textColor);
                if (theme!== undefined ) {
                    
                    this.typedForm.controls.textColor.setValue(theme.textColor);
                    this.typedForm.controls.bgColor.setValue(theme.bgColor);
                }
                this.typedForm.controls.logoExtension.setValue(this.tournament.getLogoExtension() ?? null);
                this.processing.set(false); 
            });
        });
    }
    
    save(): boolean {
        this.processing.set(true);
        this.alert.set({ type: IAlertType.Info, message: 'de sponsor wordt opgeslagen' });

        this.tournamentRepository.editObject(this.formToJson()).subscribe({
            next: (tournament: Tournament) => {
                this.tournament = tournament;
                this.processLogoAndNavigateBack(tournament);
            },
            error: (e) => {
                this.alert.set({ type: IAlertType.Danger, message: e }); this.processing.set(false);
            },
            complete: () => this.processing.set(false)
        });
        return false;
    }

    saveName(newName: string) {
        this.alert.set({ type: IAlertType.Info, message: 'de naam wordt opgeslagen' });

        this.processing.set(true);
        const json = this.formToJson()
        this.tournamentRepository.editObject(json)
            .subscribe({
                next: (tournament: Tournament) => {
                    this.tournament = tournament;
                    // this.router.navigate(['/admin', newTournamentId]);
                    this.alert.set({ type: IAlertType.Success, message: 'de naam is opgeslagen' });
                },
                error: (e) => {
                    this.alert.set({ type: IAlertType.Danger, message: 'de naam kon niet worden opgeslagen' });
                    this.processing.set(false);
                },
                complete: () => this.processing.set(false)
            });
    }

    formToJson(): JsonTournament {
        const json = this.tournamentMapper.toJson(this.tournament);
        const logoExtension = this.logoInputType === LogoInput.ByUrl ? (this.typedForm.controls.logoExtension.value ?? undefined) : undefined;
        json.logoExtension = logoExtension;
        json.competition.league.name = this.typedForm.controls.name.value;
        const textColor = this.typedForm.controls.textColor.value;
        const bgColor = this.typedForm.controls.bgColor.value;
        json.theme = { textColor, bgColor };        
        return json;
    }

    processLogoAndNavigateBack(tournament: Tournament) {
        if (this.logoInputType === LogoInput.ByUrl || this.newLogoUploaded !== true) {
            this.processing.set(false);
            this.navigateBack();
            return;
        }
        const input = new FormData();
        const stream: Blob | null = this.typedForm.controls.logoFileStream.value;
        if( stream) {
            input.append('logostream', stream);
        }
        this.tournamentRepository.uploadImage(input, tournament)
            .subscribe({
                next: () => {
                    this.processing.set(false);
                    this.navigateBack();
                },
                error: (e) => {
                    this.alert.set({ type: IAlertType.Danger, message: e }); this.processing.set(false);
                },
                complete: () => this.processing.set(false)
            });
    }

    onFileChange(event: Event) {
        const files: FileList | null = (<HTMLInputElement>event.target).files;
        if (!files || files.length === 0) {
            return;
        }
        const file = files[0];
        const mimeType = file.type;
        if (mimeType.match(/image\/*/) == null) {
            this.alert.set({ type: IAlertType.Danger, message: 'alleen afbeeldingen worden ondersteund' });
            return;
        }
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = (_event) => {
            this.base64Logo = reader.result;
        };
        this.typedForm.controls.logoFileStream.setValue(file);

        this.newLogoUploaded = true;
    }

    toggleLogoInput() {
        if (this.logoInputType === LogoInput.ByUpload) {
            this.logoInputType = LogoInput.ByUrl;
        } else {
            this.logoInputType = LogoInput.ByUpload;
        }
    }

    navigateBack() {
        this.myNavigation.back();
    }

    getLogoUploadDescription() {
        return 'De afbeelding moet in jpg-, png-, gif-, of svgformaat worden aangeleverd. De afbeedling wordt geschaald naar een hoogte van 200px. De beeldverhouding moet liggen tussen '
            + (1 - this.LOGO_ASPECTRATIO_THRESHOLD).toFixed(2) + ' en ' + (1 + this.LOGO_ASPECTRATIO_THRESHOLD).toFixed(2);
    }

    openInfoModal(modalContent: TemplateRef<any>) {
        const modalInputs = {
            header: 'uitleg upload logo',
            modalContent
        } satisfies InfoModalInputs;
        const modalInjector = createModalInjector(this.injector, INFO_MODAL_INPUTS, modalInputs);
        this.modalService.open(InfoModalComponent, { windowClass: 'info-modal', injector: modalInjector });
    }

    getLogoUrl(tournament: Tournament): string {
        return this.tournamentRepository.getLogoUrl(tournament);
    }

    removeFileStream(): boolean {
        this.base64Logo = null;
        this.typedForm.controls.logoFileStream.setValue(null);
        this.typedForm.controls.logoExtension.setValue(null);
        this.logoInputType = LogoInput.ByUpload;
        this.newLogoUploaded = true;
        return false;
    }
}

export interface TournamentNameValidations {
    minlengthname: number;
    maxlengthname: number;
}

export enum LogoInput {
    ByUrl = 1, ByUpload
}
