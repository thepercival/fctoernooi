import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';

import { AuthService } from '../../lib/auth/auth.service';
import { IAlertType } from '../../shared/common/alert';
import { User } from '../../lib/user';
import { UserRepository } from '../../lib/user/repository';
import { UserComponent } from '../component';
import { GlobalEventsManager } from '../../shared/common/eventmanager';
import { CustomValidators } from '../password-validation';

@Component({
  selector: 'app-passwordchange',
  templateUrl: './passwordchange.component.html',
  styleUrls: ['./passwordchange.component.css']
})
export class PasswordchangeComponent extends UserComponent implements OnInit {
  passwordChanged = false;
  public typedForm: FormGroup<{
    code: FormControl<string>,
    password: FormControl<string>,
    passwordRepeat: FormControl<string>,
  }>;

  validations: any = {
    minlengthcode: 100000,
    maxlengthcode: 999999,
    minlengthpassword: User.MIN_LENGTH_PASSWORD,
    maxlengthpassword: User.MAX_LENGTH_PASSWORD
  };
  private emailaddress: string = '';

  constructor(
    route: ActivatedRoute,
    router: Router,
    userRepository: UserRepository,
    authService: AuthService,
    globalEventsManager: GlobalEventsManager
  ) {
    super(route, router, userRepository, authService, globalEventsManager);
    this.typedForm = new FormGroup(
      {
        code: new FormControl('', { nonNullable: true, validators: 
          [
              Validators.required,
              Validators.minLength(this.validations.minlengthcode),
              Validators.maxLength(this.validations.maxlengthcode)
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
    this.route.queryParamMap.subscribe(params => {
      this.emailaddress = params.get('emailaddress') ?? '';
    });
    this.processing = false;
  }

  changePassword(): boolean {
    this.processing = true;
    this.setAlert(IAlertType.Info, 'het wachtwoord wordt gewijzigd');

    const code = this.typedForm.controls.code.value;
    const password = this.typedForm.controls.password.value;

    // this.activationmessage = undefined;
    this.authService.passwordChange(this.emailaddress, password, code)
      .subscribe({
        next: () => {
          this.passwordChanged = true;
          this.resetAlert();
        },
        error: (e: string) => {
          this.setAlert(IAlertType.Danger, 'het wijzigen van het wachtwoord is niet gelukt: ' + e);
          this.processing = false;
        },
        complete: () => this.processing = false
      });
    return false;
  }
}
