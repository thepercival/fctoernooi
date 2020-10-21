import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';

import { Sponsor } from '../../lib/sponsor';

@Component({
    selector: 'app-tournament-liveboard-sponsors',
    templateUrl: './sponsors.liveboard.component.html',
    styleUrls: ['./sponsors.liveboard.component.scss']
})
export class LiveboardSponsorsComponent implements OnChanges {
    @Input() sponsors: Sponsor[];
    nrOfColumns: number;
    sponsorRows: Sponsor[][];
    viewHeight: number;

    constructor() {
        this.viewHeight = 90;
    }

    ngOnChanges(changes: SimpleChanges) {
        if (changes.sponsors !== undefined && changes.sponsors.currentValue !== changes.sponsors.previousValue) {
            this.initSponsorRows(this.sponsors.length);
        }
    }

    protected initSponsorRows(nrOfSponsors: number) {
        let nrOfRows;
        if (nrOfSponsors === 1) {
            nrOfRows = 1;
        } else if (nrOfSponsors <= 4) {
            nrOfRows = 2;
        } else {
            nrOfRows = 4;
        }
        this.nrOfColumns = nrOfRows;

        this.sponsorRows = [];
        for (let rowIt = 1; rowIt <= nrOfRows; rowIt++) {
            const sponsorRow = [];
            for (let colIt = 1; colIt <= this.nrOfColumns; colIt++) {
                sponsorRow.push(this.sponsors.shift());
            }
            this.sponsorRows.push(sponsorRow);
        }
    }
}
