import { Component } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { Poule, NameService, RankingService } from 'ngx-sport';
import { Tournament } from '../../lib/tournament';

@Component({
    selector: 'app-ngbd-modal-poule-ranking',
    templateUrl: './rankingmodal.component.html',
    styleUrls: ['./rankingmodal.component.scss']
})
export class PouleRankingModalComponent {
    poule: Poule;
    tournament: Tournament;
    active = 1;
    constructor(public nameService: NameService, public activeModal: NgbActiveModal) { }

    getDescriptionRankingRules(): string[] {
        const ruleSet = this.tournament.getCompetition().getRuleSet();
        const rankingService = new RankingService(undefined, ruleSet);
        return rankingService.getRuleDescriptions();
    }
}
