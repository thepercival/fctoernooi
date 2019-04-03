import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { StructureRepository } from 'ngx-sport';

import { Sponsor } from '../../lib/sponsor';
import { JsonSponsor } from '../../lib/sponsor/mapper';
import { SponsorRepository } from '../../lib/sponsor/repository';
import { TournamentRepository } from '../../lib/tournament/repository';
import { TournamentComponent } from '../component';

@Component({
    selector: 'app-tournament-sponsor-edit',
    templateUrl: './edit.component.html',
    styleUrls: ['./edit.component.css']
})
export class TournamentSponsorEditComponent extends TournamentComponent implements OnInit {
    returnUrl: string;
    returnUrlParam: number;
    returnUrlQueryParamKey: string;
    returnUrlQueryParamValue: string;
    customForm: FormGroup;
    sponsorId: number;
    base64Logo: string | ArrayBuffer;

    logoInput: number;
    logoInputUpload = 1;
    logoInputUrl = 2;
    newLogoUploaded: boolean;

    validations: RefValidations = {
        minlengthname: Sponsor.MIN_LENGTH_NAME,
        maxlengthname: Sponsor.MAX_LENGTH_NAME,
        maxlengthurl: Sponsor.MAX_LENGTH_URL
    };

    constructor(
        private sponsorRepository: SponsorRepository,
        route: ActivatedRoute,
        router: Router,
        tournamentRepository: TournamentRepository,
        structureRepository: StructureRepository,
        fb: FormBuilder
    ) {
        super(route, router, tournamentRepository, structureRepository);
        this.logoInput = this.logoInputUpload;
        this.newLogoUploaded = false;
        this.customForm = fb.group({
            name: ['', Validators.compose([
                Validators.required,
                Validators.minLength(this.validations.minlengthname),
                Validators.maxLength(this.validations.maxlengthname)
            ])],
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
        this.route.queryParamMap.subscribe(params => {
            this.returnUrl = params.get('returnAction');
            this.returnUrlParam = +params.get('returnParam');
            this.returnUrlQueryParamKey = params.get('returnQueryParamKey');
            this.returnUrlQueryParamValue = params.get('returnQueryParamValue');
        });
    }

    private postInit(id: number) {
        if (id === undefined || id < 1) {
            this.processing = false;
            return;
        }
        const sponsor = this.tournament.getSponsors().find(sponsorIt => sponsorIt.getId() === id);
        if (sponsor === undefined) {
            this.processing = false;
            return;
        }
        this.sponsorId = id;
        this.customForm.controls.name.setValue(sponsor.getName());
        this.customForm.controls.url.setValue(sponsor.getUrl());
        this.customForm.controls.logourl.setValue(sponsor.getLogoUrl());
        this.processing = false;
    }

    save(): boolean {
        this.processing = true;
        this.setAlert('info', 'de sponsor wordt opgeslagen');
        if (this.sponsorId > 0) {
            this.edit();
        } else {
            this.add();
        }
        return false;
    }

    add() {
        const name = this.customForm.controls.name.value;
        const url = this.customForm.controls.url.value;
        const logoUrl = this.logoInput === this.logoInputUrl ? this.customForm.controls.logourl.value : undefined;

        const ref: JsonSponsor = {
            name: name,
            url: url ? url : undefined,
            logoUrl: logoUrl,
            screenNr: 1
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
        const name = this.customForm.controls.name.value;
        const url = this.customForm.controls.url.value;

        const logoUrl = (this.newLogoUploaded !== true || this.logoInput === this.logoInputUrl) ? this.customForm.controls.logourl.value : undefined;

        const sponsor = this.tournament.getSponsors().find(sponsorIt => sponsorIt.getId() === this.sponsorId);
        sponsor.setName(name);
        sponsor.setUrl(url ? url : undefined);
        sponsor.setLogoUrl(logoUrl);
        sponsor.setScreenNr(1);
        this.sponsorRepository.editObject(sponsor, this.tournament)
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
        let input = new FormData();
        input.append('logostream', this.customForm.get('logoupload').value);
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

    private getForwarUrl() {
        return [this.returnUrl, this.returnUrlParam];
    }

    private getForwarUrlQueryParams(): {} {
        const queryParams = {};
        queryParams[this.returnUrlQueryParamKey] = this.returnUrlQueryParamValue;
        return queryParams;
    }

    onFileChange(event) {
        if (event.target.files.length === 0) {
            return;
        }
        let file = event.target.files[0];
        var mimeType = file.type;
        if (mimeType.match(/image\/*/) == null) {
            this.setAlert('danger', "alleen plaatjes worden ondersteund");
            return;
        }

        var reader = new FileReader();
        // const imagePath = event.target.files;
        reader.readAsDataURL(file);
        reader.onload = (_event) => {
            this.base64Logo = reader.result;
        }

        this.customForm.get('logoupload').setValue(file);

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
        this.router.navigate(this.getForwarUrl(), { queryParams: this.getForwarUrlQueryParams() });
    }
}

export interface RefValidations {
    minlengthname: number;
    maxlengthname: number;
    maxlengthurl: number;
}
