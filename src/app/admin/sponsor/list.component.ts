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
import { IAlertType } from '../../shared/common/alert';
import { ScreenConfigName } from '../../lib/liveboard/screenConfig/name';
import { ScreenConfig } from '../../lib/liveboard/screenConfig/json';
import { SponsorMapper } from '../../lib/sponsor/mapper';
import { GlobalEventsManager } from '../../shared/common/eventmanager';
import { FavoritesRepository } from '../../lib/favorites/repository';


@Component({
  selector: 'app-tournament-sponsor',
  templateUrl: './list.component.html',
  styleUrls: ['./list.component.scss']
})
export class SponsorListComponent extends TournamentComponent implements OnInit {
  sponsors: Sponsor[] = [];
  sponsorScreensCreator!: SponsorScreensCreator;
  public screenConfig: ScreenConfig;

  constructor(
    route: ActivatedRoute,
    router: Router,
    tournamentRepository: TournamentRepository,
    sructureRepository: StructureRepository,
    globalEventsManager: GlobalEventsManager,
    modalService: NgbModal,
    favRepository: FavoritesRepository,
    private sponsorRepository: SponsorRepository,
    private sponsorMapper: SponsorMapper
  ) {
    super(route, router, tournamentRepository, sructureRepository, globalEventsManager, modalService, favRepository);
    this.screenConfig = this.sponsorMapper.getDefaultScreenConfig();
  }

  ngOnInit() {
    super.myNgOnInit(() => this.initSponsors());
  }

  initSponsors() {
    this.createSponsorsList();
    this.sponsorScreensCreator = new SponsorScreensCreator(this.screenConfig);
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
    this.setAlert(IAlertType.Info, 'de sponsor wordt verwijderd');
    this.processing = true;

    this.sponsorRepository.removeObject(sponsor, this.tournament)
      .subscribe({
        next: () => {
          this.setAlert(IAlertType.Success, 'de sponsor is verwijderd');
        },
        error: (e) => {
          this.setAlert(IAlertType.Danger, e); this.processing = false;
        },
        complete: () => this.processing = false
      });
  }
}
