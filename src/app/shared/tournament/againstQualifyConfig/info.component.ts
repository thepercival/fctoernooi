import { Component, Input } from '@angular/core';

import { Round } from 'ngx-sport';

@Component({
    selector: 'app-qualifyagainstconfig-info',
    templateUrl: './info.component.html',
    styleUrls: ['./info.component.scss']
})
export class AgainstQualifyInfoComponent {
    @Input() round!: Round;
    constructor() { }
}
