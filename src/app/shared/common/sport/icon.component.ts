import { Component, Input, OnInit } from '@angular/core';
import { SportConfig, SportCustom } from 'ngx-sport';

@Component({
    selector: 'app-sport-icon',
    templateUrl: './icon.component.html',
    styleUrls: ['./icon.component.scss']
})
export class SportIconComponent implements OnInit {
    @Input() configs: SportConfig[];
    @Input() customId: number;

    public show = false;
    public prefix: string;
    public class: string;

    constructor() {

    }

    ngOnInit() {
        let customId;
        if (this.customId !== undefined) {
            customId = this.customId;
        } else if (this.configs !== undefined && this.configs.length === 1) {
            customId = this.configs[0].getSport().getCustomId();
        }
        this.prefix = this.getIconPrefix(customId);
        this.class = this.getIconClass(customId);
        this.show = this.class !== undefined;
    }

    protected getIconPrefix(customId: number): string {
        if (customId === SportCustom.Darts || customId === SportCustom.Tennis || customId === SportCustom.Badminton
            || customId === SportCustom.Hockey || customId === SportCustom.Squash || customId === SportCustom.Korfball) {
            return 'fac';
        }
        return 'fas';
    }

    protected getIconClass(customId: number): string {
        if (customId === SportCustom.Baseball) {
            return 'baseball-ball';
        } else if (customId === SportCustom.Basketball) {
            return 'basketball-ball';
        } else if (customId === SportCustom.Badminton) {
            return 'badminton';
        } else if (customId === SportCustom.Chess) {
            return 'chess';
        } else if (customId === SportCustom.Darts) {
            return 'darts';
        } else if (customId === SportCustom.ESports) {
            return 'gamepad';
        } else if (customId === SportCustom.Football) {
            return 'futbol';
        } else if (customId === SportCustom.Hockey) {
            return 'hockey';
        } else if (customId === SportCustom.Korfball) {
            return 'korfball';
        } else if (customId === SportCustom.Squash) {
            return 'squash';
        } else if (customId === SportCustom.TableTennis) {
            return 'table-tennis';
        } else if (customId === SportCustom.Tennis) {
            return 'tennis-custom';
        } else if (customId === SportCustom.Volleyball) {
            return 'volleyball-ball';
        } else if (customId === SportCustom.IceHockey) {
            return 'hockey-puck';
        }
        return undefined;
    }
}