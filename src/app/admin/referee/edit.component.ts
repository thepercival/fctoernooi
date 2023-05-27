import { Component, OnInit, TemplateRef } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
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
import { IAlertType } from '../../shared/common/alert';
import { GlobalEventsManager } from '../../shared/common/eventmanager';
import { FavoritesRepository } from '../../lib/favorites/repository';

@Component({
    selector: 'app-tournament-referee-edit',
    templateUrl: './edit.component.html',
    styleUrls: ['./edit.component.css']
})
export class RefereeEditComponent extends TournamentComponent implements OnInit {
    public typedForm: FormGroup<{
        initials: FormControl<string>,
        name: FormControl<string|null>,
        emailaddress: FormControl<string|null>,
        info: FormControl<string|null>,
      }>;
    originalReferee: Referee | undefined;
    invite: boolean = false;

    validations: RefValidations = {
        minlengthinitials: Referee.MIN_LENGTH_INITIALS,
        maxlengthinitials: Referee.MAX_LENGTH_INITIALS,
        maxlengthname: Referee.MAX_LENGTH_NAME,
        maxlengthinfo: Referee.MAX_LENGTH_INFO,
        minlengthemailaddress: User.MIN_LENGTH_EMAIL,
        maxlengthemailaddress: User.MAX_LENGTH_EMAIL,
    };

    constructor(
        route: ActivatedRoute,
        router: Router,
        tournamentRepository: TournamentRepository,
        structureRepository: StructureRepository,
        globalEventsManager: GlobalEventsManager,
        modalService: NgbModal,
        favRepository: FavoritesRepository,
        private refereeRepository: RefereeRepository,
        private planningRepository: PlanningRepository,
        private myNavigation: MyNavigation
    ) {

        // EditPermissions, EmailAddresses
        // andere groep moet dan zijn getEditPermission, wanneer ingelogd, bij gewone view
        super(route, router, tournamentRepository, structureRepository, globalEventsManager, modalService, favRepository);
        this.typedForm = new FormGroup({
            initials: new FormControl('', { nonNullable: true, validators: 
                [
                    Validators.required,
                    Validators.minLength(this.validations.minlengthinitials),
                    Validators.maxLength(this.validations.maxlengthinitials)
                ] 
            }),
            name: new FormControl('', { validators: 
                [
                    Validators.maxLength(this.validations.maxlengthname)
                ] 
            }),
            emailaddress: new FormControl('', { validators: 
                [
                    Validators.minLength(this.validations.minlengthemailaddress),
                    Validators.maxLength(this.validations.maxlengthemailaddress)
                ] 
            }),
            info: new FormControl('', { validators: 
                [
                    Validators.maxLength(this.validations.maxlengthinfo)
                ] 
            }),
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
            this.typedForm.controls.initials.setValue(this.originalReferee.getInitials());
            this.typedForm.controls.name.setValue(this.originalReferee.getName() ?? null);
            this.typedForm.controls.emailaddress.setValue(this.originalReferee.getEmailaddress() ?? null);
            if (this.originalReferee.getEmailaddress() !== undefined) {
                this.typedForm.controls.emailaddress.disable();
            }
            this.typedForm.controls.info.setValue(this.originalReferee.getInfo() ?? null);
        }
        this.processing = false;
    }

    formToJson(): JsonReferee {
        const name = this.typedForm.controls.name.value;
        const emailaddress = this.typedForm.controls.emailaddress.value;
        const info = this.typedForm.controls.info.value;
        return {
            id: this.originalReferee ? this.originalReferee.getId() : 0,
            priority: this.originalReferee ? this.originalReferee.getPriority() : this.competition.getReferees().length + 1,
            initials: this.typedForm.controls.initials.value,
            name: name ? name : undefined,
            emailaddress: emailaddress ? emailaddress : undefined,
            info: info ? info : undefined
        };
    }

    emailaddressChanged(): boolean {
        const original = this.originalReferee ? this.originalReferee.getEmailaddress() : undefined;
        return original !== this.typedForm.controls.emailaddress.value;
    }

    save(): boolean {
        return this.originalReferee ? this.edit(this.originalReferee) : this.add();
    }

    add(): boolean {
        this.processing = true;
        this.setAlert(IAlertType.Info, 'de scheidsrechter wordt toegevoegd');

        const jsonReferee: JsonReferee = this.formToJson();
        if (this.isInitialsDuplicate(jsonReferee.initials)) {
            this.setAlert(IAlertType.Danger, 'de initialen bestaan al voor dit toernooi');
            this.processing = false;
            return false;
        }

        this.refereeRepository.createObject(jsonReferee, this.tournament, this.invite)
            .subscribe({
                next: (refereeRes: Referee) => {
                    this.planningRepository.create(this.structure, this.tournament)
                        .subscribe({
                            next: () => {
                                this.processing = false;
                                this.navigateBack();
                            },
                            error: (e) => {
                                this.setAlert(IAlertType.Danger, e); this.processing = false;
                            }
                        });
                },
                error: (e) => {
                    this.setAlert(IAlertType.Danger, e); this.processing = false;
                }
            });
        return false;
    }

    edit(originalReferee: Referee): boolean {
        this.processing = true;
        this.setAlert(IAlertType.Info, 'de scheidsrechter wordt gewijzigd');
        const jsonReferee: JsonReferee = this.formToJson();
        if (this.isInitialsDuplicate(jsonReferee.initials, originalReferee)) {
            this.setAlert(IAlertType.Danger, 'de initialen bestaan al voor dit toernooi');
            this.processing = false;
            return false;
        }
        this.refereeRepository.editObject(jsonReferee, originalReferee, this.tournament, this.invite)
            .subscribe({
                next: () => {
                    this.navigateBack();
                },
                error: (e) => {
                    this.setAlert(IAlertType.Danger, e); this.processing = false;
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
