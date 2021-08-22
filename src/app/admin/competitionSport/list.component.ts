import { Component, OnInit, TemplateRef } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import {
  Sport,
  CompetitionSport,
} from 'ngx-sport';

import { TournamentRepository } from '../../lib/tournament/repository';
import { TranslateService } from '../../lib/translate';
import { TournamentComponent } from '../../shared/tournament/component';
import { StructureRepository } from '../../lib/ngx-sport/structure/repository';
import { PlanningRepository } from '../../lib/ngx-sport/planning/repository';
import { CompetitionSportTab } from '../../shared/tournament/competitionSportTab';
import { CompetitionSportRepository } from '../../lib/ngx-sport/competitionSport/repository';
import { SportWithFields } from '../sport/createSportWithFields.component';
@Component({
  selector: 'app-tournament-sport',
  templateUrl: './list.component.html',
  styleUrls: ['./list.component.scss']
})
export class CompetitionSportListComponent extends TournamentComponent implements OnInit {
  competitionSports: CompetitionSport[] = [];
  showCreateSportWithFields = false;
  hasBegun!: boolean;
  maxReached = true;

  validations: any = {
    'minlengthname': Sport.MIN_LENGTH_NAME,
    'maxlengthname': Sport.MAX_LENGTH_NAME
  };

  constructor(
    route: ActivatedRoute,
    router: Router,
    tournamentRepository: TournamentRepository,
    sructureRepository: StructureRepository,
    private competitionSportRepository: CompetitionSportRepository,
    private planningRepository: PlanningRepository,
    public translateService: TranslateService,
    private modalService: NgbModal
  ) {
    super(route, router, tournamentRepository, sructureRepository);
  }

  ngOnInit() {
    super.myNgOnInit(() => this.initSports());
  }

  initSports() {
    this.createCompetitionSportsList();
    this.hasBegun = this.structure.getRootRound().hasBegun();
    this.maxReached = this.competition.getSports().length >= 10;
    this.processing = false;
    if (this.hasBegun) {
      this.setAlert('warning', 'er zijn al wedstrijden gespeeld, je kunt niet meer wijzigen');
    }
  }

  createCompetitionSportsList() {
    this.competitionSports = this.competition.getSports();
  }

  get TabFields(): CompetitionSportTab { return CompetitionSportTab.Fields; }

  getSportsWithFields(): SportWithFields[] {
    return this.competitionSports.map((competitionSport: CompetitionSport): SportWithFields => {
      return { variant: competitionSport.getVariant(), nrOfFields: competitionSport.getFields().length };
    });
  }

  add(sportWithFields: SportWithFields) {
    // const sportsName = this.sports.map((sport: Sport) => sport.getName()).join(',');
    // this.form.controls.sportsName.setValue(sportsName);
    this.showCreateSportWithFields = false;

    this.setAlert('info', 'de sport(en) worden toegevoegd');
    this.processing = true;

    const json = this.competitionSportRepository.sportWithFieldsToJson(sportWithFields, true);
    this.competitionSportRepository.createObject(json, this.tournament, this.structure)
      .subscribe(
        /* happy path */(competitionSport: CompetitionSport) => {
          this.planningRepository.create(this.structure, this.tournament, 1).subscribe(
            /* happy path */ roundNumberOut => {
              this.setAlert('success', 'de sport is toegevoegd');
            },
            /* error path */ e => { this.setAlert('danger', e); this.processing = false; },
            /* onComplete */() => this.processing = false
          );
        },
            /* error path */ e => { this.setAlert('danger', e); this.processing = false; },
      );
  }

  // addSport() {
  //   this.linkToEdit(this.tournament);
  // }

  openRemoveModal(content: TemplateRef<any>, competitionSport: CompetitionSport) {
    this.modalService.open(content).result.then((result) => {
      if (result === 'remove') {
        this.remove(competitionSport);
      }
    }, (reason) => {

    });
  }

  remove(competitionSport: CompetitionSport) {
    this.setAlert('info', 'de sport wordt verwijderd');
    this.processing = true;

    this.competitionSportRepository.removeObject(competitionSport, this.tournament, this.structure)
      .subscribe(
        /* happy path */() => {
          this.planningRepository.create(this.structure, this.tournament, 1).subscribe(
            /* happy path */ roundNumberOut => {
              this.setAlert('success', 'de sport is verwijderd');
            },
            /* error path */ e => { this.setAlert('danger', e); this.processing = false; },
            /* onComplete */() => this.processing = false
          );
        },
            /* error path */ e => { this.setAlert('danger', e); this.processing = false; },
      );
  }
}
