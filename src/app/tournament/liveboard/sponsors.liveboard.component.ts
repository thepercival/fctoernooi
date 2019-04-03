import { Component, Input, OnInit } from '@angular/core';
import { NameService } from 'ngx-sport';

import { Sponsor } from '../../lib/sponsor';

@Component({
    selector: 'app-tournament-liveboard-sponsors',
    templateUrl: './sponsors.liveboard.component.html',
    styleUrls: ['./sponsors.liveboard.component.scss']
})
export class TournamentLiveboardSponsorsComponent implements OnInit {
    @Input() sponsors: Sponsor[];
    sponsorGroups: Sponsor[][];
    maxNrOfSponsorsPerGroup: number;
    viewHeight: number;

    constructor(
        public nameService: NameService
    ) {
        this.viewHeight = 90;
    }

    ngOnInit() {
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

    getFontSizePercentage() {
        const fontSizePerc = (8 / this.sponsors.length) * 100;
        if (fontSizePerc > 150) {
            return 150;
        }
        return fontSizePerc;
    }
}