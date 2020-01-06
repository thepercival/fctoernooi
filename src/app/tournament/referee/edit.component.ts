import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import {
    JsonReferee,
    Referee,
} from 'ngx-sport';

import { MyNavigation } from '../../common/navigation';
import { TournamentRepository } from '../../lib/tournament/repository';
import { User } from '../../lib/user';
import { TournamentComponent } from '../component';
import { RefereeRepository } from '../../lib/ngx-sport/referee/repository';
import { StructureRepository } from '../../lib/ngx-sport/structure/repository';
import { PlanningRepository } from '../../lib/ngx-sport/planning/repository';

@Component({
    selector: 'app-tournament-referee-edit',
    templateUrl: './edit.component.html',
    styleUrls: ['./edit.component.css']
})
export class RefereeEditComponent extends TournamentComponent implements OnInit {
    form: FormGroup;
    referee: Referee;

    validations: RefValidations = {
        minlengthinitials: Referee.MIN_LENGTH_INITIALS,
        maxlengthinitials: Referee.MAX_LENGTH_INITIALS,
        maxlengthname: Referee.MAX_LENGTH_NAME,
        maxlengthinfo: Referee.MAX_LENGTH_INFO,
        minlengthemailaddress: User.MIN_LENGTH_EMAIL,
        maxlengthemailaddress: User.MAX_LENGTH_EMAIL,
    };

    constructor(
        private refereeRepository: RefereeRepository,
        route: ActivatedRoute,
        router: Router,
        tournamentRepository: TournamentRepository,
        structureRepository: StructureRepository,
        private planningRepository: PlanningRepository,
        private myNavigation: MyNavigation,
        fb: FormBuilder
    ) {
        // EditPermissions, EmailAddresses
        // andere groep moet dan zijn getEditPermission, wanneer ingelogd, bij gewone view
        super(route, router, tournamentRepository, structureRepository);
        this.form = fb.group({
            initials: ['', Validators.compose([
                Validators.required,
                Validators.minLength(this.validations.minlengthinitials),
                Validators.maxLength(this.validations.maxlengthinitials)
            ])],
            name: ['', Validators.compose([
                Validators.maxLength(this.validations.maxlengthname)
            ])],
            emailaddress: ['', Validators.compose([
                Validators.minLength(this.validations.minlengthemailaddress),
                Validators.maxLength(this.validations.maxlengthemailaddress)
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
            super.myNgOnInit(() => this.postInit(+params.rank));
        });
    }

    private getReferee(rank: number): Referee {
        if (rank === undefined) {
            this.processing = false;
            return;
        }
        return this.competition.getReferee(rank);
    }

    private postInit(rank: number) {
        this.referee = this.getReferee(rank);
        if (this.referee === undefined) {
            this.processing = false;
            return;
        }
        this.form.controls.initials.setValue(this.referee.getInitials());
        this.form.controls.name.setValue(this.referee.getName());
        this.form.controls.emailaddress.setValue(this.referee.getEmailaddress());
        this.form.controls.info.setValue(this.referee.getInfo());
        this.processing = false;
    }

    save(): boolean {
        if (this.referee !== undefined) {
            this.edit();
        } else {
            this.add();
        }
        return false;
    }

    add() {
        this.processing = true;
        this.setAlert('info', 'de scheidsrechter wordt toegevoegd');
        const initials = this.form.controls.initials.value;
        const name = this.form.controls.name.value;
        const emailaddress = this.form.controls.emailaddress.value;
        const info = this.form.controls.info.value;

        if (this.isInitialsDuplicate(this.form.controls.initials.value)) {
            this.setAlert('danger', 'de initialen bestaan al voor dit toernooi');
            this.processing = false;
            return;
        }
        const ref: JsonReferee = {
            rank: this.competition.getReferees().length + 1,
            initials: initials,
            name: name ? name : undefined,
            emailaddress: emailaddress ? emailaddress : undefined,
            info: info ? info : undefined
        };
        this.refereeRepository.createObject(ref, this.tournament).subscribe(
            /* happy path */ refereeRes => {
                this.planningRepository.createObject(this.structure.getFirstRoundNumber(), this.tournament).subscribe(
                /* happy path */ roundNumberOut => {
                        this.tournamentRepository.syncRefereeRoles(this.tournament).subscribe(
                        /* happy path */ allRolesRes => {
                                this.processing = false;
                                this.navigateBack();
                            },
                        /* error path */ e => { this.setAlert('danger', e); this.processing = false; },
                        /* onComplete */() => this.processing = false
                        );
                    },
                /* error path */ e => { this.setAlert('danger', e); this.processing = false; },
                );
            },
            /* error path */ e => { this.setAlert('danger', e); this.processing = false; },
        );
    }

    edit() {
        this.processing = true;
        this.setAlert('info', 'de scheidsrechter wordt gewijzigd');
        if (this.isInitialsDuplicate(this.form.controls.initials.value, this.referee)) {
            this.setAlert('danger', 'de initialen bestaan al voor dit toernooi');
            this.processing = false;
            return;
        }
        const initials = this.form.controls.initials.value;
        const name = this.form.controls.name.value;
        const emailaddress = this.form.controls.emailaddress.value;
        const info = this.form.controls.info.value;

        this.referee.setInitials(initials);
        this.referee.setName(name ? name : undefined);
        const emailaddressChanged = emailaddress !== this.referee.getEmailaddress();
        this.referee.setEmailaddress(emailaddress ? emailaddress : undefined);
        this.referee.setInfo(info ? info : undefined);
        this.refereeRepository.editObject(this.referee, this.tournament)
            .subscribe(
            /* happy path */ refereeRes => {
                    if (!emailaddressChanged) {
                        this.navigateBack();
                        return;
                    }
                    this.tournamentRepository.syncRefereeRoles(this.tournament).subscribe(
                        /* happy path */ allRolesRes => {
                            this.navigateBack();
                        },
                        /* error path */ e => { this.setAlert('danger', e); this.processing = false; },
                        /* onComplete */() => this.processing = false
                    );
                },
            /* error path */ e => { this.setAlert('danger', e); this.processing = false; },
            /* onComplete */() => { this.processing = false; }
            );
    }

    navigateBack() {
        this.myNavigation.back();
    }

    isInitialsDuplicate(initials: string, referee?: Referee): boolean {
        const referees = this.competition.getReferees();
        return referees.find(refereeIt => {
            return (initials === refereeIt.getInitials() && (referee === undefined || refereeIt.getId() === undefined));
        }) !== undefined;
    }
}

export interface RefValidations {
    minlengthinitials: number;
    maxlengthinitials: number;
    maxlengthname: number;
    maxlengthinfo: number;
    minlengthemailaddress: number;
    maxlengthemailaddress: number;
}
