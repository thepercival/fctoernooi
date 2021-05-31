import { Component, OnInit, TemplateRef } from '@angular/core';
import { NgbActiveModal, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { Poule, NameService, CompetitorMap, CompetitionSport, AgainstSportVariant } from 'ngx-sport';
import { Tournament } from '../../../lib/tournament';
import { InfoModalComponent } from '../infomodal/infomodal.component';
@Component({
    selector: 'app-ngbd-modal-poule-ranking',
    templateUrl: './rankingmodal.component.html',
    styleUrls: ['./rankingmodal.component.scss']
})
export class PouleRankingModalComponent implements OnInit {
    public poule!: Poule;
    public competitionSport: CompetitionSport | undefined;
    public tournament!: Tournament;
    public activeTab = 1;
    public nameService!: NameService;
    public competitorMap!: CompetitorMap;
    // public rankingService!: RankingService;

    constructor(
        private modalService: NgbModal,
        public activeModal: NgbActiveModal) {
    }

    ngOnInit() {
        this.competitorMap = new CompetitorMap(this.tournament.getCompetitors());
        this.nameService = new NameService(this.competitorMap);
    }

    getHeader(): string {
        const header = this.nameService.getPouleName(this.poule, true);
        if (this.competitionSport === undefined) {
            return header + ' - stand';
        }
        return header + ' - ' + this.competitionSport.getSport().getName();
    }

    isAgainstSport(): boolean {
        return (this.competitionSport?.getVariant() instanceof AgainstSportVariant);
    }

    openInfoModal(header: string, modalContent: TemplateRef<any>) {
        const activeModal = this.modalService.open(InfoModalComponent, { windowClass: 'info-modal' });
        activeModal.componentInstance.header = header;
        activeModal.componentInstance.noHeaderBorder = true;
        activeModal.componentInstance.modalContent = modalContent;
    }
}
