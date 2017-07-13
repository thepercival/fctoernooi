import { Component, OnInit } from '@angular/core';
import { AuthenticationService } from '../auth/service';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';

@Component({
    moduleId: module.id,
    selector: 'home',
    templateUrl: 'component.html',
    styleUrls: [ 'component.css' ]
})

export class HomeComponent implements OnInit {

    // constructor
    constructor(
        private authService: AuthenticationService,
        private modalService: NgbModal
    ){}

    // interfaces
    ngOnInit(): void {
//        if ( this.authService.user )
    }
}