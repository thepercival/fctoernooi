import { Component, OnInit, Input, TemplateRef } from '@angular/core';

import { Poule, Round, GameState, CompetitionSport, StructureNameService } from 'ngx-sport';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { Favorites } from '../../../lib/favorites';
import { CSSService } from '../../common/cssservice';
import { InfoModalComponent } from '../infomodal/infomodal.component';

@Component({
    selector: 'app-tournament-ranking-round',
    templateUrl: './round.component.html',
    styleUrls: ['./round.component.scss']
})
export class RankingRoundComponent implements OnInit {
    @Input() round!: Round;
    @Input() structureNameService!: StructureNameService;
    @Input() competitionSports!: CompetitionSport[];
    @Input() favorites: Favorites | undefined;
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
        this.poules = this.round.getPoules();
        // const structureCell = this.round.getStructureCell();
        const state = this.round.getGamesState();
        const stateParent = this.round.getParentQualifyGroup()?.getParentRound().getGamesState();
        const childeren = this.round.getChildren();
        const stateChildren = this.getRoundsGameState(childeren);
        const childNeedsRanking = this.roundsNeedRanking(childeren);
        if (state === GameState.InProgress) {
            this.collapsed = false;
        } else if (state === GameState.Created && (stateParent === undefined || stateParent === GameState.Finished)) {
            this.collapsed = false;
        } else if (state === GameState.Finished && (stateChildren === undefined || stateChildren === GameState.Created || !childNeedsRanking)) {
            this.collapsed = false;
        }
    }

    getRoundsGameState(rounds: Round[]): GameState {
        if (rounds.every((round: Round) => round.getGamesState() === GameState.Finished)) {
            return GameState.Finished;
        } else if (rounds.some((round: Round) => round.getGamesState() !== GameState.Created)) {
            return GameState.InProgress;
        }
        return GameState.Created;
    }

    roundsNeedRanking(rounds: Round[]): boolean {
        return rounds.some((round: Round) => round.needsRanking());
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
