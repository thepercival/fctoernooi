import { Component, Input, OnInit } from '@angular/core';
import { IconName, IconPrefix } from '@fortawesome/fontawesome-svg-core';
import { CompetitionSport, CustomSport } from 'ngx-sport';

@Component({
    selector: 'app-sport-icon',
    templateUrl: './icon.component.html',
    styleUrls: ['./icon.component.scss']
})
export class SportIconComponent implements OnInit {
    @Input() competitionSports: CompetitionSport[] | undefined;
    @Input() customId: CustomSport | 0 = 0;

    public prefix!: IconPrefix;
    public iconName: IconName | undefined;

    constructor() {

    }

    ngOnInit() {
        const customId = this.getCustomIdFromInput();
        this.prefix = this.getIconPrefix(customId);
        this.iconName = this.getIconName(customId);
    }

    getCustomIdFromInput(): CustomSport {
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

    protected getIconPrefix(customId: CustomSport): IconPrefix {
        if (customId === CustomSport.Darts
            || customId === CustomSport.Tennis
            || customId === CustomSport.Badminton
            || customId === CustomSport.Squash
            || customId === CustomSport.Padel
            || customId === CustomSport.Hockey
            || customId === CustomSport.Korfball) {
            return <IconPrefix>'fac';
        }
        return 'fas';
    }

    protected getIconName(customId: CustomSport): IconName | undefined {
        switch (customId) {
            case CustomSport.Baseball: { return 'baseball-ball'; }
            case CustomSport.Basketball: { return 'basketball-ball'; }
            case CustomSport.Badminton: { return <IconName>'badminton'; }
            case CustomSport.Chess: { return 'chess'; }
            case CustomSport.Darts: { return <IconName>'darts'; }
            case CustomSport.ESports: { return 'gamepad'; }
            case CustomSport.Football: { return 'futbol'; }
            case CustomSport.Hockey: { return <IconName>'hockey'; }
            case CustomSport.Korfball: { return <IconName>'korfball'; }
            case CustomSport.Tennis:
            case CustomSport.Padel: {
                return <IconName>'tennis-custom';
            }
            case CustomSport.TableTennis: { return 'table-tennis'; }
            case CustomSport.Squash: { return <IconName>'squash'; }
            case CustomSport.Volleyball: { return 'volleyball-ball'; }
            case CustomSport.IceHockey: { return 'hockey-puck'; }
        }
        return undefined;
    }
}