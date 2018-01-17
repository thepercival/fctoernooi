import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

import { IAlert } from '../../app.definitions';
import { AuthService } from '../../auth/auth.service';

@Component({
  selector: 'app-passwordchange',
  templateUrl: './passwordchange.component.html',
  styleUrls: ['./passwordchange.component.css']
})
export class PasswordchangeComponent implements OnInit {

  model: any = {};
  loading = false;
  error = '';
  alert: IAlert;
  passwordChanged = false;
  private emailaddress;

  constructor(
    private route: ActivatedRoute,
    private activatedRoute: ActivatedRoute,
    private router: Router,
    private authService: AuthService) { }

  ngOnInit() {
    this.route.queryParamMap.subscribe(params => {
      this.emailaddress = params.get('emailaddress');
      console.log(this.emailaddress);
    });
  }

  protected setAlert(type: string, message: string) {
    this.alert = { 'type': type, 'message': message };
  }

  isLoggedIn() {
    return this.authService.isLoggedIn();
  }

  changePassword() {
    if (this.model.password !== this.model.passwordrepeat) {
      this.error = 'de wachtwoorden zijn niet gelijk';
      return false;
    }
    this.loading = true;
    // this.activationmessage = undefined;
    this.authService.passwordChange(this.emailaddress, this.model.password, this.model.code)
      .subscribe(
            /* happy path */ p => {
        // should get same as when logged in!!
        this.passwordChanged = true;
      },
            /* error path */ e => { this.error = e; this.loading = false; },
            /* onComplete */() => this.loading = false
      );
  }

}
