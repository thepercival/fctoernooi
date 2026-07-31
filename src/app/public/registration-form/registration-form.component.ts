import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { Category } from 'ngx-sport';

import { MyNavigation } from '../../shared/common/navigation';
import { TournamentRepository } from '../../lib/tournament/repository';
import { TournamentComponent } from '../../shared/tournament/component';
import { StructureRepository } from '../../lib/ngx-sport/structure/repository';
import { GlobalEventsManager } from '../../shared/common/eventmanager';
import { NgbAlert, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { TournamentCompetitor } from '../../lib/competitor';
import { AuthService } from '../../lib/auth/auth.service';
import { Role } from '../../lib/role';
import { TournamentRegistrationRepository } from '../../lib/tournament/registration/repository';
import { TournamentRegistrationSettings } from '../../lib/tournament/registration/settings';
import { IAlertType } from '../../shared/common/alert';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { TournamentRegistration } from '../../lib/tournament/registration';
import { NameValidator } from '../../lib/nameValidator';
import { JsonTournamentRegistration } from '../../lib/tournament/registration/json';
import { User } from '../../lib/user';
import { RegistrationState } from '../../lib/tournament/registration/state';
import { AdminPublicSwitcherComponent, WebsitePart } from '../../shared/tournament/structure/admin-public-switcher.component';
import { CompetitorTab, RegistrationTab } from '../../shared/common/tab-ids';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faSpinner } from '@fortawesome/free-solid-svg-icons';
import { FocusDirective } from '../../shared/common/focus';

@Component({
    selector: 'app-tournament-registration-form',
    templateUrl: './registration-form.component.html',
    styleUrls: ['./registration-form.component.scss'],
    standalone: true,
    changeDetection: ChangeDetectionStrategy.Eager,
    imports: [FontAwesomeModule, AdminPublicSwitcherComponent, NgbAlert, FormsModule, ReactiveFormsModule, RouterLink, FocusDirective]
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
    faSpinner = faSpinner;

    constructor(
        route: ActivatedRoute,
        router: Router,
        tournamentRepository: TournamentRepository,
        sructureRepository: StructureRepository,
        globalEventsManager: GlobalEventsManager,
        private tournamentRegistrationRepository: TournamentRegistrationRepository,
        private nameValidator: NameValidator,
        private myNavigation: MyNavigation,
        private authService: AuthService,
    ) {
        super(route, router, tournamentRepository, sructureRepository, globalEventsManager);
        this.alert.set(undefined);
    }

    ngOnInit() {
        super.myNgOnInit(() => {     

            this.tournamentRegistrationRepository.getSettings(this.tournament, true)
                .subscribe({
                    next: (settings: TournamentRegistrationSettings) => {
                        this.settings = settings;
                        this.isOpen = (new Date()).getTime() < settings.getEnd().getTime();
                        if( !this.isOpen) {
                            this.alert.set({ type: IAlertType.Danger, message: 'de inschrijvingsperiode is verstreken' });
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

                        this.processing.set(false);
                    },
                    error: (e: string) => {
                        this.alert.set({ type: IAlertType.Danger, message: e + ', instellingen niet gevonden' });
                        this.processing.set(false);
                    }
                });
        });
    }

    get TabRegistrations(): number { return CompetitorTab.Registrations; }
    get TabRegistrationList(): number { return RegistrationTab.List; }
    get TabRegistrationForm(): number { return RegistrationTab.Form; }
    get PublicWebsitePart(): WebsitePart { return WebsitePart.Public }
    
    isAdmin(): boolean {
        return this.authService.loggedInUserHasRole(this.tournament, Role.Admin);
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
            this.alert.set({ type: IAlertType.Danger, message });
            return false;
        }
        let category = this.form.controls.category.value;
        if (category === null && this.structure.getCategories().length === 1 ) {
            category = this.structure.getCategories()[0];
        }
        if (category === undefined) {
            this.alert.set({ type: IAlertType.Danger, message: 'vul een category in' });
            return false;
        }
        this.processing.set(true);
        this.alert.set({ type: IAlertType.Info, message: 'de inschrijving wordt opgeslagen' });
        
        this.tournamentRegistrationRepository.createObject(jsonRegistration, category, this.tournament)
            .subscribe({
                next: (registration: TournamentRegistration) => {
                    this.registration = registration;
                    this.alert.set(undefined);
                },
                error: (e) => {
                    this.alert.set({ type: IAlertType.Danger, message: e }); this.processing.set(false);
                },
                complete: () => this.processing.set(false)
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