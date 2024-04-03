import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';

import { Sponsor } from '../../lib/sponsor';
import { SponsorRepository } from '../../lib/sponsor/repository';

@Component({
    selector: 'app-tournament-liveboard-sponsors',
    templateUrl: './sponsors.liveboard.component.html',
    styleUrls: ['./sponsors.liveboard.component.scss']
})
export class LiveboardSponsorsComponent implements OnChanges {
    @Input() sponsors: Sponsor[] = [];
    nrOfColumns: number = 0;
    sponsorRows: Sponsor[][] = [];
    
    constructor(private sponsorRepository: SponsorRepository) {
        
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
            const sponsorRow: Sponsor[] = [];
            for (let colIt = 1; colIt <= this.nrOfColumns; colIt++) {
                const sponsor = this.sponsors.shift();
                if (sponsor) {
                    sponsorRow.push(sponsor);
                }
            }
            this.sponsorRows.push(sponsorRow);
        }
    }

    getSponsorLogoUrl(sponsor: Sponsor): string {
        return this.sponsorRepository.getLogoUrl(sponsor, 200);
    }
}
