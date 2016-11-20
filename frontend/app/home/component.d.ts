import { OnInit } from '@angular/core';
import { CompetitionSeason } from '../competitionseason';
import { CompetitionSeasonService } from '../competition-season.service';
export declare class HomeComponent implements OnInit {
    private competitionSeasonService;
    currentUser: string;
    competitionSeasons: CompetitionSeason[];
    selectedCompetitionSeason: CompetitionSeason;
    newIsCollapsed: boolean;
    constructor(competitionSeasonService: CompetitionSeasonService);
    ngOnInit(): void;
    getCompetitionSeasons(): void;
    onSelect(competitionseason: CompetitionSeason): void;
    add(name: string, seasonname: string): void;
    delete(competitionseason: CompetitionSeason): void;
}
