import { Component, OnInit, Input, TemplateRef } from '@angular/core';

import { Poule, State, NameService, GameMode, Round, CompetitorMap } from 'ngx-sport';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { InfoModalComponent } from '../../shared/tournament/infomodal/infomodal.component';
import { CSSService } from '../../shared/common/cssservice';
import { FavoritesRepository } from '../../lib/favorites/repository';
import { Favorites } from '../../lib/favorites';

@Component({
    selector: 'app-tournament-ranking-round',
    templateUrl: './round.component.html',
    styleUrls: ['./round.component.scss']
})
export class RankingRoundComponent implements OnInit {
    @Input() round!: Round;
    @Input() competitorMap!: CompetitorMap;
    @Input() favorites!: Favorites;
    @Input() first: boolean = true;
    public nameService!: NameService;
    public collapsed: boolean = true;
    public poules: Poule[] = [];
    // public gameMode!: GameMode;

    constructor(
        public favRepos: FavoritesRepository,
        public cssService: CSSService,
        private modalService: NgbModal
    ) {
    }

    ngOnInit() {
        this.poules = this.round.getPoules().filter((poule: Poule) => poule.needsRanking());
        const roundNumber = this.round.getNumber();
        // this.gameMode = roundNumber.getValidPlanningConfig().getGameMode();
        this.nameService = new NameService(undefined);
        const state = this.round.getState();
        const statePrevious = roundNumber.getPrevious()?.getState();
        const nextRoundNumber = roundNumber.getNext();
        const stateNext = nextRoundNumber?.getState();
        const nextNeedsRanking = nextRoundNumber?.needsRanking() ?? false;
        if (state === State.InProgress) {
            this.collapsed = false;
        } else if (state === State.Created && (statePrevious === undefined || statePrevious === State.Finished)) {
            this.collapsed = false;
        } else if (state === State.Finished && (stateNext === undefined || stateNext === State.Created || !nextNeedsRanking)) {
            this.collapsed = false;
        }
    }

    openInfoModal(modalContent: TemplateRef<any>) {
        const activeModal = this.modalService.open(InfoModalComponent, { windowClass: 'info-modal' });
        activeModal.componentInstance.header = 'puntentelling';
        activeModal.componentInstance.noHeaderBorder = true;
        activeModal.componentInstance.modalContent = modalContent;
    }

    get Against(): GameMode { return GameMode.Against; }
    get Together(): GameMode { return GameMode.Together; }

    getCollapseDegrees(): 90 | 180 | 270 | undefined {
        return this.collapsed ? undefined : 90;
    }
}
