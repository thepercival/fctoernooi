import { Injectable } from '@angular/core';
import { PoulePlace, QualifyGroup, Round, SportConfig } from 'ngx-sport';

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

    getQualifyPlace(place: PoulePlace): string {
        const horizontalPouleWinners = place.getHorizontalPoule(QualifyGroup.WINNERS);
        const qualifyGroupWinners: QualifyGroup = horizontalPouleWinners.getQualifyGroup();
        const horizontalPouleLosers = place.getHorizontalPoule(QualifyGroup.LOSERS);
        const qualifyGroupLosers: QualifyGroup = horizontalPouleLosers.getQualifyGroup();
        if (!qualifyGroupWinners && !qualifyGroupLosers) {
            return "";
        }
        if (qualifyGroupWinners && !qualifyGroupLosers) {
            const classes = (qualifyGroupWinners.getNrOfToPlacesShort() > 0 && horizontalPouleWinners.isBorderPoule() ? 'q-partial' : '')
            return classes + ' q-w-' + qualifyGroupWinners.getNumber();
        }
        if (qualifyGroupLosers && !qualifyGroupWinners) {
            const classes = (qualifyGroupLosers.getNrOfToPlacesShort() > 0 && horizontalPouleLosers.isBorderPoule() ? 'q-partial' : '')
            return classes + ' q-l-' + qualifyGroupLosers.getNumber();
        }
        const partialWinners = (qualifyGroupWinners.getNrOfToPlacesShort() > 0 && horizontalPouleWinners.isBorderPoule());
        const partialLosers = (qualifyGroupLosers.getNrOfToPlacesShort() > 0 && horizontalPouleLosers.isBorderPoule());
        if (partialWinners && partialLosers) {
            return 'q-partial q-w-' + qualifyGroupWinners.getNumber() + '-double-partial q-l-' + qualifyGroupLosers.getNumber() + '-double-partial';
        }
        if (!partialWinners) {
            return 'q-w-' + qualifyGroupWinners.getNumber();
        }
        return 'q-l-' + qualifyGroupLosers.getNumber();
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