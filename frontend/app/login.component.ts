import { Component, OnInit } from '@angular/core';
// import { CompetitionSeason } from './competitionseason';
// import { CompetitionSeasonService } from './competition-season.service';

@Component({
    moduleId: module.id,
    selector: 'login',
    templateUrl: 'login.component.html',
    styleUrls: [ 'login.component.css' ]
})

export class LoginComponent /*implements OnInit*/ {

    /*competitionSeasons: CompetitionSeason[] = [];

    constructor(private competitionSeasonService: CompetitionSeasonService) { }

    ngOnInit(): void {
        this.competitionSeasonService.getCompetitionSeasons()
            .forEach(competitionSeasons => this.competitionSeasons = competitionSeasons.slice(1, 3));
    }*/
}