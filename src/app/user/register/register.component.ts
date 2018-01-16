import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

import { IAlert } from '../../app.definitions';
import { AuthService } from '../../auth/auth.service';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css']
})
export class RegisterComponent implements OnInit {

  model: any = {};
  loading = false;
  error = '';
  alert: IAlert;
  registered = false;

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

  register() {
    this.loading = true;
    // this.activationmessage = undefined;
    this.authService.register({ emailaddress: this.model.emailaddress, password: this.model.password })
      .subscribe(
            /* happy path */ p => {
        this.registered = true;
        console.log(123);
      },
            /* error path */ e => { this.error = e; this.loading = false; },
            /* onComplete */() => this.loading = false
      );
  }
}
