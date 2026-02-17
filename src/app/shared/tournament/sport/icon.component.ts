import { ChangeDetectionStrategy, Component, OnInit, input } from '@angular/core';
import { IconName, IconPrefix } from '@fortawesome/fontawesome-svg-core';
import { CompetitionSport } from 'ngx-sport';
import { CustomSportId } from '../../../lib/ngx-sport/sport/custom';
import { TOURNAMENT_UI_IMPORTS } from '../tournament.ui-imports';

@Component({
    selector: 'app-sport-icon',
    templateUrl: './icon.component.html',
    styleUrls: ['./icon.component.scss'],
    standalone: true,
    imports: [TOURNAMENT_UI_IMPORTS],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class SportIconComponent implements OnInit {
    readonly _competitionSports = input<CompetitionSport[] | undefined>(undefined);
    readonly _customId = input<CustomSportId | 0>(0);

    public prefix!: IconPrefix;
    public iconName: IconName | undefined;

    constructor() {

    }

    ngOnInit() {
        const customId = this.getCustomIdFromInput();
        if (customId !== 0 ) {
            this.prefix = this.getIconPrefix(customId);
            this.iconName = this.getIconName(customId);
        }
    }

    get competitionSports(): CompetitionSport[] | undefined {
        return this._competitionSports();
    }

    get customId(): CustomSportId | 0 {
        return this._customId();
    }

    getCustomIdFromInput(): CustomSportId | 0{
        if (this.customId && this.customId > 0) {
            return this.customId;
        }
        if (this.competitionSports === undefined) {
            return 0;
        }
        if (this.competitionSports.length === 1) {
            const competitionSport = this.competitionSports[0];
            return competitionSport !== undefined ? competitionSport.getSport().getCustomId() : 0;
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