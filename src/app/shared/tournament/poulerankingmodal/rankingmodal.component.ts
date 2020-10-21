import { Component } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { Poule, NameService } from 'ngx-sport';
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
    public nameService: NameService
    constructor(public activeModal: NgbActiveModal) {
        this.nameService = new NameService(undefined);
    }
}
