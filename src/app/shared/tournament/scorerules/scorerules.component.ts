import { Component, Input } from '@angular/core';

import { RoundNumber } from 'ngx-sport';

@Component({
    selector: 'app-score-rules',
    templateUrl: './scorerules.component.html',
    styleUrls: ['./scorerules.component.scss']
})
export class ScoreRulesComponent {
    @Input() roundNumber: RoundNumber;
    constructor() { }
}
