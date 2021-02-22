import { Component, Input, OnInit } from '@angular/core';
import { IconName, IconPrefix } from '@fortawesome/fontawesome-svg-core';

@Component({
    selector: 'app-sport-icon-custom',
    templateUrl: './customicon.component.html',
    styleUrls: ['./customicon.component.scss']
})
export class SportIconCustomComponent implements OnInit {
    @Input() customId: number = 0;
    public prefix!: IconPrefix;
    public iconName: IconName | undefined;

    constructor() {
    }

    ngOnInit() {
        this.prefix = this.getIconPrefix(this.customId);
        this.iconName = this.getIconName(this.customId);
    }

    // copied from SportCustom
    protected Badminton = 1;
    protected Basketball = 2;
    protected Darts = 3;
    protected ESports = 4;
    protected Hockey = 5;
    protected Korfball = 6;
    protected Chess = 7;
    protected Squash = 8;
    protected TableTennis = 9;
    protected Tennis = 10;
    protected Football = 11;
    protected Volleyball = 12;
    protected Baseball = 13;
    protected IceHockey = 14;

    protected getIconPrefix(customId: number): IconPrefix {
        if (customId === this.Darts || customId === this.Tennis || customId === this.Badminton
            || customId === this.Hockey || customId === this.Squash || customId === this.Korfball) {
            return <IconPrefix>'fac';
        }
        return 'fas';
    }

    protected getIconName(customId: number): IconName | undefined {
        if (customId === this.Baseball) {
            return 'baseball-ball';
        } else if (customId === this.Basketball) {
            return 'basketball-ball';
        } else if (customId === this.Badminton) {
            return <IconName>'badminton';
        } else if (customId === this.Chess) {
            return 'chess';
        } else if (customId === this.Darts) {
            return <IconName>'darts';
        } else if (customId === this.ESports) {
            return 'gamepad';
        } else if (customId === this.Football) {
            return 'futbol';
        } else if (customId === this.Hockey) {
            return <IconName>'hockey';
        } else if (customId === this.Korfball) {
            return <IconName>'korfball';
        } else if (customId === this.Squash) {
            return <IconName>'squash';
        } else if (customId === this.TableTennis) {
            return 'table-tennis';
        } else if (customId === this.Tennis) {
            return <IconName>'tennis-custom';
        } else if (customId === this.Volleyball) {
            return 'volleyball-ball';
        } else if (customId === this.IceHockey) {
            return 'hockey-puck';
        }
        return undefined;
    }
}