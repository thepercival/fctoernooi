import { OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Location } from '@angular/common';
import { CompetitionSeasonService } from './service';
import { CompetitionSeason } from '../voetbal/competitionseason';
export declare class CompetitionSeasonStructureComponent implements OnInit {
    private cbjectService;
    private route;
    private location;
    object: CompetitionSeason;
    constructor(cbjectService: CompetitionSeasonService, route: ActivatedRoute, location: Location);
    ngOnInit(): void;
    save(): void;
    goBack(): void;
}
