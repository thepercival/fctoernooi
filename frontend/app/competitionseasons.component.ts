import {Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

import { CompetitionSeason } from './competitionseason';
import { CompetitionSeasonService } from './competition-season.service';

@Component({
    moduleId: module.id,
    selector: 'competitionseasons',
    templateUrl: 'competitionseasons.component.html',
    styleUrls: [ 'competitionseasons.component.css' ]
})

export class CompetitionSeasonsComponent implements OnInit {
    // vars
    title = 'FCToernooi v2';
    competitionseasons: CompetitionSeason[];
    selectedCompetitionSeason: CompetitionSeason = null;

    // constructor
    constructor(
        private router: Router,
        private competitionSeasonService: CompetitionSeasonService
    ){}

    // methods
    getCompetitionSeasons(): void {
        this.competitionSeasonService.getCompetitionSeasonsSlow().then( competitionseasons => this.competitionseasons = competitionseasons);
    }

    onSelect(competitionseason: CompetitionSeason): void {
        this.selectedCompetitionSeason = competitionseason;
        console.log( this.selectedCompetitionSeason );
    }

    // interfaces
    ngOnInit(): void {
        this.getCompetitionSeasons();
    }

    add(name: string): void {
        name = name.trim();
        if (!name) {
            return;
        }
        this.competitionSeasonService.create(name)
            .then(competitionseason => {
                this.competitionseasons.push(competitionseason);
                this.selectedCompetitionSeason = null;
            });
    }

    delete(competitionseason: CompetitionSeason): void {
        this.competitionSeasonService
            .delete(competitionseason.id)
            .then(() => {
                this.competitionseasons = this.competitionseasons.filter(h => h !== competitionseason);
                if (this.selectedCompetitionSeason === competitionseason) { this.selectedCompetitionSeason = null; }
            });
    }

    gotoDetail(): void {
        this.router.navigate(['/detail', this.selectedCompetitionSeason.id]);
    }
}
