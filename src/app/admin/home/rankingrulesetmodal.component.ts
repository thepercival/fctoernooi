import { Component, Input, OnInit } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { RankingRuleSet } from 'ngx-sport';
@Component({
    selector: 'app-ngbd-modal-rankingruleset',
    templateUrl: './rankingrulesetmodal.component.html',
    styleUrls: ['./rankingrulesetmodal.component.scss']
})
export class RankingRuleSetModalComponent implements OnInit {
    @Input() rankingRuleSet!: RankingRuleSet;

    constructor(public activeModal: NgbActiveModal) {
    }

    ngOnInit() {
    }

    updateRuleset() {
        if (this.rankingRuleSet === RankingRuleSet.WC) {
            this.rankingRuleSet = RankingRuleSet.EC;
        } else {
            this.rankingRuleSet = RankingRuleSet.WC;
        }
    }
}
