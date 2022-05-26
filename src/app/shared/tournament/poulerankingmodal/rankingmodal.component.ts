import { Component, OnInit, TemplateRef } from '@angular/core';
import { NgbActiveModal, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { Poule, NameService, CompetitionSport, AgainstGpp, AgainstH2h, StructureNameService } from 'ngx-sport';
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
    public structureNameService!: StructureNameService;
    // public rankingService!: RankingService;

    constructor(
        private modalService: NgbModal,
        public activeModal: NgbActiveModal) {
    }

    ngOnInit() {
    }

    getHeader(): string {
        const header = this.structureNameService.getPouleName(this.poule, true);
        if (this.competitionSport === undefined) {
            return header + ' - stand';
        }
        return header + ' - ' + this.competitionSport.getSport().getName();
    }

    isAgainstSport(): boolean {
        return (this.competitionSport?.getVariant() instanceof AgainstH2h || this.competitionSport?.getVariant() instanceof AgainstGpp);
    }

    openInfoModal(modalContent: TemplateRef<any>) {

        let header = 'rangschikking';
        if (this.tournament.getCompetition().hasMultipleSports()) {
            header += '<small> per sport</small>';
        }
        const activeModal = this.modalService.open(InfoModalComponent, { windowClass: 'info-modal' });
        activeModal.componentInstance.header = header;
        activeModal.componentInstance.noHeaderBorder = true;
        activeModal.componentInstance.modalContent = modalContent;
    }
}
