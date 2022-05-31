import { Component, OnInit, Input, TemplateRef } from '@angular/core';

import { Poule, Round, GameState, CompetitionSport, StructureNameService } from 'ngx-sport';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { InfoModalComponent } from '../../shared/tournament/infomodal/infomodal.component';
import { CSSService } from '../../shared/common/cssservice';
import { Favorites } from '../../lib/favorites';

@Component({
    selector: 'app-tournament-ranking-round',
    templateUrl: './round.component.html',
    styleUrls: ['./round.component.scss']
})
export class RankingRoundComponent implements OnInit {
    @Input() round!: Round;
    @Input() structureNameService!: StructureNameService;
    @Input() competitionSports!: CompetitionSport[];
    @Input() favorites!: Favorites;
    @Input() first: boolean = true;
    public collapsed: boolean = true;
    public poules: Poule[] = [];
    // public gameMode!: GameMode;

    constructor(
        public cssService: CSSService,
        private modalService: NgbModal
    ) {
    }

    ngOnInit() {
        console.log('round CDK', this.poules.length);
        this.poules = this.round.getPoules().filter((poule: Poule) => poule.needsRanking());
        const roundNumber = this.round.getNumber();
        const state = this.round.getGamesState();
        const statePrevious = roundNumber.getPrevious()?.getGamesState();
        const nextRoundNumber = roundNumber.getNext();
        const stateNext = nextRoundNumber?.getGamesState();
        const nextNeedsRanking = nextRoundNumber?.needsRanking() ?? false;
        if (state === GameState.InProgress) {
            this.collapsed = false;
        } else if (state === GameState.Created && (statePrevious === undefined || statePrevious === GameState.Finished)) {
            this.collapsed = false;
        } else if (state === GameState.Finished && (stateNext === undefined || stateNext === GameState.Created || !nextNeedsRanking)) {
            this.collapsed = false;
        }
    }

    openInfoModal(modalContent: TemplateRef<any>) {
        const activeModal = this.modalService.open(InfoModalComponent, { windowClass: 'info-modal' });
        activeModal.componentInstance.header = 'puntentelling';
        activeModal.componentInstance.noHeaderBorder = true;
        activeModal.componentInstance.modalContent = modalContent;
    }

    // getCompetitionSport(): CompetitionSport | undefined {
    //     const competition = this.tournament.getCompetition();
    //     return competition.hasMultipleSports() ? undefined : competition.getSingleSport();
    // }
    // get Against(): GameMode { return GameMode.Against; }
    // get Together(): GameMode { return GameMode.Together; }

    getCollapseDegrees(): 90 | 180 | 270 | undefined {
        return this.collapsed ? undefined : 90;
    }
}
