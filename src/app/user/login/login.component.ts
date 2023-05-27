import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';

import { AuthService } from '../../lib/auth/auth.service';
import { IAlert, IAlertType } from '../../shared/common/alert';
import { User } from '../../lib/user';
import { UserComponent } from '../component';
import { UserRepository } from '../../lib/user/repository';
import { GlobalEventsManager } from '../../shared/common/eventmanager';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent extends UserComponent implements OnInit {
  registered = false;
  public typedForm: FormGroup<{
    emailaddress: FormControl<string>,
    password: FormControl<string>
  }>;

  validations: any = {
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
    this.typedForm = fb.group({
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
    });
  }

  ngOnInit() {
    this.route.queryParams.subscribe(
      (param: any) => {
        if (param.message !== undefined) {
          this.setAlert(IAlertType.Info, param.message);
        }
      });
    if (this.authService.isLoggedIn() === true) {
      this.setAlert(IAlertType.Danger, 'je bent al ingelogd');
    }
    this.processing = false;
  }

  login(): boolean {
    this.processing = true;
    this.setAlert(IAlertType.Info, 'je wordt ingelogd');

    const emailaddress = this.typedForm.controls.emailaddress.value;
    const password = this.typedForm.controls.password.value;

    this.authService.login(emailaddress, password)
      .subscribe({
        next: () => {
          this.router.navigate(['/']);
        },
        error: (e: string) => {
          this.setAlert(IAlertType.Danger, e); this.processing = false;
        },
        complete: () => this.processing = false
      });
    return false;
  }
}
