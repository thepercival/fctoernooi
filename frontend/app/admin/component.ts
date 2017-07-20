/**
 * Created by coen on 10-2-17.
 */

import { Component, OnInit } from '@angular/core';
import { AuthenticationService } from '../auth/service';

@Component({
    moduleId: module.id,
    selector: 'admin',
    templateUrl: 'component.html'/*,
    styleUrls: [ 'component.css' ]*/
})

export class AdminComponent implements OnInit {

    // constructor
    constructor(
        private authService: AuthenticationService
    ){}


    // interfaces
    ngOnInit(): void {
//        if ( this.authService.user )
    }
}
