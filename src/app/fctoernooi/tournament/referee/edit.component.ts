import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { IReferee, PlanningRepository, PlanningService, Referee, RefereeRepository, StructureRepository } from 'ngx-sport';

import { IAlert } from '../../../app.definitions';
import { TournamentComponent } from '../component';
import { TournamentRepository } from '../repository';

@Component({
    selector: 'app-tournament-referee-edit',
    templateUrl: './edit.component.html',
    styleUrls: ['./edit.component.css']
})
export class TournamentRefereeEditComponent extends TournamentComponent implements OnInit {
    returnUrl: string;
    returnUrlParam: number;
    returnUrlQueryParamKey: string;
    returnUrlQueryParamValue: string;
    public alert: IAlert;
    public processing = true;
    customForm: FormGroup;
    refereeId: number;

    validations: RefValidations = {
        minlengthinitials: Referee.MIN_LENGTH_INITIALS,
        maxlengthinitials: Referee.MAX_LENGTH_INITIALS,
        maxlengthname: Referee.MAX_LENGTH_NAME,
        maxlengthinfo: Referee.MAX_LENGTH_INFO
    };

    constructor(
        private refereeRepository: RefereeRepository,
        route: ActivatedRoute,
        router: Router,
        tournamentRepository: TournamentRepository,
        structureRepository: StructureRepository,
        private planningRepository: PlanningRepository,
        fb: FormBuilder
    ) {
        super(route, router, tournamentRepository, structureRepository);
        this.customForm = fb.group({
            initials: ['', Validators.compose([
                Validators.required,
                Validators.minLength(this.validations.minlengthinitials),
                Validators.maxLength(this.validations.maxlengthinitials)
            ])],
            name: ['', Validators.compose([
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
            super.myNgOnInit(() => this.postInit(+params.refereeId));
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
        const referee = this.structureService.getCompetition().getRefereeById(id);
        if (referee === undefined) {
            this.processing = false;
            return;
        }
        this.refereeId = id;
        this.customForm.controls.initials.setValue(referee.getInitials());
        this.customForm.controls.name.setValue(referee.getName());
        this.customForm.controls.info.setValue(referee.getInfo());
        this.processing = false;
    }

    save() {
        if (this.refereeId > 0) {
            this.edit();
        } else {
            this.add();
        }
    }

    add() {
        this.processing = true;
        this.setAlert('info', 'de scheidsrechter wordt toegevoegd');
        const initials = this.customForm.controls.initials.value;
        const name = this.customForm.controls.name.value;
        const info = this.customForm.controls.info.value;

        if (this.isInitialsDuplicate(this.customForm.controls.initials.value)) {
            this.setAlert('danger', 'de initialen bestaan al voor dit toernooi');
            this.processing = false;
            return;
        }
        const ref: IReferee = {
            initials: initials,
            name: name ? name : undefined,
            info: info ? info : undefined
        };
        this.refereeRepository.createObject(ref, this.structureService.getCompetition())
            .subscribe(
            /* happy path */ refereeRes => {

                    const firstRound = this.structureService.getFirstRound();
                    const planningService = new PlanningService(this.structureService);
                    planningService.reschedule(firstRound.getNumber());
                    this.planningRepository.editObject([firstRound])
                        .subscribe(
                    /* happy path */ gamesdRes => {
                                this.processing = false;
                                this.navigateBack();
                            },
            /* error path */ e => { this.setAlert('danger', e); this.processing = false; },
            /* onComplete */() => this.processing = false
                        );
                },
            /* error path */ e => { this.setAlert('danger', e); this.processing = false; },
        );
    }

    edit() {
        this.processing = true;
        this.setAlert('info', 'de scheidsrechter wordt gewijzigd');
        if (this.isInitialsDuplicate(this.customForm.controls.initials.value, this.refereeId)) {
            this.setAlert('danger', 'de initialen bestaan al voor dit toernooi');
            this.processing = false;
            return;
        }
        const initials = this.customForm.controls.initials.value;
        const name = this.customForm.controls.name.value;
        const info = this.customForm.controls.info.value;

        const referee = this.structureService.getCompetition().getRefereeById(this.refereeId);
        referee.setInitials(initials);
        referee.setName(name ? name : undefined);
        referee.setInfo(info ? info : undefined);
        this.refereeRepository.editObject(referee, this.structureService.getCompetition())
            .subscribe(
            /* happy path */ refereeRes => {
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

    isInitialsDuplicate(initials: string, refereeId?: number): boolean {
        const referees = this.structureService.getCompetition().getReferees();
        return referees.find(refereeIt => {
            return (initials === refereeIt.getInitials() && (refereeId === undefined || refereeIt.getId() === undefined));
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

export interface RefValidations {
    minlengthinitials: number;
    maxlengthinitials: number;
    maxlengthname: number;
    maxlengthinfo: number;
}
