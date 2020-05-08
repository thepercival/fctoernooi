import { Component, Input, OnInit } from '@angular/core';

@Component({
    selector: 'app-sport-icon-custom',
    templateUrl: './customicon.component.html',
    styleUrls: ['./customicon.component.scss']
})
export class SportIconCustomComponent implements OnInit {
    @Input() customId: number;

    public show = false;
    public prefix: string;
    public class: string;

    constructor() {

    }

    ngOnInit() {
        this.prefix = this.getIconPrefix(this.customId);
        this.class = this.getIconClass(this.customId);
        this.show = this.class !== undefined;
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

    protected getIconPrefix(customId: number): string {
        if (customId === this.Darts || customId === this.Tennis || customId === this.Badminton
            || customId === this.Hockey || customId === this.Squash || customId === this.Korfball) {
            return 'fac';
        }
        return 'fas';
    }

    protected getIconClass(customId: number): string {
        if (customId === this.Baseball) {
            return 'baseball-ball';
        } else if (customId === this.Basketball) {
            return 'basketball-ball';
        } else if (customId === this.Badminton) {
            return 'badminton';
        } else if (customId === this.Chess) {
            return 'chess';
        } else if (customId === this.Darts) {
            return 'darts';
        } else if (customId === this.ESports) {
            return 'gamepad';
        } else if (customId === this.Football) {
            return 'futbol';
        } else if (customId === this.Hockey) {
            return 'hockey';
        } else if (customId === this.Korfball) {
            return 'korfball';
        } else if (customId === this.Squash) {
            return 'squash';
        } else if (customId === this.TableTennis) {
            return 'table-tennis';
        } else if (customId === this.Tennis) {
            return 'tennis-custom';
        } else if (customId === this.Volleyball) {
            return 'volleyball-ball';
        } else if (customId === this.IceHockey) {
            return 'hockey-puck';
        }
        return undefined;
    }
}