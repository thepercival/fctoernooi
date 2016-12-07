import { Component, Input, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, Params }   from '@angular/router';
import { Location }                 from '@angular/common';

import { CompetitionSeasonService } from './service';
import { CompetitionSeasonInMemoryService } from './service.inmemory';
import { CompetitionSeason } from '../voetbal/competitionseason';

import {GlobalEventsManager} from "./../global-events-manager";

@Component({
    moduleId: module.id,
    selector: 'toernooi-index',
    templateUrl: 'index.component.html',
    styleUrls: [ 'index.component.css' ]
})

export class CompetitionSeasonIndexComponent implements OnInit, OnDestroy{
    @Input()
    competitionseason: CompetitionSeason;

    constructor(
        private cbjectService: CompetitionSeasonService,
        private objectInMemoryService: CompetitionSeasonInMemoryService,
        private route: ActivatedRoute,
        private location: Location,
        private globalEventsManger: GlobalEventsManager
    ) {}

    ngOnInit(): void {

        this.route.params.forEach((params: Params) => {

            let service = (params['id']) > 0 ? this.cbjectService : this.objectInMemoryService;
            service.getObject( params['id'] )
                  .subscribe(
                    /* happy path */ cs => {
                          this.competitionseason = cs;
                          if ( this.competitionseason == undefined )
                              return;
                          if ( this.competitionseason.rounds.length == 0 ) {
                              this.competitionseason.addRound( this.competitionseason.participants.length, false );
                          }
                          console.log( this.competitionseason );
                      },
                    /* error path */ e => {},
                    /* onComplete */ () => {}
                );
        });

        this.globalEventsManger.showCompetitionSeasonDetailsInNavBar.emit( true );
    }

    ngOnDestroy(): void {

        this.globalEventsManger.showCompetitionSeasonDetailsInNavBar.emit( false );
    }

    save(): void {
        /*this.cbjectService.update(this.object)
            .forEach(() => this.goBack());*/
    }


    goBack(): void {
        this.location.back();
    }
}
