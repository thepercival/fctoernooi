import { OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Observable } from 'rxjs/Observable';
import { CompetitionSeasonSearchService } from './competition-season-search.service';
import { CompetitionSeason } from './competitionseason';
export declare class CompetitionSeasonSearchComponent implements OnInit {
    private competitionSeasonSearchService;
    private router;
    competitionseasons: Observable<CompetitionSeason[]>;
    private searchTerms;
    constructor(competitionSeasonSearchService: CompetitionSeasonSearchService, router: Router);
    search(term: string): void;
    ngOnInit(): void;
    gotoMain(competitionseason: CompetitionSeason): void;
}
