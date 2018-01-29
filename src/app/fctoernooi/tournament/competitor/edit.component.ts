import { TournamentRepository } from '../repository';
import { TournamentComponent } from '../component';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ITeam, PoulePlace, PoulePlaceRepository, StructureRepository, Team, TeamRepository } from 'ngx-sport';

import { IAlert } from '../../../app.definitions';

@Component({
    selector: 'app-tournament-competitor-edit',
    templateUrl: './edit.component.html',
    styleUrls: ['./edit.component.css']
})
export class TournamentCompetitorEditComponent extends TournamentComponent implements OnInit {
    loading = false;
    returnUrl: string;
    returnUrlParam: number;
    // returnUrlQueryParamKey: string;
    // returnUrlQueryParamValue: string;
    public alert: IAlert;
    public processing = true;
    customForm: FormGroup;
    poulePlace: PoulePlace;

    validations: TeamValidations = {
        minlengthname: Team.MIN_LENGTH_NAME,
        maxlengthname: Team.MAX_LENGTH_NAME,
        maxlengthinfo: Team.MAX_LENGTH_INFO
    };

    constructor(
        private teamRepository: TeamRepository,
        route: ActivatedRoute,
        router: Router,
        tournamentRepository: TournamentRepository,
        structureRepository: StructureRepository,
        private poulePlaceRepository: PoulePlaceRepository,
        fb: FormBuilder
    ) {
        super(route, router, tournamentRepository, structureRepository);
        this.customForm = fb.group({
            name: ['', Validators.compose([
                Validators.required,
                Validators.minLength(this.validations.minlengthname),
                Validators.maxLength(this.validations.maxlengthname)
            ])],
            info: ['', Validators.compose([
                Validators.maxLength(this.validations.maxlengthinfo)
            ])],
        });
    }

    // initialsValidator(control: FormControl): { [s: string]: boolean } {
    //     if (control.value.length < this.validations.minlengthinitials || control.value.length < this.validations.maxlengthinitials) {
    //         return { invalidInitials: true };
    //     }
    // }

    ngOnInit() {
        this.sub = this.route.params.subscribe(params => {
            super.myNgOnInit(() => this.postInit(+params.poulePlaceId));
        });
        this.route.queryParamMap.subscribe(params => {
            this.returnUrl = params.get('returnAction');
            this.returnUrlParam = +params.get('returnParam');
            // this.returnUrlQueryParamKey = params.get('returnQueryParamKey');
            // this.returnUrlQueryParamValue = params.get('returnQueryParamValue');
        });
    }

    private postInit(poulePlaceId: number) {
        if (poulePlaceId === undefined || poulePlaceId < 1) {
            return;
        }
        const poulePlaces = this.structureService.getFirstRound().getPoulePlaces();
        this.poulePlace = poulePlaces.find(poulePlace => poulePlaceId === poulePlace.getId());
        if (this.poulePlace === undefined) {
            return;
        }
        this.customForm.controls.name.setValue(this.poulePlace.getTeam() ? this.poulePlace.getTeam().getName() : undefined);
        this.customForm.controls.info.setValue(this.poulePlace.getTeam() ? this.poulePlace.getTeam().getInfo() : undefined);
    }

    save() {
        if (this.poulePlace.getTeam() !== undefined) {
            this.edit();
        } else {
            this.add();
        }
    }

    add() {
        this.processing = true;

        const name = this.customForm.controls.name.value;
        const info = this.customForm.controls.info.value;

        if (this.isNameDuplicate(this.customForm.controls.name.value)) {
            this.setAlert('danger', 'de naam bestaat al voor dit toernooi');
            this.processing = false;
            return;
        }
        const team: ITeam = {
            name: name ? name : undefined,
            info: info ? info : undefined
        };
        const association = this.tournament.getCompetitionseason().getAssociation();

        this.teamRepository.createObject(team, association)
            .subscribe(
            /* happy path */ teamRes => {
                this.poulePlace.setTeam(teamRes);
                this.poulePlaceRepository.editObject(this.poulePlace, this.poulePlace.getPoule())
                    .subscribe(
                  /* happy path */ poulePlaceRes => {
                        this.navigateBack();
                    },
                  /* error path */ e => { this.setAlert('danger', e); },
                  /* onComplete */() => this.processing = false
                    );
            },
            /* error path */ e => { this.setAlert('danger', e); },
        );


    }

    edit() {
        this.processing = true;

        if (this.isNameDuplicate(this.customForm.controls.name.value, this.poulePlace.getTeam().getId())) {
            this.setAlert('danger', 'de naam bestaat al voor dit toernooi');
            this.processing = false;
            return;
        }
        const name = this.customForm.controls.name.value;
        const info = this.customForm.controls.info.value;

        const team = this.poulePlace.getTeam();
        team.setName(name);
        team.setInfo(info ? info : undefined);
        this.teamRepository.editObject(team, team.getAssociation())
            .subscribe(
            /* happy path */ teamRes => {
                this.navigateBack();
            },
            /* error path */ e => { this.setAlert('danger', e); },
            /* onComplete */() => this.processing = false
            );
    }

    private getForwarUrl() {
        return [this.returnUrl, this.returnUrlParam];
    }

    // private getForwarUrlQueryParams(): {} {
    //     const queryParams = {};
    //     queryParams[this.returnUrlQueryParamKey] = this.returnUrlQueryParamValue;
    //     return queryParams;
    // }

    navigateBack() {
        this.router.navigate(this.getForwarUrl()/*, { queryParams: this.getForwarUrlQueryParams() }*/);
    }

    isNameDuplicate(name: string, teamId?: number): boolean {
        const poulePlaces = this.structureService.getFirstRound().getPoulePlaces();
        return poulePlaces.find(poulePlaceIt => {
            const teamName = poulePlaceIt.getTeam() ? poulePlaceIt.getTeam().getName() : undefined;
            return (name === teamName && (teamId === undefined || poulePlaceIt.getTeam().getId() === undefined));
        }) !== undefined;
    }

    // setInitials(initials) {
    //     this.error = undefined;
    //     if (initials.length < this.validations.minlengthinitials || initials.length > this.validations.maxlengthinfo) {
    //         return;
    //     }
    //     this.model.initials = initials;
    // }

    // setName(name) {
    //     this.error = undefined;
    //     if (name.length < this.validations.minlengthinitials || name.length > this.validations.maxlengthinfo) {
    //         return;
    //     }
    //     this.model.name = name;
    // }

    protected setAlert(type: string, message: string) {
        this.alert = { 'type': type, 'message': message };
    }

    protected resetAlert(): void {
        this.alert = undefined;
    }
}

export interface TeamValidations {
    minlengthname: number;
    maxlengthname: number;
    maxlengthinfo: number;
}
