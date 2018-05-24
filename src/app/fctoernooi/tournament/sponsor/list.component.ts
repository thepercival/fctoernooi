import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { StructureRepository } from 'ngx-sport';

import { IAlert } from '../../../app.definitions';
import { Tournament } from '../../tournament';
import { TournamentComponent } from '../component';
import { TournamentRepository } from '../repository';
import { Sponsor } from '../sponsor';
import { SponsorRepository } from '../sponsor/repository';


@Component({
  selector: 'app-tournament-sponsor',
  templateUrl: './list.component.html',
  styles: ['./list.component.scss']
})
export class SponsorListComponent extends TournamentComponent implements OnInit {
  infoAlert = true;
  alert: IAlert;
  processing = true;
  sponsors: Sponsor[];

  validations: any = {
    'minlengthname': Sponsor.MIN_LENGTH_NAME,
    'maxlengthname': Sponsor.MAX_LENGTH_NAME,
    'maxlengthurl': Sponsor.MAX_LENGTH_URL
  };

  constructor(
    route: ActivatedRoute,
    router: Router,
    tournamentRepository: TournamentRepository,
    sructureRepository: StructureRepository,
    private sponsorRepository: SponsorRepository
  ) {
    super(route, router, tournamentRepository, sructureRepository);
  }

  ngOnInit() {
    super.myNgOnInit(() => this.initSponsors());
  }

  initSponsors() {
    this.createSponsorsList();
    this.processing = false;
  }

  createSponsorsList() {
    this.sponsors = this.tournament.getSponsors();
  }

  addSponsor() {
    this.linkToEdit(this.tournament);
  }

  editSponsor(sponsor: Sponsor) {
    this.linkToEdit(this.tournament, sponsor);
  }

  linkToEdit(tournament: Tournament, sponsor?: Sponsor) {
    this.router.navigate(
      ['/toernooi/sponsoredit', tournament.getId(), sponsor ? sponsor.getId() : 0],
      {
        queryParams: {
          returnAction: '/toernooi/sponsors',
          returnParam: tournament.getId()
        }
      }
    );
  }

  removeSponsor(sponsor: Sponsor) {
    this.setAlert('info', 'sponsor verwijderen..');
    this.processing = true;

    this.sponsorRepository.removeObject(sponsor, this.tournament)
      .subscribe(
        /* happy path */ sponsorRes => {
          const index = this.sponsors.indexOf(sponsor);
          if (index > -1) {
            this.sponsors.splice(index, 1);
          }
        },
        /* error path */ e => { this.setAlert('danger', e); this.processing = false; },
        /* onComplete */() => { this.resetAlert(); this.processing = false; }
      );
  }

  protected setAlert(type: string, message: string) {
    this.alert = { 'type': type, 'message': message };
  }

  protected resetAlert(): void {
    this.alert = undefined;
  }
}
