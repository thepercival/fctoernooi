import { Component, OnInit } from '@angular/core';
import { CompetitionSeason } from '../competitionseason';
import { CompetitionSeasonService } from '../competition-season.service';

@Component({
    moduleId: module.id,
    selector: 'home',
    templateUrl: 'component.html',
    styleUrls: [ 'component.css' ]
})

export class HomeComponent implements OnInit {

    public currentUser: string;
    competitionSeasons: CompetitionSeason[] = [];
    selectedCompetitionSeason: CompetitionSeason = null;
    public newIsCollapsed = true;

    // constructor
    constructor(
        private competitionSeasonService: CompetitionSeasonService
    ){}

    // interfaces
    ngOnInit(): void {
        this.currentUser = localStorage.getItem('currentUser');
        if ( this.currentUser )
            this.currentUser = JSON.parse( this.currentUser );

        this.getCompetitionSeasons();
    }

    // methods
    getCompetitionSeasons(): void {
        this.competitionSeasonService.getCompetitionSeasons().forEach( competitionseasons => this.competitionSeasons = competitionseasons);
    }

    onSelect(competitionseason: CompetitionSeason): void {
        this.selectedCompetitionSeason = competitionseason;
        // console.log( this.selectedCompetitionSeason );
    }

    add(name: string, seasonname: string): void {
        name = name.trim();
        if (!name) {
            return;
        }
        seasonname = seasonname.trim();
        if (!seasonname) {
            return;
        }
        this.competitionSeasonService.create(name,seasonname)
            .forEach(competitionseason => {
                this.competitionSeasons.push(competitionseason);
                this.selectedCompetitionSeason = null;
            });
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