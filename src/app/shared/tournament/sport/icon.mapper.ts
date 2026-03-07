import { IconDefinition } from '@fortawesome/fontawesome-svg-core';
import {
    faBaseballBall,
    faBasketballBall,
    faChess,
    faFutbol,
    faGamepad,
    faHockeyPuck,
    faTableTennis,
    faVolleyballBall,
} from '@fortawesome/free-solid-svg-icons';
import { CustomSportId } from '../../../lib/ngx-sport/sport/custom';
import {
    facBadminton,
    facDarts,
    facHockey,
    facKorfball,
    facRugby,
    facSquash,
    facTennis,
} from '../../customicons';


export function getSportIconDef(customId: CustomSportId): IconDefinition | undefined {
    switch (customId) {
        case CustomSportId.Baseball: { return faBaseballBall; }
        case CustomSportId.Basketball: { return faBasketballBall; }
        case CustomSportId.Badminton: { return facBadminton; }
        case CustomSportId.Chess: { return faChess; }
        case CustomSportId.Darts: { return facDarts; }
        case CustomSportId.ESports: { return faGamepad; }
        case CustomSportId.Football: { return faFutbol; }
        case CustomSportId.Hockey: { return facHockey; }
        case CustomSportId.Korfball: { return facKorfball; }
        case CustomSportId.Tennis:
        case CustomSportId.Padel: {
            return facTennis;
        }
        case CustomSportId.TableTennis: { return faTableTennis; }
        case CustomSportId.Squash: { return facSquash; }
        case CustomSportId.Volleyball: { return faVolleyballBall; }
        case CustomSportId.IceHockey: { return faHockeyPuck; }
        case CustomSportId.Rugby: { return facRugby; }
    }
    return undefined;
}