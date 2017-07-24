import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { UserService } from './service';
import { User } from './user';
import { AuthenticationService } from '../auth/service';
// import { CompetitionSeasonService } from './competition-season.service';

@Component({
    moduleId: module.id,
    selector: 'register',
    templateUrl: 'register.component.html',
    styleUrls: [ 'register.component.css' ]
})

export class RegisterComponent {
    model: any = {};
    loading = false;
    error = '';

    constructor( private router : Router, private userService : UserService, private authService : AuthenticationService ) { }

    register() {
        this.loading = true;
        var user = new User();
        user.name = this.model.name;
        user.password = this.model.password;
        user.emailaddress = this.model.email;

        this.authService.register( user )
            .subscribe(
                /* happy path */ p => {
                    this.authService.login( user.emailaddress, user.password)
                        .subscribe(
                            /* happy path */ p => this.router.navigate(['/']),
                            /* error path */ e => {
                                this.error = decodeURIComponent( e );
                                this.loading = false;
                            },
                            /* onComplete */ () => this.loading = false
                        );
                },
                /* error path */ e => {
                    this.error = decodeURIComponent( e );
                    this.loading = false;
                },
                /* onComplete */ () => this.loading = false
        );
    }
}