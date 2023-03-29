import { Component, OnInit, TemplateRef } from '@angular/core';
import { NgbActiveModal, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { Poule, NameService, CompetitionSport, AgainstGpp, AgainstH2h, StructureNameService } from 'ngx-sport';
import { Favorites } from '../../../lib/favorites';
import { InfoModalComponent } from '../infomodal/infomodal.component';
@Component({
    selector: 'app-ngbd-modal-poule-ranking',
    templateUrl: './rankingmodal.component.html',
    styleUrls: ['./rankingmodal.component.scss']
})
export class PouleRankingModalComponent {
    public poule!: Poule;
    public competitionSports!: CompetitionSport[];
    public favorites!: Favorites;
    // public tournament!: Tournament;
    public activeTab = 1;
    public nameService!: NameService;
    public structureNameService!: StructureNameService;
    // public rankingService!: RankingService;

    constructor(
        private modalService: NgbModal,
        public activeModal: NgbActiveModal) {
    }

    getHeader(): string {
        const header = this.structureNameService.getPouleName(this.poule, true);
        const singleCompetitionSport = this.getSingleCompetitionSport();
        if (singleCompetitionSport === undefined) {
            return header + ' - stand';
        }
        return header + ' - ' + singleCompetitionSport.getSport().getName();
    }

    openInfoModal(modalContent: TemplateRef<any>) {

        let header = 'rangschikking';
        if (this.competitionSports.length > 1) {
            header += '<small> per sport</small>';
        }
        const activeModal = this.modalService.open(InfoModalComponent, { windowClass: 'info-modal' });
        activeModal.componentInstance.header = header;
        activeModal.componentInstance.noHeaderBorder = true;
        activeModal.componentInstance.modalContent = modalContent;
    }

    get singleAgainstCompetitionSport(): CompetitionSport | undefined {
        const singleCompetitionSport = this.getSingleCompetitionSport();
        if (singleCompetitionSport === undefined || !this.isAgainst(singleCompetitionSport)) {
            return undefined;
        }
        return singleCompetitionSport;
    }

    // get singleTogetherCompetitionSport(): CompetitionSport | undefined {
    //     const singleCompetitionSport = this.getSingleCompetitionSport();
    //     if (singleCompetitionSport === undefined || !this.isTogether(singleCompetitionSport)) {
    //         return undefined;
    //     }
    //     return singleCompetitionSport;
    // }

    getSingleCompetitionSport(): CompetitionSport | undefined {
        return this.competitionSports.length === 1 ? this.competitionSports[0] : undefined;
    }

    isAgainst(competitionSport: CompetitionSport): boolean {
        return (competitionSport.getVariant() instanceof AgainstH2h) || (competitionSport.getVariant() instanceof AgainstGpp);
    }

    // isTogether(competitionSport: CompetitionSport): boolean {
    //     return (competitionSport?.getVariant() instanceof Single) || (competitionSport.getVariant() instanceof AllInOneGame);
    // }
}
