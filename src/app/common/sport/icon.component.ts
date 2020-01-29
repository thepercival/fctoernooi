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
    public type: string;
    public class: string;

    constructor() {

    }

    ngOnInit() {
        if (this.customId !== undefined) {
            this.type = this.getIconType(this.customId);
            this.class = this.getIconClass(this.customId);
        } else if (this.configs !== undefined && this.configs.length === 1) {
            this.type = this.getIconType(this.configs[0].getSport().getCustomId());
            this.class = this.getIconClass(this.configs[0].getSport().getCustomId());
        }
        this.show = this.class !== undefined;
    }

    protected getIconClass(customId: number): string {
        if (customId === SportCustom.Basketball) {
            return 'basketball-ball';
        } else if (customId === SportCustom.Badminton) {
            return 'fi flaticon-badminton';
        } else if (customId === SportCustom.Chess) {
            return 'chess';
        } else if (customId === SportCustom.Darts) {
            return 'fi flaticon-darts';
        } else if (customId === SportCustom.ESports) {
            return 'gamepad';
        } else if (customId === SportCustom.Football) {
            return 'futbol';
        } else if (customId === SportCustom.Hockey) {
            return 'fi flaticon-hockey';
        } else if (customId === SportCustom.Squash) {
            return 'fi flaticon-squash';
        } else if (customId === SportCustom.TableTennis) {
            return 'table-tennis';
        } else if (customId === SportCustom.Tennis) {
            return 'fi flaticon-tennis';
        } else if (customId === SportCustom.Volleyball) {
            return 'volleyball-ball';
        }
        return undefined;
    }

    protected getIconType(customId: number): string {
        if (customId < 1 || customId === SportCustom.Korfball) {
            return undefined;
        }
        if (customId === SportCustom.Football || customId === SportCustom.TableTennis || customId === SportCustom.Basketball
            || customId === SportCustom.Chess || customId === SportCustom.ESports || customId === SportCustom.Volleyball) {
            return 'fa';
        }
        return 'fi';
    }
}