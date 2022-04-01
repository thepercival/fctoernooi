import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';

import { AuthService } from '../../lib/auth/auth.service';
import { IAlert, IAlertType } from '../../shared/common/alert';
import { User } from '../../lib/user';
import { UserComponent } from '../component';
import { UserRepository } from '../../lib/user/repository';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent extends UserComponent implements OnInit {
  registered = false;
  form: FormGroup;

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
    fb: FormBuilder
  ) {
    super(route, router, userRepository, authService);
    this.form = fb.group({
      emailaddress: ['', Validators.compose([
        Validators.required,
        Validators.minLength(this.validations.minlengthemailaddress),
        Validators.maxLength(this.validations.maxlengthemailaddress)
      ])],
      password: ['', Validators.compose([
        Validators.required,
        Validators.minLength(this.validations.minlengthpassword),
        Validators.maxLength(this.validations.maxlengthpassword)
      ])],

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

    const emailaddress = this.form.controls.emailaddress.value;
    const password = this.form.controls.password.value;

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
