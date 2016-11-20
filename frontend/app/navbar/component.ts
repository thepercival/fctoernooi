/**
 * Created by coen on 18-11-16.
 */
import { Component } from '@angular/core';
import { AuthenticationService } from '../auth/service';
import { Router } from '@angular/router';

@Component({
    moduleId: module.id,
    selector: 'navbar',
    templateUrl: 'component.html',
    styleUrls: [ 'component.css' ]
})
export class NavbarComponent {
    title = 'FCToernooi v33';

    constructor( private authenticationService: AuthenticationService, private router: Router) {}

    logout(): void {
        this.authenticationService.logout();
        this.router.navigate(['/']);
    }


}

