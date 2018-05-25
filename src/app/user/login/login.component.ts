import { Subscription } from 'rxjs';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

import { AuthService } from '../../auth/auth.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit, OnDestroy {

  model: any = {};
  loading = false;
  protected sub: Subscription;
  error: string;
  info: string;
  // activationmessage: string;

  constructor(private activatedRoute: ActivatedRoute, private router: Router, private authService: AuthService) { }

  ngOnInit() {
    this.sub = this.activatedRoute.queryParams.subscribe(
      (param: any) => {
        this.info = param['message'];
      });
  }

  login() {
    this.loading = true;
    this.info = undefined;
    this.authService.login(this.model.emailaddress, this.model.password)
      .subscribe(
            /* happy path */ p => this.router.navigate(['/home']),
            /* error path */ e => { this.error = e; this.loading = false; },
            /* onComplete */() => this.loading = false
      );
  }

  ngOnDestroy() {
    this.sub.unsubscribe();
  }

}
