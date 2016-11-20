import { OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Location } from '@angular/common';
import { CompetitionSeasonService } from '../competition-season.service';
import { CompetitionSeason } from '../competitionseason';
export declare class CompetitionSeasonMainComponent implements OnInit {
    private cbjectService;
    private route;
    private location;
    object: CompetitionSeason;
    constructor(cbjectService: CompetitionSeasonService, route: ActivatedRoute, location: Location);
    ngOnInit(): void;
    save(): void;
    goBack(): void;
}
