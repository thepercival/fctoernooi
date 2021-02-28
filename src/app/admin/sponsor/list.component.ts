import { Component, OnInit, TemplateRef } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

import { Sponsor } from '../../lib/sponsor';
import { SponsorRepository } from '../../lib/sponsor/repository';
import { StructureRepository } from '../../lib/ngx-sport/structure/repository';
import { Tournament } from '../../lib/tournament';
import { TournamentRepository } from '../../lib/tournament/repository';
import { TournamentComponent } from '../../shared/tournament/component';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { InfoModalComponent } from '../../shared/tournament/infomodal/infomodal.component';
import { SponsorScreensCreator } from '../../lib/liveboard/screenCreator/sponsors';


@Component({
  selector: 'app-tournament-sponsor',
  templateUrl: './list.component.html',
  styleUrls: ['./list.component.scss']
})
export class SponsorListComponent extends TournamentComponent implements OnInit {
  sponsors: Sponsor[] = [];
  sponsorScreensCreator!: SponsorScreensCreator;

  constructor(
    route: ActivatedRoute,
    router: Router,
    private modalService: NgbModal,
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
    this.sponsorScreensCreator = new SponsorScreensCreator();
    this.processing = false;
  }

  openHelpModal(modalContent: TemplateRef<any>) {
    const activeModal = this.modalService.open(InfoModalComponent, { windowClass: 'info-modal' });
    activeModal.componentInstance.header = 'uitleg sponsoren';
    activeModal.componentInstance.modalContent = modalContent;
    activeModal.componentInstance.noHeaderBorder = true;
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
    this.router.navigate(['/admin/sponsor', tournament.getId(), sponsor ? sponsor.getId() : 0]);
  }

  removeSponsor(sponsor: Sponsor) {
    this.setAlert('info', 'de sponsor wordt verwijderd');
    this.processing = true;

    this.sponsorRepository.removeObject(sponsor, this.tournament)
      .subscribe(
        /* happy path */ sponsorRes => {
          this.setAlert('success', 'de sponsor is verwijderd');
        },
        /* error path */ e => { this.setAlert('danger', e); this.processing = false; },
        /* onComplete */() => { this.processing = false; }
      );
  }
}
