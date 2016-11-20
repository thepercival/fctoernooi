import { Component, Input, OnInit } from '@angular/core';
import { ActivatedRoute, Params }   from '@angular/router';
import { Location }                 from '@angular/common';

import { CompetitionSeasonService } from './service';
import { CompetitionSeason } from './competitionseason';

@Component({
    moduleId: module.id,
    selector: 'competitionseason-main',
    templateUrl: 'main.component.html',
    styleUrls: [ 'main.component.css' ]
})

export class CompetitionSeasonMainComponent implements OnInit{
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
                .forEach(object => this.object = object);
        });
    }

    save(): void {
        this.cbjectService.update(this.object)
            .forEach(() => this.goBack());
    }

    goBack(): void {
        this.location.back();
    }
}
