import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthenticationService } from '../auth/service';

@Component({
    moduleId: module.id,
    selector: 'logout',
    template: ''
})

export class LogoutComponent implements OnInit {

    constructor( private router: Router,private authenticationService: AuthenticationService) { }

    ngOnInit() {
        // reset login status
        this.authenticationService.logout();
        this.router.navigate(['/']);
    }
}