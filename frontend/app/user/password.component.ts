import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
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

export class PasswordChangeComponent {
    model: any = {};
    loading = false;
    error = '';
    succeeded = false;


    constructor( private router: Router,private authService: AuthenticationService) { }

    passwordChange() {
        this.loading = true;

        // let backend send email
        this.authService.passwordChange( this.model.email, this.model.password )
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