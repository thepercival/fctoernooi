import { Component, Input, OnInit } from '@angular/core';
import { IconName, IconPrefix } from '@fortawesome/fontawesome-svg-core';
import { CompetitionSport } from 'ngx-sport';
import { CustomSportId } from '../../../lib/ngx-sport/sport/custom';

@Component({
    selector: 'app-sport-icon',
    templateUrl: './icon.component.html',
    styleUrls: ['./icon.component.scss']
})
export class SportIconComponent implements OnInit {
    @Input() competitionSports: CompetitionSport[] | undefined;
    @Input() customId: CustomSportId | 0 = 0;

    public prefix!: IconPrefix;
    public iconName: IconName | undefined;

    constructor() {

    }

    ngOnInit() {
        const customId = this.getCustomIdFromInput();
        this.prefix = this.getIconPrefix(customId);
        this.iconName = this.getIconName(customId);
    }

    getCustomIdFromInput(): CustomSportId {
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

    protected getIconPrefix(customId: CustomSportId): IconPrefix {
        if (customId === CustomSportId.Darts
            || customId === CustomSportId.Tennis
            || customId === CustomSportId.Badminton
            || customId === CustomSportId.Squash
            || customId === CustomSportId.Padel
            || customId === CustomSportId.Hockey
            || customId === CustomSportId.Korfball
            || customId === CustomSportId.Rugby) {
            return <IconPrefix>'fac';
        }
        return 'fas';
    }

    protected getIconName(customId: CustomSportId): IconName | undefined {
        switch (customId) {
            case CustomSportId.Baseball: { return 'baseball-ball'; }
            case CustomSportId.Basketball: { return 'basketball-ball'; }
            case CustomSportId.Badminton: { return <IconName>'badminton'; }
            case CustomSportId.Chess: { return 'chess'; }
            case CustomSportId.Darts: { return <IconName>'darts'; }
            case CustomSportId.ESports: { return 'gamepad'; }
            case CustomSportId.Football: { return 'futbol'; }
            case CustomSportId.Hockey: { return <IconName>'hockey'; }
            case CustomSportId.Korfball: { return <IconName>'korfball'; }
            case CustomSportId.Tennis:
            case CustomSportId.Padel: {
                return <IconName>'tennis-custom';
            }
            case CustomSportId.TableTennis: { return 'table-tennis'; }
            case CustomSportId.Squash: { return <IconName>'squash'; }
            case CustomSportId.Volleyball: { return 'volleyball-ball'; }
            case CustomSportId.IceHockey: { return 'hockey-puck'; }
            case CustomSportId.Rugby: { return <IconName>'rugby'; }
        }
        return undefined;
    }
}