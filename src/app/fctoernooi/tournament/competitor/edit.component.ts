import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import {
    AssociationRepository,
    ITeam,
    PoulePlace,
    PoulePlaceRepository,
    StructureNameService,
    StructureRepository,
    Team,
    TeamRepository,
} from 'ngx-sport';

import { TournamentComponent } from '../component';
import { TournamentRepository } from '../repository';

@Component({
    selector: 'app-tournament-competitor-edit',
    templateUrl: './edit.component.html',
    styleUrls: ['./edit.component.css']
})
export class TournamentCompetitorEditComponent extends TournamentComponent implements OnInit {
    returnUrl: string;
    returnUrlParam: number;
    // returnUrlQueryParamKey: string;
    // returnUrlQueryParamValue: string;
    customForm: FormGroup;
    poulePlace: PoulePlace;

    validations: TeamValidations = {
        minlengthname: Team.MIN_LENGTH_NAME,
        maxlengthname: Team.MAX_LENGTH_NAME,
        maxlengthinfo: Team.MAX_LENGTH_INFO
    };

    constructor(
        private teamRepository: TeamRepository,
        private associationRepository: AssociationRepository,
        route: ActivatedRoute,
        router: Router,
        tournamentRepository: TournamentRepository,
        structureRepository: StructureRepository,
        private poulePlaceRepository: PoulePlaceRepository,
        public nameService: StructureNameService,
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
        this.route.params.subscribe(params => {
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
            this.processing = false;
            return;
        }
        const poulePlaces = this.structureService.getFirstRound().getPoulePlaces();
        this.poulePlace = poulePlaces.find(poulePlace => poulePlaceId === poulePlace.getId());
        if (this.poulePlace === undefined) {
            this.processing = false;
            return;
        }
        this.customForm.controls.name.setValue(this.poulePlace.getTeam() ? this.poulePlace.getTeam().getName() : undefined);
        this.customForm.controls.info.setValue(this.poulePlace.getTeam() ? this.poulePlace.getTeam().getInfo() : undefined);
        this.processing = false;
    }

    save() {
        this.processing = true;
        this.setAlert('info', 'de deelnemer wordt opgeslagen');
        if (this.poulePlace.getTeam() !== undefined) {
            this.edit();
        } else {
            this.add();
        }
    }

    add() {
        const name = this.customForm.controls.name.value;
        const info = this.customForm.controls.info.value;

        if (this.isNameDuplicate(this.customForm.controls.name.value)) {
            this.setAlert('danger', 'de naam bestaat al voor dit toernooi');
            this.processing = false;
            return;
        }
        const association = this.tournament.getCompetition().getLeague().getAssociation();
        const team: ITeam = {
            name: name,
            info: info ? info : undefined
        };

        this.teamRepository.createObject(team, association)
            .subscribe(
            /* happy path */ teamRes => {
                    this.assignTeam(this.poulePlace, teamRes);
                },
            /* error path */ e => { this.setAlert('danger', e); this.processing = false; }
            );
    }

    assignTeam(poulePlace: PoulePlace, team: Team) {
        this.poulePlace.setTeam(team);
        this.poulePlaceRepository.editObject(this.poulePlace, this.poulePlace.getPoule())
            .subscribe(
                  /* happy path */ poulePlaceRes => {
                    this.navigateBack();
                },
                  /* error path */ e => { this.setAlert('danger', e); this.processing = false; }
            );
    }

    edit() {
        if (this.isNameDuplicate(this.customForm.controls.name.value, this.poulePlace.getTeam().getId())) {
            this.setAlert('danger', 'de naam bestaat al voor dit toernooi');
            this.processing = false;
            return;
        }

        const team = this.poulePlace.getTeam();
        const name = this.customForm.controls.name.value;
        const info = this.customForm.controls.info.value;

        team.setName(name);
        team.setInfo(info ? info : undefined);
        this.teamRepository.editObject(team)
            .subscribe(
                    /* happy path */ teamRes => {
                    this.navigateBack();
                },
            /* error path */ e => { this.setAlert('danger', e); this.processing = false; },
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

    // setName(name) {
    //     this.error = undefined;
    //     if (name.length < this.validations.minlengthinitials || name.length > this.validations.maxlengthinfo) {
    //         return;
    //     }
    //     this.model.name = name;
    // }
}

export interface TeamValidations {
    minlengthname: number;
    maxlengthname: number;
    maxlengthinfo: number;
}
