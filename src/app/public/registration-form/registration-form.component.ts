import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Category } from 'ngx-sport';

import { MyNavigation } from '../../shared/common/navigation';
import { FavoritesRepository } from '../../lib/favorites/repository';
import { TournamentRepository } from '../../lib/tournament/repository';
import { TournamentComponent } from '../../shared/tournament/component';
import { StructureRepository } from '../../lib/ngx-sport/structure/repository';
import { GlobalEventsManager } from '../../shared/common/eventmanager';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { TournamentCompetitor } from '../../lib/competitor';
import { AuthService } from '../../lib/auth/auth.service';
import { Role } from '../../lib/role';
import { TournamentRegistrationRepository } from '../../lib/tournament/registration/repository';
import { TournamentRegistrationSettings } from '../../lib/tournament/registration/settings';
import { IAlertType } from '../../shared/common/alert';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { TournamentRegistration } from '../../lib/tournament/registration';
import { NameValidator } from '../../lib/nameValidator';
import { JsonTournamentRegistration } from '../../lib/tournament/registration/json';
import { User } from '../../lib/user';
import { RegistrationState } from '../../lib/tournament/registration/state';
import { WebsitePart } from '../../shared/tournament/structure/admin-public-switcher.component';
import { CompetitorTab, RegistrationTab } from '../../shared/common/tab-ids';

@Component({
    selector: 'app-tournament-registration-form',
    templateUrl: './registration-form.component.html',
    styleUrls: ['./registration-form.component.scss']
})
export class RegistrationComponent extends TournamentComponent implements OnInit {
    public settings: TournamentRegistrationSettings|undefined;
    public isOpen: boolean = false;
    public registration: TournamentRegistration|undefined;
    public form!: FormGroup<{
        name: FormControl<string>,
        emailaddress: FormControl<string>,
        telephone: FormControl<string>,
        category: FormControl<Category | undefined>, 
        info: FormControl<string>,        
    }>;
    validations: RegistrationValidations = {
        minlengthname: TournamentCompetitor.MIN_LENGTH_NAME,
        maxlengthname: TournamentCompetitor.MAX_LENGTH_NAME,
        minlengthemailaddress: User.MIN_LENGTH_EMAIL,
        maxlengthemailaddress: User.MAX_LENGTH_EMAIL,
        minlengthtelephone: TournamentCompetitor.MIN_LENGTH_TELEPHONE,
        maxlengthtelephone: TournamentCompetitor.MAX_LENGTH_TELEPHONE,
        maxlengthinfo: TournamentCompetitor.MAX_LENGTH_INFO,
    };
    // 17056

    constructor(
        route: ActivatedRoute,
        router: Router,
        tournamentRepository: TournamentRepository,
        sructureRepository: StructureRepository,
        globalEventsManager: GlobalEventsManager,
        modalService: NgbModal,
        favRepository: FavoritesRepository,
        private tournamentRegistrationRepository: TournamentRegistrationRepository,
        private nameValidator: NameValidator,
        private myNavigation: MyNavigation,
        private authService: AuthService,
    ) {
        super(route, router, tournamentRepository, sructureRepository, globalEventsManager, modalService, favRepository);
        this.resetAlert();
    }

    ngOnInit() {
        super.myNgOnInit(() => {     

            this.tournamentRegistrationRepository.getSettings(this.tournament, true)
                .subscribe({
                    next: (settings: TournamentRegistrationSettings) => {
                        this.settings = settings;
                        this.isOpen = (new Date()).getTime() < settings.getEnd().getTime();
                        if( !this.isOpen) {
                            this.setAlert(IAlertType.Danger, 'de inschrijvingsperiode is verstreken');
                        }

                        this.form = new FormGroup({
                            name: new FormControl('', {
                                nonNullable: true, validators:
                                    [
                                        Validators.required,
                                        Validators.minLength(this.validations.minlengthname),
                                        Validators.maxLength(this.validations.maxlengthname)
                                    ]
                            }),
                            emailaddress: new FormControl('', {
                                nonNullable: true, validators:
                                    [
                                        Validators.required,
                                        Validators.minLength(this.validations.minlengthemailaddress),
                                        Validators.maxLength(this.validations.maxlengthemailaddress)
                                    ]
                            }),
                            telephone: new FormControl('', {
                                nonNullable: true, validators:
                                    [
                                        Validators.required,
                                        Validators.minLength(this.validations.minlengthtelephone),
                                        Validators.maxLength(this.validations.maxlengthtelephone)
                                    ]
                            }),
                            category: new FormControl<Category | undefined>(undefined, {nonNullable: true}),
                            info: new FormControl('', {
                                nonNullable: true, validators:
                                    [Validators.maxLength(this.validations.maxlengthinfo)]
                            }),
                        });

                        this.processing = false;
                    },
                    error: (e: string) => {
                        this.setAlert(IAlertType.Danger, e + ', instellingen niet gevonden');
                        this.processing = false;
                    }
                });
        });
    }

    get TabRegistrations(): number { return CompetitorTab.Registrations; }
    get TabRegistrationForm(): number { return RegistrationTab.Form; }
    get PublicWebsitePart(): WebsitePart { return WebsitePart.Public }
    
    isAdmin(): boolean {
        return this.hasRole(this.authService, Role.Admin);
    }

    getRemarkAsHtml(settings: TournamentRegistrationSettings): string {
        const remarkArray = settings.getRemark().split(/\r?\n/);
        return remarkArray.join('<br/>');
    }    

    formToJson(): JsonTournamentRegistration {
        return {
            id: 0,
            state: RegistrationState.Created,
            name: this.form.controls.name.value,
            emailaddress: this.form.controls.emailaddress.value,
            telephone: this.form.controls.telephone.value,
            info: this.form.controls.info.value,
            startLocation: undefined
        };
    }

    save(): boolean {
        const jsonRegistration = this.formToJson();
        const message = this.nameValidator.validateName(jsonRegistration.name);
        if (message) {
            this.setAlert(IAlertType.Danger, message);
            return false;
        }
        let category = this.form.controls.category.value;
        if (category === null && this.structure.getCategories().length === 1 ) {
            category = this.structure.getCategories()[0];
        }
        if (category === undefined) {
            this.setAlert(IAlertType.Danger, 'vul een category in');
            return false;
        }
        this.processing = true;
        this.setAlert(IAlertType.Info, 'de inschrijving wordt opgeslagen');
        
        this.tournamentRegistrationRepository.createObject(jsonRegistration, category, this.tournament)
            .subscribe({
                next: (registration: TournamentRegistration) => {
                    this.registration = registration;
                    this.resetAlert();
                },
                error: (e) => {
                    this.setAlert(IAlertType.Danger, e); this.processing = false;
                },
                complete: () => this.processing = false
            });
        return false;
    }

    reset(): void {
        this.registration = undefined;
        this.form.controls.name.setValue('');
        this.form.controls.emailaddress.setValue(''); 
        this.form.controls.telephone.setValue(''); 
        this.form.controls.info.setValue(''); 
    }
}

export interface RegistrationValidations {
    minlengthname: number;
    maxlengthname: number;
    minlengthemailaddress: number,
    maxlengthemailaddress: number,
    minlengthtelephone: number,
    maxlengthtelephone: number,
    maxlengthinfo: number;
}