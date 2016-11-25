import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router, ActivatedRoute, NavigationExtras } from '@angular/router';
import { AuthenticationService } from '../auth/service';
import {Subscription } from 'rxjs';

@Component({
    moduleId: module.id,
    selector: 'passwordreset',
    templateUrl: 'passwordreset.component.html',
    styleUrls: [ 'password.component.css' ]
})

export class PasswordResetComponent {
    model: any = {};
    loading = false;
    error = '';
    succeeded = false;

    constructor( private router: Router,private authService: AuthenticationService) { }

    passwordReset() {
        this.loading = true;

        // let backend send email
        this.authService.passwordReset( this.model.email )
            .subscribe(
               /* happy path */ res => {
                    // res should be 1
                    this.succeeded = true;
                },
                /* error path */ e => { this.error = e; this.loading = false; },
                /* onComplete */ () => this.loading = false
            );
    }
}

@Component({
    moduleId: module.id,
    selector: 'passwordchange',
    templateUrl: 'passwordchange.component.html',
    styleUrls: [ 'password.component.css' ]
})

export class PasswordChangeComponent implements OnInit, OnDestroy{
    private subscription: Subscription;
    private email;
    private key;
    model: any = {};
    loading = false;
    error = '';
    succeeded = false;

    constructor( private activatedRoute: ActivatedRoute, private router: Router,private authService: AuthenticationService) { }

    ngOnInit() {

        this.authService.logout();
        // subscribe to router event, params or queryParams
        this.subscription = this.activatedRoute.queryParams.subscribe(
            (param: any) => {
                this.email = param['email'];
                this.key = param['key'];
            });
    }

    ngOnDestroy() {
        // prevent memory leak by unsubscribing
        this.subscription.unsubscribe();
    }

    passwordChange() {
        this.loading = true;

        // let backend send email
        this.authService.passwordChange( this.email, this.model.password, this.key )
            .subscribe(
                /* happy path */ res => {
                    this.succeeded = true;
                },
                /* error path */ e => { this.error = 'je wachtwoord is niet gewijzigd:' + e; this.loading = false; },
                /* onComplete */ () => this.loading = false
            );
    }
}