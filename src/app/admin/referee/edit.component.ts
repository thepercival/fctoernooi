import { Component, OnInit, TemplateRef } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import {
    JsonReferee,
    Referee,
} from 'ngx-sport';

import { MyNavigation } from '../../shared/common/navigation';
import { TournamentRepository } from '../../lib/tournament/repository';
import { User } from '../../lib/user';
import { TournamentComponent } from '../../shared/tournament/component';
import { RefereeRepository } from '../../lib/ngx-sport/referee/repository';
import { StructureRepository } from '../../lib/ngx-sport/structure/repository';
import { PlanningRepository } from '../../lib/ngx-sport/planning/repository';
import { InfoModalComponent } from '../../shared/tournament/infomodal/infomodal.component';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';

@Component({
    selector: 'app-tournament-referee-edit',
    templateUrl: './edit.component.html',
    styleUrls: ['./edit.component.css']
})
export class RefereeEditComponent extends TournamentComponent implements OnInit {
    form: FormGroup;
    originalReferee: Referee | undefined;
    addAndInvite: boolean = false;

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
        private modalService: NgbModal,
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

    private postInit(rank: number) {
        this.originalReferee = this.competition.getReferee(rank);
        if (this.originalReferee) {
            this.form.controls.initials.setValue(this.originalReferee.getInitials());
            this.form.controls.name.setValue(this.originalReferee.getName());
            this.form.controls.emailaddress.setValue(this.originalReferee.getEmailaddress());
            this.form.controls.info.setValue(this.originalReferee.getInfo());
        }
        this.processing = false;
    }

    formToJson(): JsonReferee {
        const name = this.form.controls.name.value;
        const emailaddress = this.form.controls.emailaddress.value;
        const info = this.form.controls.info.value;
        return {
            id: this.originalReferee ? this.originalReferee.getId() : 0,
            priority: this.originalReferee ? this.originalReferee.getPriority() : this.competition.getReferees().length + 1,
            initials: this.form.controls.initials.value,
            name: name ? name : undefined,
            emailaddress: emailaddress ? emailaddress : undefined,
            info: info ? info : undefined
        };
    }

    save(): boolean {
        return this.originalReferee ? this.edit(this.originalReferee) : this.add();
    }

    add(): boolean {
        this.processing = true;
        this.setAlert('info', 'de scheidsrechter wordt toegevoegd');

        const jsonReferee: JsonReferee = this.formToJson();
        if (this.isInitialsDuplicate(jsonReferee.initials)) {
            this.setAlert('danger', 'de initialen bestaan al voor dit toernooi');
            this.processing = false;
            return false;
        }

        this.refereeRepository.createObject(jsonReferee, this.tournament, this.addAndInvite)
            .subscribe({
                next: (refereeRes: Referee) => {
                    this.planningRepository.create(this.structure, this.tournament, 1)
                        .subscribe({
                            next: () => {
                                this.processing = false;
                                this.navigateBack();
                            },
                            error: (e) => {
                                this.setAlert('danger', e); this.processing = false;
                            }
                        });
                },
                error: (e) => {
                    this.setAlert('danger', e); this.processing = false;
                }
            });
        return false;
    }

    edit(referee: Referee): boolean {
        this.processing = true;
        this.setAlert('info', 'de scheidsrechter wordt gewijzigd');
        const jsonReferee: JsonReferee = this.formToJson();
        if (this.isInitialsDuplicate(jsonReferee.initials, referee)) {
            this.setAlert('danger', 'de initialen bestaan al voor dit toernooi');
            this.processing = false;
            return false;
        }
        this.refereeRepository.editObject(jsonReferee, referee, this.tournament)
            .subscribe({
                next: () => {
                    this.navigateBack();
                },
                error: (e) => {
                    this.setAlert('danger', e); this.processing = false;
                },
                complete: () => this.processing = false
            });
        return false;
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

    openInfoModal(modalContent: TemplateRef<any>) {
        const activeModal = this.modalService.open(InfoModalComponent, { windowClass: 'info-modal' });
        activeModal.componentInstance.header = 'emailadres scheidsrechter';
        activeModal.componentInstance.modalContent = modalContent;
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
