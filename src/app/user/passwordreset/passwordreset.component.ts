import { Component, OnInit } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';

import { AuthService } from '../../lib/auth/auth.service';
import { IAlertType } from '../../shared/common/alert';
import { User } from '../../lib/user';
import { UserComponent } from '../component';
import { UserRepository } from '../../lib/user/repository';
import { GlobalEventsManager } from '../../shared/common/eventmanager';

@Component({
  selector: 'app-passwordreset',
  templateUrl: './passwordreset.component.html',
  styleUrls: ['./passwordreset.component.css']
})
export class PasswordresetComponent extends UserComponent implements OnInit {
  codeSend = false;
  form: UntypedFormGroup;

  validations: any = {
    minlengthemailaddress: User.MIN_LENGTH_EMAIL,
    maxlengthemailaddress: User.MAX_LENGTH_EMAIL
  };

  constructor(
    route: ActivatedRoute,
    router: Router,
    userRepository: UserRepository,
    authService: AuthService,
    globalEventsManager: GlobalEventsManager,
    fb: UntypedFormBuilder
  ) {
    super(route, router, userRepository, authService, globalEventsManager);
    this.form = fb.group({
      emailaddress: ['', Validators.compose([
        Validators.required,
        Validators.minLength(this.validations.minlengthemailaddress),
        Validators.maxLength(this.validations.maxlengthemailaddress)
      ])]
    });
  }

  ngOnInit() {
    this.processing = false;
  }

  sendCode(): boolean {
    this.processing = true;
    this.setAlert(IAlertType.Info, 'de code wordt verstuurd');

    const emailaddress = this.form.controls.emailaddress.value;

    // this.activationmessage = undefined;
    this.authService.passwordReset(emailaddress).subscribe({
      next: () => {
        this.codeSend = true;
        this.resetAlert();
      },
      error: (e: string) => {
        this.setAlert(IAlertType.Danger, 'het verzenden van de code is niet gelukt: ' + e); this.processing = false;
      },
      complete: () => this.processing = false
    });
    return false;
  }

}
