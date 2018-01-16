import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

import { AuthService } from '../../auth/auth.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {

  model: any = {};
  loading = false;
  // private subscription: Subscription;
  error = '';
  // activationmessage: string;

  constructor(private activatedRoute: ActivatedRoute, private router: Router, private authService: AuthService) { }

  ngOnInit() {
    // this.subscription = this.activatedRoute.queryParams.subscribe(
    //     (param: any) => {
    //       this.activationmessage = param['message'];
    //     });
  }

  login() {
    this.loading = true;
    // this.activationmessage = undefined;
    this.authService.login(this.model.emailaddress, this.model.password)
      .subscribe(
            /* happy path */ p => this.router.navigate(['/home']),
            /* error path */ e => { this.error = e; this.loading = false; },
            /* onComplete */() => this.loading = false
      );
  }

}
