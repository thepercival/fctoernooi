/**
 * Created by coen on 23-11-16.
 */
import { OnInit } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { Router } from '@angular/router';
import { CompetitionSeasonService } from '../service';
import { CompetitionSeasonInMemoryService } from '../service.inmemory';
export declare class NgbdModalContent implements OnInit {
    activeModal: NgbActiveModal;
    private router;
    private competitionSeasonService;
    private competitionSeasonInMemoryService;
    demo: any;
    model: any;
    loading: boolean;
    error: string;
    constructor(activeModal: NgbActiveModal, router: Router, competitionSeasonService: CompetitionSeasonService, competitionSeasonInMemoryService: CompetitionSeasonInMemoryService);
    ngOnInit(): void;
    add(): boolean;
}
