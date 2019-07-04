import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import {
  PlanningRepository,
  PlanningService,
  Sport,
  SportConfig,
  SportConfigRepository,
  StructureRepository,
} from 'ngx-sport';

import { Tournament } from '../../lib/tournament';
import { TournamentRepository } from '../../lib/tournament/repository';
import { TournamentService } from '../../lib/tournament/service';
import { TranslateService } from '../../lib/translate';
import { TournamentComponent } from '../component';

@Component({
  selector: 'app-tournament-sport',
  templateUrl: './list.component.html',
  styles: ['./list.component.scss']
})
export class SportConfigListComponent extends TournamentComponent implements OnInit {
  sportConfigs: SportConfig[];
  private planningService: PlanningService;
  translateService: TranslateService;

  validations: any = {
    'minlengthname': Sport.MIN_LENGTH_NAME,
    'maxlengthname': Sport.MAX_LENGTH_NAME
  };

  constructor(
    route: ActivatedRoute,
    router: Router,
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
    this.createSportConfigsList();
    this.planningService = new PlanningService(this.tournament.getCompetition());
    // this.planningService = new PlanningService(this.tournament.getCompetition());
    this.processing = false;
    if (this.hasBegun()) {
      this.setAlert('warning', 'er zijn al wedstrijden gespeeld, je kunt niet meer wijzigen');
    }
  }

  hasBegun() {
    return this.structure.getRootRound().hasBegun();
  }

  createSportConfigsList() {
    this.sportConfigs = this.tournament.getCompetition().getSportConfigs();
  }

  getNrOfFields(sport: Sport): number {
    return this.tournament.getCompetition().getFields().filter(field => field.getSport() === sport).length;
  }
  // addSport() {
  //   this.linkToEdit(this.tournament);
  // }

  editSportConfig(sportConfig: SportConfig) {
    this.linkToEdit(this.tournament, sportConfig);
  }

  linkToEdit(tournament: Tournament, sportConfig?: SportConfig) {
    this.router.navigate(['/toernooi/sportconfigedit', tournament.getId(), sportConfig ? sportConfig.getId() : 0]);
  }

  openRemoveModal(content, sportConfig: SportConfig) {
    this.modalService.open(content, { ariaLabelledBy: 'modal-remove' }).result.then((result) => {
      if (result === 'remove') {
        this.remove(sportConfig);
      }
    }, (reason) => {

    });
  }

  // linkToRoundSettings() {
  //   this.router.navigate(
  //     ['/toernooi/roundssettings', this.tournament.getId(), this.structure.getFirstRoundNumber().getNumber()],
  //     {
  //       queryParams: { category: '3' }
  //     }
  //   );
  // }

  remove(sportConfig: SportConfig) {
    this.setAlert('info', 'de sport wordt verwijderd');
    this.processing = true;

    this.sportConfigRepository.removeObject(sportConfig, this.tournament.getCompetition())
      .subscribe(
        /* happy path */ refereeRes => {
          const firstRoundNumber = this.structure.getFirstRoundNumber();
          const tournamentService = new TournamentService(this.tournament);
          tournamentService.reschedule(this.planningService, firstRoundNumber);
          this.planningRepository.editObject(firstRoundNumber).subscribe(
            /* happy path */ gamesRes => {
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
