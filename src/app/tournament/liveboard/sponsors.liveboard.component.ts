import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { NameService } from 'ngx-sport';

import { Sponsor } from '../../lib/sponsor';

@Component({
    selector: 'app-tournament-liveboard-sponsors',
    templateUrl: './sponsors.liveboard.component.html',
    styleUrls: ['./sponsors.liveboard.component.scss']
})
export class LiveboardSponsorsComponent implements OnChanges {
    @Input() sponsors: Sponsor[];
    sponsorGroups: Sponsor[][];
    maxNrOfSponsorsPerGroup: number;
    viewHeight: number;

    constructor(
        public nameService: NameService
    ) {
        this.viewHeight = 90;
    }

    ngOnChanges(changes: SimpleChanges) {
        if (changes.sponsors !== undefined && changes.sponsors.currentValue !== changes.sponsors.previousValue) {
            this.sponsorGroups = [[]];
            const nrOfSponsors = this.sponsors.length;
            this.maxNrOfSponsorsPerGroup = nrOfSponsors < 3 ? 1 : (nrOfSponsors < 7 ? 2 : 3);
            this.sponsors.forEach(sponsor => {
                const sponsorGroup = this.getSponsorGroup();
                sponsorGroup.push(sponsor);
                this.sponsorGroups.push(sponsorGroup);
            });
            this.addDummies();
        }
    }

    private getSponsorGroup(): Sponsor[] {
        const sponsorGroup = this.sponsorGroups.pop();
        if (sponsorGroup.length === this.maxNrOfSponsorsPerGroup) {
            this.sponsorGroups.push(sponsorGroup);
            return [];
        }
        return sponsorGroup;
    }

    // aSponsorHasUrl(): boolean {
    //     return this.sponsors.some(sponsor => sponsor.getUrl() !== undefined && sponsor.getUrl().length > 0);
    // }

    private addDummies() {
        const sponsorGroup = this.sponsorGroups.pop();
        if (sponsorGroup.length < this.maxNrOfSponsorsPerGroup) {
            sponsorGroup.push(undefined);
        }
        if (sponsorGroup.length < this.maxNrOfSponsorsPerGroup) {
            sponsorGroup.unshift(undefined);
        }
        this.sponsorGroups.push(sponsorGroup);
    }

    getRowViewHeight() {
        return this.viewHeight / this.sponsorGroups.length;
    }

    getColumnViewWidth(sponsorGroup) {
        return Math.floor(100 / sponsorGroup.length);
    }

    getTitleFontSize() {
        return this.getRowViewHeight() * 0.1;
    }

    getFooterFontSize() {
        return this.getRowViewHeight() * 0.06;
    }
}