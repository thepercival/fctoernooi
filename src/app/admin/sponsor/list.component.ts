import { Component, inject, OnInit, TemplateRef } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';

import { Sponsor } from '../../lib/sponsor';
import { SponsorRepository } from '../../lib/sponsor/repository';
import { StructureRepository } from '../../lib/ngx-sport/structure/repository';
import { Tournament } from '../../lib/tournament';
import { TournamentRepository } from '../../lib/tournament/repository';
import { TournamentComponent } from '../../shared/tournament/component';
import { NgbAlert, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { InfoModalComponent } from '../../shared/tournament/infomodal/infomodal.component';
import { SponsorScreensCreator } from '../../lib/liveboard/screenCreator/sponsors';
import { IAlertType } from '../../shared/common/alert';
import { ScreenConfigName } from '../../lib/liveboard/screenConfig/name';
import { ScreenConfig } from '../../lib/liveboard/screenConfig/json';
import { SponsorMapper } from '../../lib/sponsor/mapper';
import { GlobalEventsManager } from '../../shared/common/eventmanager';
import { TournamentNavBarComponent } from '../../shared/tournament/tournamentNavBar/tournamentNavBar.component';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faInfoCircle, faMoneyBillAlt, faSpinner } from '@fortawesome/free-solid-svg-icons';


@Component({
    selector: 'app-tournament-sponsor',
    templateUrl: './list.component.html',
    styleUrls: ['./list.component.scss'],
    standalone: true,
    imports: [TournamentNavBarComponent, FontAwesomeModule, NgbAlert, RouterLink]
})
export class SponsorListComponent extends TournamentComponent implements OnInit {
  faSpinner = faSpinner;
  faMoneyBillAlt = faMoneyBillAlt;
  faInfoCircle = faInfoCircle;
  sponsors: Sponsor[] = [];
  sponsorScreensCreator!: SponsorScreensCreator;
  public screenConfig: ScreenConfig;
  public hasSomeSponsorAnImage: boolean = false;  

  constructor(
    route: ActivatedRoute,
    router: Router,
    tournamentRepository: TournamentRepository,
    sructureRepository: StructureRepository,
    globalEventsManager: GlobalEventsManager,    
    public sponsorRepository: SponsorRepository,
    private sponsorMapper: SponsorMapper
  ) {
    super(route, router, tournamentRepository, sructureRepository, globalEventsManager);
    this.screenConfig = this.sponsorMapper.getDefaultScreenConfig();
  }

  ngOnInit() {
    super.myNgOnInit(() => this.initSponsors());
  }

  initSponsors() {
    this.createSponsorsList(); // sets this.sponsors
    this.hasSomeSponsorAnImage = this.sponsorRepository.hasSomeLogo(this.sponsors);
    this.sponsorScreensCreator = new SponsorScreensCreator(this.screenConfig);
    this.processing.set(false);
  }

  openHelpModal(modalContent: TemplateRef<any>) {
    const activeModal = this.modalService.open(InfoModalComponent, { windowClass: 'info-modal' });
      activeModal.componentInstance.header = () => 'uitleg sponsoren';
      activeModal.componentInstance.modalContent = () => modalContent;
      activeModal.componentInstance.noHeaderBorder = () => true;
  }

  createSponsorsList() {
    this.sponsors = this.tournament.getSponsors().sort((s1: Sponsor, s2: Sponsor) => {
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
    this.alert.set({ type: IAlertType.Info, message: 'de sponsor wordt verwijderd' });
    this.processing.set(true);

    this.sponsorRepository.removeObject(sponsor, this.tournament)
      .subscribe({
        next: () => {
          this.alert.set({ type: IAlertType.Success, message: 'de sponsor is verwijderd' });
        },
        error: (e) => {
          this.alert.set({ type: IAlertType.Danger, message: e }); this.processing.set(false);
        },
        complete: () => this.processing.set(false)
      });
  }
}
