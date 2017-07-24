import { OnInit } from '@angular/core';
import { CompetitionSeason } from '../voetbal/competitionseason';
import { CompetitionSeasonService } from '../competitionseason/service';
import { AuthenticationService } from '../auth/service';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
export declare class HomeComponent implements OnInit {
    private competitionSeasonService;
    private authService;
    private modalService;
    competitionSeasons: CompetitionSeason[];
    selectedCompetitionSeason: CompetitionSeason;
    constructor(competitionSeasonService: CompetitionSeasonService, authService: AuthenticationService, modalService: NgbModal);
    ngOnInit(): void;
    onSelect(competitionseason: CompetitionSeason): void;
    open(demo: boolean): void;
    delete(competitionseason: CompetitionSeason): void;
}
