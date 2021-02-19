import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import {
  Sport,
  CompetitionSport,
  CompetitionSportService,
} from 'ngx-sport';

import { Tournament } from '../../lib/tournament';
import { TournamentRepository } from '../../lib/tournament/repository';
import { TranslateService } from '../../lib/translate';
import { TournamentComponent } from '../../shared/tournament/component';
import { StructureRepository } from '../../lib/ngx-sport/structure/repository';
import { PlanningRepository } from '../../lib/ngx-sport/planning/repository';
import { CompetitionSportTab } from '../../shared/tournament/competitionSportTab';
import { CompetitionSportRepository } from '../../lib/ngx-sport/competitionSport/repository';
import { SportSelectMode } from '../sport/select.component';
import { forkJoin, Observable } from 'rxjs';

@Component({
  selector: 'app-tournament-sport',
  templateUrl: './list.component.html',
  styleUrls: ['./list.component.scss']
})
export class CompetitionSportListComponent extends TournamentComponent implements OnInit {
  competitionSports: CompetitionSport[];
  translateService: TranslateService;
  showSelectSports = false;
  hasBegun: boolean;

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
    private modalService: NgbModal
  ) {
    super(route, router, tournamentRepository, sructureRepository);
    this.translateService = new TranslateService();
  }

  ngOnInit() {
    super.myNgOnInit(() => this.initSports());
  }

  initSports() {
    this.createCompetitionSportsList();
    this.hasBegun = this.structure.getRootRound().hasBegun();
    this.processing = false;
    if (this.hasBegun) {
      this.setAlert('warning', 'er zijn al wedstrijden gespeeld, je kunt niet meer wijzigen');
    }
  }

  createCompetitionSportsList() {
    this.competitionSports = this.competition.getSports();
  }

  get SportSelectModeAdd(): SportSelectMode { return SportSelectMode.Add; }

  get TabFields(): CompetitionSportTab { return CompetitionSportTab.Fields; }

  getSports(): Sport[] {
    return this.competitionSports.map((competitionSport: CompetitionSport) => competitionSport.getSport());
  }

  selectedSports(sports: Sport[]) {
    // const sportsName = this.sports.map((sport: Sport) => sport.getName()).join(',');
    // this.form.controls.sportsName.setValue(sportsName);
    this.showSelectSports = false;
    if (sports.length === 0) {
      return;
    }

    this.setAlert('info', 'de sport(en) worden toegevoegd');
    this.processing = true;

    const reposUpdates: Observable<CompetitionSport>[] = sports.map((sport: Sport) => {
      return this.competitionSportRepository.createObject(sport, this.tournament, this.structure);
    });
    forkJoin(reposUpdates).subscribe(results => {
      this.processing = false;
    },
      e => {
        this.alert = { type: 'danger', message: 'de wedstrijd-aantallen zijn niet opgeslagen: ' + e };
        this.processing = false;
      });
  }

  // addSport() {
  //   this.linkToEdit(this.tournament);
  // }

  openRemoveModal(content, competitionSport: CompetitionSport) {
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
        /* happy path */ refereeRes => {
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
