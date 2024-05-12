import { Component, OnInit, TemplateRef } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import {
  Category,
} from 'ngx-sport';

import { MyNavigation } from '../../shared/common/navigation';
import { TournamentRepository } from '../../lib/tournament/repository';
import { TournamentComponent } from '../../shared/tournament/component';
import { StructureRepository } from '../../lib/ngx-sport/structure/repository';
import { TournamentCompetitor } from '../../lib/competitor';
import { IAlertType } from '../../shared/common/alert';
import { GlobalEventsManager } from '../../shared/common/eventmanager';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { FavoritesRepository } from '../../lib/favorites/repository';
import { NameValidator } from '../../lib/nameValidator';
import { TournamentRegistration } from '../../lib/tournament/registration';
import { User } from '../../lib/user';
import { TournamentRegistrationSettings } from '../../lib/tournament/registration/settings';
import { TournamentRegistrationRepository } from '../../lib/tournament/registration/repository';
import { AuthService } from '../../lib/auth/auth.service';
import { JsonTournamentRegistration } from '../../lib/tournament/registration/json';
import { Role } from '../../lib/role';

@Component({
  selector: 'app-tournament-registration-edit',
  templateUrl: './registration-edit.component.html',
  styleUrls: ['./registration-edit.component.scss']
})
export class TournamentRegistrationEditComponent extends TournamentComponent implements OnInit {
  public settings!: TournamentRegistrationSettings;
  public registration: TournamentRegistration | undefined;
  public category: Category | undefined; 
  public form!: FormGroup<{
    name: FormControl<string>,
    emailaddress: FormControl<string>,
    telephone: FormControl<string>,
    category: FormControl<Category>,
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
    this.route.params.subscribe(params => {
      super.myNgOnInit(() => this.postInit(+params.categoryNr, +params.registrationId));
    });
  }

  private postInit(categoryNr: number, registrationId: number) {
   const category = this.structure.getCategory(categoryNr) 
   if (category === undefined) {
     this.setAlert(IAlertType.Danger, 'de categorie (' + categoryNr  + ') )kan niet gevonden worden');
    return;
  }
  this.category = category;
  
  this.tournamentRegistrationRepository.getObject(registrationId, category, this.tournament)
    .subscribe({
      next: (registration: TournamentRegistration) => {
        this.registration = registration;
        this.initForm(category, registration);
        this.processing = false;
      },
      error: (e: string) => {
        this.setAlert(IAlertType.Danger, e + ', instellingen niet gevonden');
        this.processing = false;
      }
    });
  }

  initForm(category: Category, registration: TournamentRegistration): void {
    this.form = new FormGroup({
      name: new FormControl(registration.getName(), {
        nonNullable: true, validators:
          [
            Validators.required,
            Validators.minLength(this.validations.minlengthname),
            Validators.maxLength(this.validations.maxlengthname)
          ]
      }),
      emailaddress: new FormControl(registration.getEmailaddress(), {
        nonNullable: true, validators:
          [
            Validators.required,
            Validators.minLength(this.validations.minlengthemailaddress),
            Validators.maxLength(this.validations.maxlengthemailaddress)
          ]
      }),
      telephone: new FormControl(registration.getTelephone(), {
        nonNullable: true, validators:
          [
            Validators.required,
            Validators.minLength(this.validations.minlengthtelephone),
            Validators.maxLength(this.validations.maxlengthtelephone)
          ]
      }),
      category: new FormControl(category, {
        nonNullable: true, validators:
          [
            Validators.required
          ]
      }),
      info: new FormControl(registration.getInfo(), {
        nonNullable: true, validators:
          [Validators.maxLength(this.validations.maxlengthinfo)]
      }),
    });
  }

  isAdmin(): boolean {
    return this.hasRole(this.authService, Role.Admin);
  }

  formToJson(registration: TournamentRegistration): JsonTournamentRegistration {
    return {
      id: 0,
      state: registration.getState(),
      name: this.form.controls.name.value,
      emailaddress: this.form.controls.emailaddress.value,
      telephone: this.form.controls.telephone.value,
      info: this.form.controls.info.value,
      startLocation: undefined
    };
  }

  save(registration: TournamentRegistration): boolean {
    const jsonRegistration = this.formToJson(registration);
    const message = this.nameValidator.validateName(jsonRegistration.name);
    if (message) {
      this.setAlert(IAlertType.Danger, message);
      return false;
    }
    
    this.processing = true;
    this.setAlert(IAlertType.Info, 'de inschrijving wordt opgeslagen');

    this.tournamentRegistrationRepository.editObject(jsonRegistration, registration, this.tournament)
      .subscribe({
        next: (registration: TournamentRegistration) => {
          this.registration = registration;
          this.navigateBack();
        },
        error: (e) => {
          this.setAlert(IAlertType.Danger, e); this.processing = false;
        },
        complete: () => this.processing = false
      });
    return false;
  }

  remove(registration: TournamentRegistration): boolean {
    const jsonRegistration = this.formToJson(registration);
    const message = this.nameValidator.validateName(jsonRegistration.name);
    if (message) {
      this.setAlert(IAlertType.Danger, message);
      return false;
    }

    this.processing = true;
    this.setAlert(IAlertType.Info, 'de inschrijving wordt opgeslagen');

    this.tournamentRegistrationRepository.removeObject(registration, this.tournament)
      .subscribe({
        next: () => {
          this.navigateBack();
          this.processing = false;
        },
        error: (e) => {
          this.setAlert(IAlertType.Danger, e); this.processing = false;
        }
      });

   
    return false;
  }

  navigateBack() {
    this.myNavigation.back();
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