import { Component, HostListener, OnInit, TemplateRef } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';

import { MyNavigation } from '../../shared/common/navigation';
import { Sponsor } from '../../lib/sponsor';
import { JsonSponsor } from '../../lib/sponsor/json';
import { SponsorRepository } from '../../lib/sponsor/repository';
import { TournamentRepository } from '../../lib/tournament/repository';
import { StructureRepository } from '../../lib/ngx-sport/structure/repository';
import { TournamentComponent } from '../../shared/tournament/component';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { InfoModalComponent } from '../../shared/tournament/infomodal/infomodal.component';
import { SponsorScreensCreator } from '../../lib/liveboard/screenCreator/sponsors';
import { SponsorScreen } from '../../lib/liveboard/screens';
import { IAlertType } from '../../shared/common/alert';
import { ScreenConfigName } from '../../lib/liveboard/screenConfig/name';
import { ScreenConfig } from '../../lib/liveboard/screenConfig/json';
import { SponsorMapper } from '../../lib/sponsor/mapper';

@Component({
    selector: 'app-tournament-sponsor-edit',
    templateUrl: './edit.component.html',
    styleUrls: ['./edit.component.css']
})
export class SponsorEditComponent extends TournamentComponent implements OnInit {
    form: FormGroup;
    base64Logo!: string | ArrayBuffer | null;

    private sponsorScreensCreator!: SponsorScreensCreator;
    rangeScreenNrs: number[] = [];
    logoInput: number;
    logoInputUpload = 1;
    logoInputUrl = 2;
    newLogoUploaded: boolean;
    private readonly LOGO_ASPECTRATIO_THRESHOLD = 0.34;
    public originalSponsor: Sponsor | undefined;
    private screenConfig: ScreenConfig;

    validations: SponsorValidations = {
        minlengthname: Sponsor.MIN_LENGTH_NAME,
        maxlengthname: Sponsor.MAX_LENGTH_NAME,
        maxlengthurl: Sponsor.MAX_LENGTH_URL,
    };

    constructor(
        private sponsorRepository: SponsorRepository,
        private sponsorMapper: SponsorMapper,
        route: ActivatedRoute,
        router: Router,
        private modalService: NgbModal,
        tournamentRepository: TournamentRepository,
        structureRepository: StructureRepository,
        private myNavigation: MyNavigation,
        fb: FormBuilder
    ) {
        super(route, router, tournamentRepository, structureRepository);
        this.logoInput = this.logoInputUpload;
        this.newLogoUploaded = false;
        this.screenConfig = this.sponsorMapper.getDefaultScreenConfig();

        this.form = fb.group({
            name: ['', Validators.compose([
                Validators.required,
                Validators.minLength(this.validations.minlengthname),
                Validators.maxLength(this.validations.maxlengthname)
            ])],
            screennr: ['', Validators.compose([])],
            url: ['', Validators.compose([
                Validators.maxLength(this.validations.maxlengthurl)
            ])],
            logo: null,
            logourl: ['', Validators.compose([
                Validators.maxLength(this.validations.maxlengthurl)
            ])],
            logoupload: null
        });
    }

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
            const currentScreenNr = this.rangeScreenNrs.length > 0 ? this.rangeScreenNrs[0] : undefined;
            this.form.controls.screennr.setValue(currentScreenNr);
            this.processing = false;
            return;
        }

        this.form.controls.name.setValue(this.originalSponsor.getName());
        this.form.controls.url.setValue(this.originalSponsor.getUrl());
        this.form.controls.logourl.setValue(this.originalSponsor.getLogoUrl());
        this.form.controls.screennr.setValue(this.originalSponsor.getScreenNr());
        this.processing = false;
    }

    save(): boolean {
        this.processing = true;
        this.setAlert(IAlertType.Info, 'de sponsor wordt opgeslagen');

        const reposCall = this.originalSponsor ? this.sponsorRepository.editObject(this.formToJson(), this.originalSponsor, this.tournament) : this.sponsorRepository.createObject(this.formToJson(), this.tournament);

        reposCall.subscribe({
            next: (sponsor: Sponsor) => {
                this.originalSponsor = sponsor;
                this.processLogoAndNavigateBack(sponsor);
            },
            error: (e) => {
                this.setAlert(IAlertType.Danger, e); this.processing = false;
            },
            complete: () => this.processing = false
        });
        return false;
    }

    formToJson(): JsonSponsor {
        const url = this.form.controls.url.value;
        const logoUrl = this.logoInput === this.logoInputUrl ? this.form.controls.logourl.value : undefined;
        return {
            id: this.originalSponsor ? this.originalSponsor.getId() : 0,
            name: this.form.controls.name.value,
            url: url ? url : undefined,
            logoUrl: logoUrl,
            screenNr: this.form.controls.screennr.value
        }
    }

    processLogoAndNavigateBack(sponsor: Sponsor) {
        if (this.logoInput === this.logoInputUrl || this.newLogoUploaded !== true) {
            this.processing = false;
            this.navigateBack();
            return;
        }
        const input = new FormData();
        input.append('logostream', this.form.get('logoupload')?.value);
        this.sponsorRepository.uploadImage(input, sponsor, this.tournament)
            .subscribe({
                next: () => {
                    this.processing = false;
                    this.navigateBack();
                },
                error: (e) => {
                    this.setAlert(IAlertType.Danger, e); this.processing = false;
                },
                complete: () => this.processing = false
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
            this.setAlert(IAlertType.Danger, 'alleen plaatjes worden ondersteund');
            return;
        }
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = (_event) => {
            this.base64Logo = reader.result;
        };
        this.form.controls.logoupload.setValue(file);

        this.newLogoUploaded = true;
    }

    toggleLogoInput() {
        if (this.logoInput === this.logoInputUpload) {
            this.logoInput = this.logoInputUrl;
        } else {
            this.logoInput = this.logoInputUpload;
        }
    }

    navigateBack() {
        this.myNavigation.back();
    }

    getLogoUploadDescription() {
        return 'het plaatje wordt geschaald naar een hoogte van 200px. De beeldverhouding moet liggen tussen '
            + (1 - this.LOGO_ASPECTRATIO_THRESHOLD).toFixed(2) + ' en ' + (1 + this.LOGO_ASPECTRATIO_THRESHOLD).toFixed(2);
    }

    openInfoModal(modalContent: TemplateRef<any>) {
        const activeModal = this.modalService.open(InfoModalComponent, { windowClass: 'info-modal' });
        activeModal.componentInstance.header = 'uitleg upload logo';
        activeModal.componentInstance.modalContent = modalContent;
    }
}

export interface SponsorValidations {
    minlengthname: number;
    maxlengthname: number;
    maxlengthurl: number;
}

interface HTMLInputEvent extends Event {
    target: HTMLInputElement & EventTarget;
}
