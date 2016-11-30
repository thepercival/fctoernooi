import { Component, OnInit } from '@angular/core';
import { CompetitionSeason } from '../voetbal/competitionseason';
import { CompetitionSeasonService } from '../competitionseason/service';
import { AuthenticationService } from '../auth/service';
import { NgbdModalContent } from '../competitionseason/newmodal/component';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';

@Component({
    moduleId: module.id,
    selector: 'home',
    templateUrl: 'component.html',
    styleUrls: [ 'component.css' ]
})

export class HomeComponent implements OnInit {

    // auth service gebruiken
    competitionSeasons: CompetitionSeason[] = [];
    selectedCompetitionSeason: CompetitionSeason = null;


    // constructor
    constructor(
        private competitionSeasonService: CompetitionSeasonService,
        private authService: AuthenticationService,
        private modalService: NgbModal
    ){}

    // interfaces
    ngOnInit(): void {
        if ( this.authService.user )
            this.competitionSeasons = this.authService.user.competitionSeasons;
    }

    // methods
    // getCompetitionSeasons(): void {
        // this.competitionSeasonService.getCompetitionSeasons().forEach( competitionseasons => this.competitionSeasons = competitionseasons);
   //  }

    onSelect(competitionseason: CompetitionSeason): void {
        this.selectedCompetitionSeason = competitionseason;
        // console.log( this.selectedCompetitionSeason );
    }

    open( demo: boolean ) {
        const modalRef = this.modalService.open(NgbdModalContent, { backdrop : 'static' } );
        modalRef.componentInstance.demo = demo;
    }

    delete(competitionseason: CompetitionSeason): void {
        this.competitionSeasonService
            .delete(competitionseason.id)
            .forEach(() => {
                this.competitionSeasons = this.competitionSeasons.filter(h => h !== competitionseason);
                if (this.selectedCompetitionSeason === competitionseason) { this.selectedCompetitionSeason = null; }
            });
    }
}