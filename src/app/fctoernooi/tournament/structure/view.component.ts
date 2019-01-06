import { Component, OnInit, } from '@angular/core';
import { ActivatedRoute, Router, RoutesRecognized, NavigationEnd } from '@angular/router';
import {
  StructureRepository
} from 'ngx-sport';


import { TournamentComponent } from '../component';
import { TournamentRepository } from '../repository';

@Component({
  selector: 'app-tournament-structure-view',
  templateUrl: './view.component.html',
  styleUrls: ['./view.component.css']
})
export class TournamentStructureViewComponent extends TournamentComponent implements OnInit {
  private queryParamScrollTo;
  private returnUrlQueryParamKey: string;
  private returnUrlQueryParamValue: string;

  constructor(
    route: ActivatedRoute,
    router: Router,    
    tournamentRepository: TournamentRepository,
    structureRepository: StructureRepository
  ) {
    super(route, router, tournamentRepository, structureRepository);

    this.route.queryParamMap.subscribe(params => {
        this.returnUrlQueryParamKey = params.get('returnQueryParamKey') !== null ? params.get('returnQueryParamKey') : undefined;
        this.returnUrlQueryParamValue = params.get('returnQueryParamValue') !== null ? params.get('returnQueryParamValue') : undefined;
    });
  }

  ngOnInit() {
    super.myNgOnInit(() => {
      this.processing = false;
    });
  } 

  navigateBack() {
    let extras;
    if( this.returnUrlQueryParamKey !== undefined ) {
      extras = { queryParams: {} };
      extras.queryParams[this.returnUrlQueryParamKey] = this.returnUrlQueryParamValue;
    }
    this.router.navigate(['toernooi/view', this.tournament.getId()],extras);
  }
}
