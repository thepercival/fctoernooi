import { Component, Input, OnInit } from '@angular/core';
import { IconName, IconPrefix } from '@fortawesome/fontawesome-svg-core';

@Component({
    selector: 'app-sport-icon-custom',
    templateUrl: './customicon.component.html',
    styleUrls: ['./customicon.component.scss']
})
export class SportIconCustomComponent implements OnInit {
    @Input() customId: TCustomSport | 0 = 0;
    public prefix!: IconPrefix;
    public iconName: IconName | undefined;

    constructor() {
    }

    ngOnInit() {
        this.prefix = this.getIconPrefix(this.customId);
        this.iconName = this.getIconName(this.customId);
    }

    protected getIconPrefix(customId: TCustomSport): IconPrefix {
        if (customId === TCustomSport.Darts
            || customId === TCustomSport.Tennis
            || customId === TCustomSport.Badminton
            || customId === TCustomSport.Squash
            || customId === TCustomSport.Padel
            || customId === TCustomSport.Hockey
            || customId === TCustomSport.Korfball) {
            return <IconPrefix>'fac';
        }
        return 'fas';
    }

    protected getIconName(customId: TCustomSport): IconName | undefined {
        switch (customId) {
            case TCustomSport.Baseball: { return 'baseball-ball'; }
            case TCustomSport.Basketball: { return 'basketball-ball'; }
            case TCustomSport.Badminton: { return <IconName>'badminton'; }
            case TCustomSport.Chess: { return 'chess'; }
            case TCustomSport.Darts: { return <IconName>'darts'; }
            case TCustomSport.ESports: { return 'gamepad'; }
            case TCustomSport.Football: { return 'futbol'; }
            case TCustomSport.Hockey: { return <IconName>'hockey'; }
            case TCustomSport.Korfball: { return <IconName>'korfball'; }
            case TCustomSport.Tennis:
            case TCustomSport.Padel: {
                return <IconName>'tennis-custom';
            }
            case TCustomSport.TableTennis: { return 'table-tennis'; }
            case TCustomSport.Squash: { return <IconName>'squash'; }
            case TCustomSport.Volleyball: { return 'volleyball-ball'; }
            case TCustomSport.IceHockey: { return 'hockey-puck'; }
        }
        return undefined;
    }
}

enum TCustomSport {
    Badminton = 1,
    Basketball,
    Darts,
    ESports,
    Hockey,
    Korfball,
    Chess,
    Squash,
    TableTennis,
    Tennis,
    Football,
    Volleyball,
    Baseball,
    IceHockey,
    Shuffleboard,
    Jass,
    Padel,
}