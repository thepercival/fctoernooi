import { Injectable } from '@angular/core';
import { Place, QualifyGroup, Round, SportConfig } from 'ngx-sport';

@Injectable()
export class CSSService {
    getIcon(sportName: string): string {
        if (sportName === SportConfig.Basketball) {
            return 'basketball-ball';
        } else if (sportName === SportConfig.Badminton) {
            return 'fi flaticon-badminton';
        } else if (sportName === SportConfig.Chess) {
            return 'chess';
        } else if (sportName === SportConfig.Darts) {
            return 'fi flaticon-darts';
        } else if (sportName === SportConfig.ESports) {
            return 'gamepad';
        } else if (sportName === SportConfig.Football) {
            return 'futbol';
        } else if (sportName === SportConfig.Hockey) {
            return 'fi flaticon-hockey';
        } else if (sportName === SportConfig.Squash) {
            return 'fi flaticon-squash';
        } else if (sportName === SportConfig.TableTennis) {
            return 'table-tennis';
        } else if (sportName === SportConfig.Tennis) {
            return 'fi flaticon-tennis';
        } else if (sportName === SportConfig.Volleyball) {
            return 'volleyball-ball';
        }
        return undefined;
    }

    getIconType(sportName: string): string {
        if (sportName === SportConfig.Football || sportName === SportConfig.TableTennis || sportName === SportConfig.Basketball
            || sportName === SportConfig.Chess || sportName === SportConfig.ESports || sportName === SportConfig.Volleyball) {
            return 'fa';
        }
        return 'fi';
    }

    getQualifyPlace(place: Place): string {
        const horizontalPouleWinners = place.getHorizontalPoule(QualifyGroup.WINNERS);
        const qualifyGroupWinners: QualifyGroup = horizontalPouleWinners.getQualifyGroup();
        const qualifyGroupLosers: QualifyGroup = place.getHorizontalPoule(QualifyGroup.LOSERS).getQualifyGroup();
        if (!qualifyGroupWinners && !qualifyGroupLosers) {
            return "";
        }
        if (qualifyGroupWinners && !qualifyGroupLosers) {
            const classes = (qualifyGroupWinners.getNrOfToPlacesShort() > 0 && horizontalPouleWinners.isBorderPoule() ? 'q-partial' : '')
            return classes + ' q-w-' + qualifyGroupWinners.getNumber();
        }
        if (qualifyGroupLosers && !qualifyGroupWinners) {
            const classes = (qualifyGroupLosers.getNrOfToPlacesShort() > 0 ? 'q-partial' : '')
            return classes + ' q-l-' + qualifyGroupLosers.getNumber();
        }
        console.error('make css combination');
        return "";
    }

    getQualifyRound(round: Round): string {
        const qualifyGroup: QualifyGroup = round.getParentQualifyGroup();
        if (qualifyGroup === undefined) {
            return '';
        }
        return ' q-' + (qualifyGroup.getWinnersOrLosers() === QualifyGroup.WINNERS ? 'w' : 'l') + '-' + qualifyGroup.getNumber();
    }

    getWinnersOrLosers(winnersOrLosers: number): string {
        return winnersOrLosers === QualifyGroup.WINNERS ? 'success' : (winnersOrLosers === QualifyGroup.LOSERS ? 'danger' : '');
    }
}