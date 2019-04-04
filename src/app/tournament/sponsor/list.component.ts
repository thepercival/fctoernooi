import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { StructureRepository } from 'ngx-sport';

import { SponsorScreenService } from '../../lib/liveboard/screens';
import { Sponsor } from '../../lib/sponsor';
import { SponsorRepository } from '../../lib/sponsor/repository';
import { Tournament } from '../../lib/tournament';
import { TournamentRepository } from '../../lib/tournament/repository';
import { TournamentComponent } from '../component';


@Component({
  selector: 'app-tournament-sponsor',
  templateUrl: './list.component.html',
  styles: ['./list.component.scss']
})
export class SponsorListComponent extends TournamentComponent implements OnInit {
  sponsors: Sponsor[];
  sponsorScreenService: SponsorScreenService;

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
    this.sponsorScreenService = new SponsorScreenService(this.sponsors);
    this.processing = false;
  }

  createSponsorsList() {
    this.sponsors = this.tournament.getSponsors().sort((s1, s2) => {
      return (s1.getScreenNr() > s2.getScreenNr() ? 1 : -1);
    });
  }

  addSponsor() {
    this.linkToEdit(this.tournament);
  }

  editSponsor(sponsor: Sponsor) {
    this.linkToEdit(this.tournament, sponsor);
  }

  linkToEdit(tournament: Tournament, sponsor?: Sponsor) {
    this.router.navigate(['/toernooi/sponsoredit', tournament.getId(), sponsor ? sponsor.getId() : 0]);
  }

  removeSponsor(sponsor: Sponsor) {
    this.setAlert('info', 'de sponsor wordt verwijderd');
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
        /* onComplete */() => { this.setAlert('success', 'de sponsor is verwijderd'); this.processing = false; }
      );
  }
}
