import { OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Location } from '@angular/common';
import { CompetitionSeasonService } from './service';
import { CompetitionSeasonInMemoryService } from './service.inmemory';
import { CompetitionSeason } from '../voetbal/competitionseason';
import { GlobalEventsManager } from "./../global-events-manager";
export declare class CompetitionSeasonIndexComponent implements OnInit, OnDestroy {
    private cbjectService;
    private objectInMemoryService;
    private route;
    private location;
    private globalEventsManger;
    competitionseason: CompetitionSeason;
    constructor(cbjectService: CompetitionSeasonService, objectInMemoryService: CompetitionSeasonInMemoryService, route: ActivatedRoute, location: Location, globalEventsManger: GlobalEventsManager);
    ngOnInit(): void;
    ngOnDestroy(): void;
    save(): void;
    goBack(): void;
}
