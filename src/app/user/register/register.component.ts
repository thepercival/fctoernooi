import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';

import { AuthService } from '../../lib/auth/auth.service';
import { IAlertType } from '../../shared/common/alert';
import { User } from '../../lib/user';
import { UserRepository } from '../../lib/user/repository';
import { UserComponent } from '../component';
import { GlobalEventsManager } from '../../shared/common/eventmanager';
import { CustomValidators } from '../password-validation';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css']
})
export class RegisterComponent extends UserComponent implements OnInit {
  registered = false;
  public typedForm: FormGroup<{
    emailaddress: FormControl<string>,
    password: FormControl<string>,
    passwordRepeat: FormControl<string>,
  }>;

  validations: UserValidations = {
    minlengthemailaddress: User.MIN_LENGTH_EMAIL,
    maxlengthemailaddress: User.MAX_LENGTH_EMAIL,
    minlengthpassword: User.MIN_LENGTH_PASSWORD,
    maxlengthpassword: User.MAX_LENGTH_PASSWORD
  };

  constructor(
    route: ActivatedRoute,
    router: Router,
    userRepository: UserRepository,
    authService: AuthService,
    globalEventsManager: GlobalEventsManager,
    fb: FormBuilder
  ) {
    super(route, router, userRepository, authService, globalEventsManager);
    this.typedForm = new FormGroup(
      {
        emailaddress: new FormControl('', { nonNullable: true, validators: 
          [
              Validators.required,
              Validators.minLength(this.validations.minlengthemailaddress),
              Validators.maxLength(this.validations.maxlengthemailaddress)
          ] 
        }),
        password: new FormControl('', { nonNullable: true, validators: 
          [
              Validators.required,
              Validators.minLength(this.validations.minlengthpassword),
              Validators.maxLength(this.validations.maxlengthpassword)
          ] 
        }),      
        passwordRepeat: new FormControl('', { nonNullable: true, validators: 
          [
              Validators.required,
              Validators.minLength(this.validations.minlengthpassword),
              Validators.maxLength(this.validations.maxlengthpassword)
          ] 
        })
      },
      { validators: CustomValidators.passwordsMatching }
    )
  }

  ngOnInit() {
    this.processing = false;
  }

  register(): boolean {
    this.processing = true;
    this.setAlert(IAlertType.Info, 'de registratie wordt opgeslagen');

    const emailaddress = this.typedForm.controls.emailaddress.value;
    const password = this.typedForm.controls.password.value;

    // this.activationmessage = undefined;
    this.authService.register({ emailaddress: emailaddress, password: password })
      .subscribe({
        next: (registered: boolean) => {
          this.registered = registered;
          this.resetAlert();
        },
        error: (e: string) => {
          this.setAlert(IAlertType.Danger, 'het registreren is niet gelukt: ' + e); this.processing = false;
        },
        complete: () => this.processing = false
      });
    return false;
  }
}

export interface UserValidations {
  minlengthemailaddress: number;
  maxlengthemailaddress: number;
  minlengthpassword: number;
  maxlengthpassword: number;
}
