import { Component, Input } from '@angular/core';

import { RoundNumber } from 'ngx-sport';

@Component({
    selector: 'app-sportconfig-points-info',
    templateUrl: './info.component.html',
    styleUrls: ['./info.component.scss']
})
export class ScoreRulesComponent {
    @Input() roundNumber: RoundNumber;
    constructor() { }
}
