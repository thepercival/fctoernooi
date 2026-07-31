import { Component, OnInit, TemplateRef, ChangeDetectionStrategy } from '@angular/core';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';

import { MyNavigation } from '../../shared/common/navigation';
import { Sponsor } from '../../lib/sponsor';
import { JsonSponsor } from '../../lib/sponsor/json';
import { SponsorRepository } from '../../lib/sponsor/repository';
import { TournamentRepository } from '../../lib/tournament/repository';
import { StructureRepository } from '../../lib/ngx-sport/structure/repository';
import { TournamentComponent } from '../../shared/tournament/component';
import { NgbAlert } from '@ng-bootstrap/ng-bootstrap';
import { InfoModalComponent } from '../../shared/tournament/infomodal/infomodal.component';
import { SponsorScreensCreator } from '../../lib/liveboard/screenCreator/sponsors';
import { SponsorScreen } from '../../lib/liveboard/screens';
import { IAlertType } from '../../shared/common/alert';
import { ScreenConfig } from '../../lib/liveboard/screenConfig/json';
import { SponsorMapper } from '../../lib/sponsor/mapper';
import { GlobalEventsManager } from '../../shared/common/eventmanager';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { TournamentNavBarComponent } from '../../shared/tournament/tournamentNavBar/tournamentNavBar.component';
import { faSpinner } from '@fortawesome/free-solid-svg-icons';
import { INFO_MODAL_INPUTS } from '../../shared/modal-input-interfaces/info-modal-inputs.interface';
import { createModalInjector } from '../../shared/modal-input-interfaces/create-modal-injector';

@Component({
    selector: 'app-tournament-sponsor-edit',
    templateUrl: './edit.component.html',
    styleUrls: ['./edit.component.css'],
    standalone: true,
    changeDetection: ChangeDetectionStrategy.Eager,
    imports: [NgbAlert, FontAwesomeModule, TournamentNavBarComponent, FormsModule, ReactiveFormsModule]
})
export class SponsorEditComponent extends TournamentComponent implements OnInit {
    faSpinner = faSpinner;
    public typedForm: FormGroup<{
        name: FormControl<string>,
        screenNr: FormControl<number|null>,
        url: FormControl<string>,
        logoExtension: FormControl<string|null>,
        logoFileStream: FormControl<Blob|null>,
      }>;


    base64Logo!: string | ArrayBuffer | null;

    private sponsorScreensCreator!: SponsorScreensCreator;
    rangeScreenNrs: number[] = [];
    logoInputType: LogoInput;
    
    newLogoUploaded: boolean;
    private readonly LOGO_ASPECTRATIO_THRESHOLD = 0.34;
    public originalSponsor: Sponsor | undefined;
    private screenConfig: ScreenConfig;

    validations: SponsorValidations = {
        minlengthname: Sponsor.MIN_LENGTH_NAME,
        maxlengthname: Sponsor.MAX_LENGTH_NAME,
        minScreenNr: 1,
        maxScreenNr: SponsorScreensCreator.MaxNrOfSponsorScreens,
        maxlengthurl: Sponsor.MAX_LENGTH_URL,
        maxlengthextension: 10,
    };

    constructor(
        route: ActivatedRoute,
        router: Router,
        tournamentRepository: TournamentRepository,
        structureRepository: StructureRepository,
        globalEventsManager: GlobalEventsManager,        
        private sponsorRepository: SponsorRepository,
        private sponsorMapper: SponsorMapper,
        private myNavigation: MyNavigation
    ) {
        super(route, router, tournamentRepository, structureRepository, globalEventsManager);
        this.logoInputType = LogoInput.ByUpload;
        this.newLogoUploaded = false;
        this.screenConfig = this.sponsorMapper.getDefaultScreenConfig();

        this.typedForm = new FormGroup({
            name: new FormControl('', { nonNullable: true, validators: 
                [
                    Validators.required,
                    Validators.minLength(this.validations.minlengthname),
                    Validators.maxLength(this.validations.maxlengthname)
                ] 
            }),
            screenNr: new FormControl<number | null>(null, {
                nonNullable: false, 
                validators:
                    [
                        Validators.min(this.validations.minScreenNr),
                        Validators.max(this.validations.maxScreenNr)
                    ]
            }),
            url: new FormControl('', { nonNullable: true, validators: 
                [
                    Validators.maxLength(this.validations.maxlengthurl)
                ] 
            }),
            logoExtension: new FormControl('', { validators: 
                [
                    Validators.maxLength(this.validations.maxlengthurl)
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
            super.myNgOnInit(() => this.postInit(+params.sponsorId));
        });
    }

    private postInit(id: number | string) {
        this.sponsorScreensCreator = new SponsorScreensCreator(this.screenConfig);
        this.originalSponsor = this.tournament.getSponsors().find(sponsorIt => sponsorIt.getId() === id);

        this.rangeScreenNrs = [];
        const screens: SponsorScreen[] = this.sponsorScreensCreator.getScreens(this.tournament.getSponsors());
        for (let screenNr = 1; screenNr <= SponsorScreensCreator.MaxNrOfSponsorScreens; screenNr++) {
            const screen = this.sponsorScreensCreator.getScreen(screens, screenNr);
            if (screen !== undefined && (screen.getSponsors().length > SponsorScreensCreator.MaxNrOfSponsorsPerScreen
                || (screen.getSponsors().length === SponsorScreensCreator.MaxNrOfSponsorsPerScreen
                    && !(this.originalSponsor !== undefined && this.originalSponsor.getScreenNr() === screenNr)))) {
                continue;
            }
            this.rangeScreenNrs.push(screenNr);
        }
        if (this.originalSponsor === undefined) {
            if( this.rangeScreenNrs.length > 0 ) {
                this.typedForm.controls.screenNr.setValue(this.rangeScreenNrs[0]);
            }
            this.processing.set(false);
            return;
        }

        this.typedForm.controls.name.setValue(this.originalSponsor.getName());
        this.typedForm.controls.url.setValue(this.originalSponsor.getUrl());
        this.typedForm.controls.logoExtension.setValue(this.originalSponsor.getLogoExtension() ?? null);
        this.typedForm.controls.screenNr.setValue(this.originalSponsor.getScreenNr());
        this.processing.set(false);
    }

    save(): boolean {
        this.processing.set(true);
        this.alert.set({ type: IAlertType.Info, message: 'de sponsor wordt opgeslagen' });

        const reposCall = this.originalSponsor ? this.sponsorRepository.editObject(this.formToJson(), this.originalSponsor, this.tournament) : this.sponsorRepository.createObject(this.formToJson(), this.tournament);

        reposCall.subscribe({
            next: (sponsor: Sponsor) => {
                this.originalSponsor = sponsor;
                this.processLogoAndNavigateBack(sponsor);
            },
            error: (e) => {
                this.alert.set({ type: IAlertType.Danger, message: e }); this.processing.set(false);
            },
            complete: () => this.processing.set(false)
        });
        return false;
    }

    formToJson(): JsonSponsor {
        const url = this.typedForm.controls.url.value;
        const logoExtension = this.logoInputType === LogoInput.ByUrl ? this.typedForm.controls.logoExtension.value ?? undefined : undefined;
        return {
            id: this.originalSponsor ? this.originalSponsor.getId() : 0,
            name: this.typedForm.controls.name.value,
            url: url ? url : undefined,
            logoExtension: logoExtension,
            screenNr: this.typedForm.controls.screenNr.value === null ? undefined : this.typedForm.controls.screenNr.value
        }
    }

    processLogoAndNavigateBack(sponsor: Sponsor) {
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
        this.sponsorRepository.uploadImage(input, sponsor, this.tournament)
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
        return 'De afbeelding moet in jpg-, png-, gif-, of svgformaat worden aangeleverd. De afbeelding wordt geschaald naar een hoogte van 200px. De beeldverhouding moet liggen tussen '
            + (1 - this.LOGO_ASPECTRATIO_THRESHOLD).toFixed(2) + ' en ' + (1 + this.LOGO_ASPECTRATIO_THRESHOLD).toFixed(2);
    }

    openInfoModal(modalContent: TemplateRef<any>) {
        const modalInjector = createModalInjector(this.injector, INFO_MODAL_INPUTS, {
            header: 'uitleg upload logo',
            modalContent
        });
        this.modalService.open(InfoModalComponent, { windowClass: 'info-modal', injector: modalInjector });
    }

    getSponsorLogoUrl(sponsor: Sponsor): string {
        return this.sponsorRepository.getLogoUrl(sponsor);
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

export interface SponsorValidations {
    minlengthname: number;
    maxlengthname: number;
    maxlengthurl: number;
    maxlengthextension: number;
    minScreenNr: number;
    maxScreenNr: number
}

export enum LogoInput {
    ByUrl = 1, ByUpload
}
