import { OnInit } from '@angular/core';
import { AuthenticationService } from '../auth/service';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
export declare class HomeComponent implements OnInit {
    private authService;
    private modalService;
    constructor(authService: AuthenticationService, modalService: NgbModal);
    ngOnInit(): void;
}
