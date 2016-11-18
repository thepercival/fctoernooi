import { Component, OnInit } from '@angular/core';
import { CompetitionSeason } from './competitionseason';
import { CompetitionSeasonService } from './competition-season.service';

@Component({
    moduleId: module.id,
    selector: 'dashboard',
    templateUrl: 'dashboard.component.html',
    styleUrls: [ 'dashboard.component.css' ]
})

export class DashboardComponent implements OnInit {

    competitionSeasons: CompetitionSeason[] = [];

    constructor(private competitionSeasonService: CompetitionSeasonService) { }

    ngOnInit(): void {
        this.competitionSeasonService.getCompetitionSeasons()
            .forEach(competitionSeasons => this.competitionSeasons = competitionSeasons.slice(1, 3));
    }
}