import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';

import { IAlert } from '../../app.definitions';
import { AuthService } from '../../auth/auth.service';
import { User } from '../user';

@Component({
  selector: 'app-passwordreset',
  templateUrl: './passwordreset.component.html',
  styleUrls: ['./passwordreset.component.css']
})
export class PasswordresetComponent implements OnInit {

  alert: IAlert;
  codeSend = false;
  processing = true;
  customForm: FormGroup;

  validations: any = {
    minlengthemailaddress: User.MIN_LENGTH_EMAIL,
    maxlengthemailaddress: User.MAX_LENGTH_EMAIL
  };

  constructor(
    private activatedRoute: ActivatedRoute,
    private router: Router,
    private authService: AuthService,
    fb: FormBuilder
  ) {
    this.customForm = fb.group({
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

  protected setAlert(type: string, message: string) {
    this.alert = { 'type': type, 'message': message };
  }

  protected resetAlert() {
    this.alert = undefined;
  }

  isLoggedIn() {
    return this.authService.isLoggedIn();
  }

  sendCode(): boolean {
    this.processing = true;
    this.setAlert('info', 'de code wordt verstuurd');

    const emailaddress = this.customForm.controls.emailaddress.value;

    // this.activationmessage = undefined;
    this.authService.passwordReset(emailaddress)
      .subscribe(
            /* happy path */ p => {
          this.codeSend = true;
          this.resetAlert();
        },
            /* error path */ e => { this.setAlert('danger', 'het verzenden van de code is niet gelukt: ' + e); this.processing = false; },
            /* onComplete */() => this.processing = false
      );
    return false;
  }

}
