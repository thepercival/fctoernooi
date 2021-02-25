import { Component, Input, OnInit } from '@angular/core';
import { IconName, IconPrefix } from '@fortawesome/fontawesome-svg-core';
import { CompetitionSport, SportCustom } from 'ngx-sport';

@Component({
    selector: 'app-sport-icon',
    templateUrl: './icon.component.html',
    styleUrls: ['./icon.component.scss']
})
export class SportIconComponent implements OnInit {
    @Input() competitionSports: CompetitionSport[] | undefined;
    @Input() customId: number | undefined;

    public prefix!: IconPrefix;
    public iconName: IconName | undefined;

    constructor() {

    }

    ngOnInit() {
        const customId = this.getCustomIdFromInput();
        this.prefix = this.getIconPrefix(customId);
        this.iconName = this.getIconName(customId);
    }

    getCustomIdFromInput(): number {
        if (this.customId && this.customId > 0) {
            return this.customId;
        }
        if (this.competitionSports === undefined) {
            return 0;
        }
        if (this.competitionSports.length === 1) {
            return this.competitionSports[0].getSport().getCustomId();
        }
        return 0;
    }

    protected getIconPrefix(customId: number): IconPrefix {
        if (customId === SportCustom.Darts || customId === SportCustom.Tennis || customId === SportCustom.Badminton
            || customId === SportCustom.Hockey || customId === SportCustom.Squash || customId === SportCustom.Korfball) {
            return <IconPrefix>'fac';
        }
        return 'fas';
    }

    protected getIconName(customId: number): IconName | undefined {
        if (customId === SportCustom.Baseball) {
            return 'baseball-ball';
        } else if (customId === SportCustom.Basketball) {
            return 'basketball-ball';
        } else if (customId === SportCustom.Badminton) {
            return <IconName>'badminton';
        } else if (customId === SportCustom.Chess) {
            return 'chess';
        } else if (customId === SportCustom.Darts) {
            return <IconName>'darts';
        } else if (customId === SportCustom.ESports) {
            return 'gamepad';
        } else if (customId === SportCustom.Football) {
            return 'futbol';
        } else if (customId === SportCustom.Hockey) {
            return <IconName>'hockey';
        } else if (customId === SportCustom.Korfball) {
            return <IconName>'korfball';
        } else if (customId === SportCustom.Squash) {
            return <IconName>'squash';
        } else if (customId === SportCustom.TableTennis) {
            return 'table-tennis';
        } else if (customId === SportCustom.Tennis) {
            return <IconName>'tennis-custom';
        } else if (customId === SportCustom.Volleyball) {
            return 'volleyball-ball';
        } else if (customId === SportCustom.IceHockey) {
            return 'hockey-puck';
        }
        return undefined;
    }
}