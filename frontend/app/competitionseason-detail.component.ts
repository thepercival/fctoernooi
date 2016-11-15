import { Component, Input, OnInit } from '@angular/core';
import { ActivatedRoute, Params }   from '@angular/router';
import { Location }                 from '@angular/common';

import { CompetitionSeasonService } from './competition-season.service';
import { CompetitionSeason } from './competitionseason';

@Component({
    moduleId: module.id,
    selector: 'competitionseason-detail',
    templateUrl: 'competitionseason-detail.component.html',
    styleUrls: [ 'competitionseason-detail.component.css' ]
})

export class CompetitionSeasonDetailComponent implements OnInit{
    @Input()
    object: CompetitionSeason;

    constructor(
        private cbjectService: CompetitionSeasonService,
        private route: ActivatedRoute,
        private location: Location
    ) {}

    ngOnInit(): void {
        this.route.params.forEach((params: Params) => {
            let id = +params['id'];
            this.cbjectService.getCompetitionSeason(id)
                .then(object => this.object = object);
        });
    }

    save(): void {
        this.cbjectService.update(this.object)
            .then(() => this.goBack());
    }

    goBack(): void {
        this.location.back();
    }
}
