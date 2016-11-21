import { Component, OnInit } from '@angular/core';
import { CompetitionSeason } from '../competitionseason/competitionseason';
import { CompetitionSeasonService } from '../competitionseason/service';
import { AuthenticationService } from '../auth/service';

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
    public newIsCollapsed = true;

    // constructor
    constructor(
        private competitionSeasonService: CompetitionSeasonService,
        private authService: AuthenticationService
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

    add(name: string, seasonName: string): void {
        name = name.trim();
        if (!name) {
            return;
        }
        seasonName = seasonName.trim();
        if (!seasonName) {
            return;
        }
        this.competitionSeasonService.create(name,seasonName)
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