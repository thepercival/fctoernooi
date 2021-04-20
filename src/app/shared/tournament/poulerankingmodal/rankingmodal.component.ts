import { Component, OnInit, TemplateRef } from '@angular/core';
import { NgbActiveModal, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { Poule, NameService, GameMode, CompetitorMap } from 'ngx-sport';
import { Favorites } from '../../../lib/favorites';
import { FavoritesRepository } from '../../../lib/favorites/repository';
import { Tournament } from '../../../lib/tournament';
import { InfoModalComponent } from '../infomodal/infomodal.component';

@Component({
    selector: 'app-ngbd-modal-poule-ranking',
    templateUrl: './rankingmodal.component.html',
    styleUrls: ['./rankingmodal.component.scss']
})
export class PouleRankingModalComponent implements OnInit {
    public poule!: Poule;
    public tournament!: Tournament;
    public gameMode!: GameMode;
    public activeTab = 1;
    public nameService!: NameService;
    public favorites!: Favorites;
    public competitorMap!: CompetitorMap;
    // public rankingService!: RankingService;

    constructor(
        public favRepos: FavoritesRepository,
        private modalService: NgbModal,
        public activeModal: NgbActiveModal) {
    }

    ngOnInit() {
        this.favorites = this.favRepos.getObject(this.tournament);
        this.competitorMap = new CompetitorMap(this.tournament.getCompetitors());
        this.nameService = new NameService(this.competitorMap);
        // this.gameMode = this.poule.getRound().getNumber().getValidPlanningConfig().getGameMode();
        // this.rankingService = new RankingService(this.gameMode, this.tournament.getCompetition().getRankingRuleSet());
    }

    // get Against(): GameMode { return GameMode.Against; }    

    getHeader(): string {
        const header = this.nameService.getPouleName(this.poule, true);
        return this.gameMode !== GameMode.Against ? header + ' - stand' : header;
    }

    openInfoModal(header: string, modalContent: TemplateRef<any>) {
        const activeModal = this.modalService.open(InfoModalComponent, { windowClass: 'info-modal' });
        activeModal.componentInstance.header = header;
        activeModal.componentInstance.noHeaderBorder = true;
        activeModal.componentInstance.modalContent = modalContent;
    }
}
