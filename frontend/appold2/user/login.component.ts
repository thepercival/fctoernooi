import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { AuthenticationService } from '../auth/service';
import {Subscription } from 'rxjs';

@Component({
    moduleId: module.id,
    selector: 'login',
    templateUrl: 'login.component.html',
    styleUrls: [ 'login.component.css' ]
})

export class LoginComponent implements OnInit {
    model: any = {};
    loading = false;
    private subscription: Subscription;
    error = '';
    activationmessage = null;

    constructor( private activatedRoute: ActivatedRoute, private router: Router,private authenticationService: AuthenticationService) { }

    ngOnInit() {
        this.subscription = this.activatedRoute.queryParams.subscribe(
            (param: any) => {
                this.activationmessage = param['message'];
            });
    }

    login() {
        this.loading = true;
        this.activationmessage = null;
        this.authenticationService.login(this.model.emailaddress, this.model.password)
            .subscribe(
                /* happy path */ p => this.router.navigate(['/admin']),
                /* error path */ e => { this.error = e; this.loading = false; },
                /* onComplete */ () => this.loading = false
            );
    }
}