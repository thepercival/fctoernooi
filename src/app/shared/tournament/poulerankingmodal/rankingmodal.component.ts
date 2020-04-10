import { Component } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { Poule, NameService, RankingService } from 'ngx-sport';
import { Tournament } from '../../../lib/tournament';

@Component({
    selector: 'app-ngbd-modal-poule-ranking',
    templateUrl: './rankingmodal.component.html',
    styleUrls: ['./rankingmodal.component.scss']
})
export class PouleRankingModalComponent {
    poule: Poule;
    tournament: Tournament;
    activeTab = 1;
    constructor(public nameService: NameService, public activeModal: NgbActiveModal) { }
}
