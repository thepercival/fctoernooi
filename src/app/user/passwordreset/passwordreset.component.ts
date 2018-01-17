import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

import { IAlert } from '../../app.definitions';
import { AuthService } from '../../auth/auth.service';

@Component({
  selector: 'app-passwordreset',
  templateUrl: './passwordreset.component.html',
  styleUrls: ['./passwordreset.component.css']
})
export class PasswordresetComponent implements OnInit {

  model: any = {};
  loading = false;
  error = '';
  alert: IAlert;
  codeSend = false;

  constructor(private activatedRoute: ActivatedRoute, private router: Router, private authService: AuthService) { }

  ngOnInit() {
    // this.subscription = this.activatedRoute.queryParams.subscribe(
    //     (param: any) => {
    //       this.activationmessage = param['message'];
    //     });
  }

  protected setAlert(type: string, message: string) {
    this.alert = { 'type': type, 'message': message };
  }

  isLoggedIn() {
    return this.authService.isLoggedIn();
  }

  sendCode() {
    this.loading = true;
    // this.activationmessage = undefined;
    this.authService.passwordReset(this.model.emailaddress)
      .subscribe(
            /* happy path */ p => {
        this.codeSend = true;
      },
            /* error path */ e => { this.error = e; this.loading = false; },
            /* onComplete */() => this.loading = false
      );
  }

}
