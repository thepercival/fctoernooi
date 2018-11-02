import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { PlanningRepository, StructureRepository } from 'ngx-sport';

import { TournamentComponent } from '../component';
import { TournamentRepository } from '../repository';
import { Sponsor } from '../sponsor';
import { ISponsor, SponsorRepository } from '../sponsor/repository';

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
        private planningRepository: PlanningRepository,
        fb: FormBuilder
    ) {
        super(route, router, tournamentRepository, structureRepository);
        this.customForm = fb.group({
            name: ['', Validators.compose([
                Validators.required,
                Validators.minLength(this.validations.minlengthname),
                Validators.maxLength(this.validations.maxlengthname)
            ])],
            url: ['', Validators.compose([
                Validators.maxLength(this.validations.maxlengthurl)
            ])],
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

        const ref: ISponsor = {
            name: name,
            url: url ? url : undefined
        };
        this.sponsorRepository.createObject(ref, this.tournament)
            .subscribe(
            /* happy path */ sponsorRes => {
                    this.processing = false;
                    this.navigateBack();
                },
            /* error path */ e => { this.setAlert('danger', e); this.processing = false; },
            /* onComplete */() => this.processing = false
            );
    }

    edit() {
        const name = this.customForm.controls.name.value;
        const url = this.customForm.controls.url.value;

        const sponsor = this.tournament.getSponsors().find(sponsorIt => sponsorIt.getId() === this.sponsorId);
        sponsor.setName(name);
        sponsor.setUrl(url ? url : undefined);
        this.sponsorRepository.editObject(sponsor, this.tournament)
            .subscribe(
            /* happy path */ sponsorRes => {
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

    navigateBack() {
        this.router.navigate(this.getForwarUrl(), { queryParams: this.getForwarUrlQueryParams() });
    }
}

export interface RefValidations {
    minlengthname: number;
    maxlengthname: number;
    maxlengthurl: number;
}
