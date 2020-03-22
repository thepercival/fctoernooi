import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';

import { MyNavigation } from '../../shared/common/navigation';
import { SponsorScreenService } from '../../lib/liveboard/screens';
import { Sponsor } from '../../lib/sponsor';
import { JsonSponsor } from '../../lib/sponsor/mapper';
import { SponsorRepository } from '../../lib/sponsor/repository';
import { TournamentRepository } from '../../lib/tournament/repository';
import { StructureRepository } from '../../lib/ngx-sport/structure/repository';
import { TournamentComponent } from '../../shared/tournament/component';

@Component({
    selector: 'app-tournament-sponsor-edit',
    templateUrl: './edit.component.html',
    styleUrls: ['./edit.component.css']
})
export class SponsorEditComponent extends TournamentComponent implements OnInit {
    form: FormGroup;
    sponsor: Sponsor;
    base64Logo: string | ArrayBuffer;

    private sponsorScreenService: SponsorScreenService;
    rangeScreenNrs: number[];
    logoInput: number;
    logoInputUpload = 1;
    logoInputUrl = 2;
    newLogoUploaded: boolean;
    private readonly LOGO_ASPECTRATIO_THRESHOLD = 0.34;

    validations: RefValidations = {
        minlengthname: Sponsor.MIN_LENGTH_NAME,
        maxlengthname: Sponsor.MAX_LENGTH_NAME,
        maxlengthurl: Sponsor.MAX_LENGTH_URL,
    };

    constructor(
        private sponsorRepository: SponsorRepository,
        route: ActivatedRoute,
        router: Router,
        tournamentRepository: TournamentRepository,
        structureRepository: StructureRepository,
        private myNavigation: MyNavigation,
        fb: FormBuilder
    ) {
        super(route, router, tournamentRepository, structureRepository);
        this.logoInput = this.logoInputUpload;
        this.newLogoUploaded = false;

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

    private postInit(id: number) {
        this.sponsorScreenService = new SponsorScreenService(this.tournament.getSponsors());

        if (id !== undefined && id > 0) {
            this.sponsor = this.tournament.getSponsors().find(sponsorIt => sponsorIt.getId() === id);
        }

        this.rangeScreenNrs = [];
        for (let screenNr = 1; screenNr <= SponsorScreenService.MAXNROFSPONSORSCREENS; screenNr++) {
            const screen = this.sponsorScreenService.getScreen(screenNr);
            if (screen !== undefined && (screen.getSponsors().length > SponsorScreenService.MAXNROFSPONSORSPERSCREEN
                || (screen.getSponsors().length === SponsorScreenService.MAXNROFSPONSORSPERSCREEN
                    && !(this.sponsor !== undefined && this.sponsor.getScreenNr() === screenNr)))) {
                continue;
            }
            this.rangeScreenNrs.push(screenNr);
        }
        if (this.sponsor === undefined) {
            const currentScreenNr = this.rangeScreenNrs.length > 0 ? this.rangeScreenNrs[0] : undefined;
            this.form.controls.screennr.setValue(currentScreenNr);
            this.processing = false;
            return;
        }

        this.form.controls.name.setValue(this.sponsor.getName());
        this.form.controls.url.setValue(this.sponsor.getUrl());
        this.form.controls.logourl.setValue(this.sponsor.getLogoUrl());
        this.form.controls.screennr.setValue(this.sponsor.getScreenNr());
        this.processing = false;
    }

    save(): boolean {
        this.processing = true;
        this.setAlert('info', 'de sponsor wordt opgeslagen');
        if (this.sponsor !== undefined) {
            this.edit();
        } else {
            this.add();
        }
        return false;
    }

    add() {
        const name = this.form.controls.name.value;
        const url = this.form.controls.url.value;
        const logoUrl = this.logoInput === this.logoInputUrl ? this.form.controls.logourl.value : undefined;
        const screennr = this.form.controls.screennr.value;

        const ref: JsonSponsor = {
            name: name,
            url: url ? url : undefined,
            logoUrl: logoUrl,
            screenNr: screennr
        };
        this.sponsorRepository.createObject(ref, this.tournament)
            .subscribe(
            /* happy path */ sponsorRes => {
                    this.processLogoAndNavigateBack(sponsorRes.getId());
                },
            /* error path */ e => { this.setAlert('danger', e); this.processing = false; },
            /* onComplete */() => this.processing = false
            );
    }

    edit() {
        const name = this.form.controls.name.value;
        const url = this.form.controls.url.value;

        const logoUrl = (this.newLogoUploaded !== true || this.logoInput === this.logoInputUrl) ?
            this.form.controls.logourl.value : undefined;

        this.sponsor.setName(name);
        this.sponsor.setUrl(url ? url : undefined);
        this.sponsor.setLogoUrl(logoUrl);
        this.sponsor.setScreenNr(this.form.controls.screennr.value);
        this.sponsorRepository.editObject(this.sponsor, this.tournament)
            .subscribe(
            /* happy path */ sponsorRes => {
                    this.processLogoAndNavigateBack(sponsorRes.getId());
                },
            /* error path */ e => { this.setAlert('danger', e); this.processing = false; },
            /* onComplete */() => { this.processing = false; }
            );
    }

    processLogoAndNavigateBack(sponsorId: number) {
        if (this.logoInput === this.logoInputUrl || this.newLogoUploaded !== true) {
            this.processing = false;
            this.navigateBack();
            return;
        }
        const input = new FormData();
        input.append('logostream', this.form.get('logoupload').value);
        this.sponsorRepository.uploadImage(sponsorId, this.tournament, input)
            .subscribe(
                        /* happy path */ logoUrlRes => {
                    this.processing = false;
                    this.navigateBack();
                },
                        /* error path */ e => { this.setAlert('danger', e); this.processing = false; },
                        /* onComplete */() => { this.processing = false; }
            );
    }

    onFileChange(event) {
        if (event.target.files.length === 0) {
            return;
        }
        const file = event.target.files[0];
        const mimeType = file.type;
        if (mimeType.match(/image\/*/) == null) {
            this.setAlert('danger', 'alleen plaatjes worden ondersteund');
            return;
        }
        const reader = new FileReader();
        // const imagePath = event.target.files;
        reader.readAsDataURL(file);
        reader.onload = (_event) => {
            this.base64Logo = reader.result;
        };
        this.form.get('logoupload').setValue(file);

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
}

export interface RefValidations {
    minlengthname: number;
    maxlengthname: number;
    maxlengthurl: number;
}
