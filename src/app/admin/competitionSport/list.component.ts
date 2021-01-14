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
import { SportConfigRepository } from '../../lib/ngx-sport/sport/config/repository';
import { StructureRepository } from '../../lib/ngx-sport/structure/repository';
import { PlanningRepository } from '../../lib/ngx-sport/planning/repository';

@Component({
  selector: 'app-tournament-sport',
  templateUrl: './list.component.html',
  styleUrls: ['./list.component.scss']
})
export class CompetitionSportListComponent extends TournamentComponent implements OnInit {
  competitionSports: CompetitionSport[];
  translateService: TranslateService;
  hasBegun: boolean;

  validations: any = {
    'minlengthname': Sport.MIN_LENGTH_NAME,
    'maxlengthname': Sport.MAX_LENGTH_NAME
  };

  constructor(
    route: ActivatedRoute,
    router: Router,
    private competitionSportService: CompetitionSportService,
    tournamentRepository: TournamentRepository,
    sructureRepository: StructureRepository,
    private sportConfigRepository: SportConfigRepository,
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

  // addSport() {
  //   this.linkToEdit(this.tournament);
  // }

  editCompetitionSport(competitionSport: CompetitionSport) {
    this.linkToEdit(this.tournament, competitionSport);
  }

  linkToEdit(tournament: Tournament, competitionSport?: CompetitionSport) {
    this.router.navigate(['/admin/competitionsport', tournament.getId(), competitionSport ? competitionSport.getId() : 0]);
  }

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

    // TODOSPORT
    // this.competitionSportService.remove(competitionSport, this.structure);

    // this.competitionSportRepository.removeObject(competitionSport, this.tournament, this.structure)
    //   .subscribe(
    //     /* happy path */ refereeRes => {
    //       this.planningRepository.create(this.structure, this.tournament, 1).subscribe(
    //         /* happy path */ roundNumberOut => {
    //           this.setAlert('success', 'de sport is verwijderd');
    //         },
    //         /* error path */ e => { this.setAlert('danger', e); this.processing = false; },
    //         /* onComplete */() => this.processing = false
    //       );
    //     },
    //         /* error path */ e => { this.setAlert('danger', e); this.processing = false; },
    //   );
  }
}
