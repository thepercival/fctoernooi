import { Component, OnInit } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { Poule, NameService, GameMode } from 'ngx-sport';
import { Tournament } from '../../../lib/tournament';

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
    public nameService: NameService
    constructor(public activeModal: NgbActiveModal) {
        this.nameService = new NameService(undefined);
    }

    ngOnInit() {
        this.gameMode = this.poule.getRound().getNumber().getValidPlanningConfig().getGameMode();
    }

    get Against(): GameMode { return GameMode.Against; }
    get Together(): GameMode { return GameMode.Together; }

    getHeader(): string {
        const header = this.nameService.getPouleName(this.poule, true);
        return this.gameMode === GameMode.Together ? header + ' - stand' : header;
    }
}
