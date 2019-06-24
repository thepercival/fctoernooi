import { Injectable } from '@angular/core';
import { HorizontalPoule, Place, QualifyGroup, Round, Sport } from 'ngx-sport';
import { TSport } from '../lib/tsport';

@Injectable()
export class CSSService {
    getIcon(sports: Sport[]): string {
        if ( sports.length !== 1 ) {
            return '';
        }
        return this.getIconBySportCustomId(sports[0].getCustomId());
    }

    getIconBySportCustomId( customId: number ): string {
        if ( customId === TSport.Basketball) {
            return 'basketball-ball';
        } else if (customId === TSport.Badminton) {
            return 'fi flaticon-badminton';
        } else if (customId === TSport.Chess) {
            return 'chess';
        } else if (customId === TSport.Darts) {
            return 'fi flaticon-darts';
        } else if (customId === TSport.ESports) {
            return 'gamepad';
        } else if (customId === TSport.Football) {
            return 'futbol';
        } else if (customId === TSport.Hockey) {
            return 'fi flaticon-hockey';
        } else if (customId === TSport.Squash) {
            return 'fi flaticon-squash';
        } else if (customId === TSport.TableTennis) {
            return 'table-tennis';
        } else if (customId === TSport.Tennis) {
            return 'fi flaticon-tennis';
        } else if (customId === TSport.Volleyball) {
            return 'volleyball-ball';
        }
        return '';
    }

    getIconType(sports: Sport[]): string {
        if ( sports.length !== 1 ) {
            return '';
        }
        return this.getIconTypeBySportCustomId(sports[0].getCustomId());
    }

    getIconTypeBySportCustomId( customId: number ): string {
        if (customId < 1 || customId === TSport.Korfball) {
            return '';
        }
        if (customId === TSport.Football || customId === TSport.TableTennis || customId === TSport.Basketball
            || customId === TSport.Chess || customId === TSport.ESports || customId === TSport.Volleyball) {
            return 'fa';
        }
        return 'fi';
    }

    getQualifyPlace(place: Place): string {
        const horizontalPouleWinners = place.getHorizontalPoule(QualifyGroup.WINNERS);
        const qualifyGroupWinners: QualifyGroup = horizontalPouleWinners.getQualifyGroup();
        const horizontalPouleLosers = place.getHorizontalPoule(QualifyGroup.LOSERS);
        const qualifyGroupLosers: QualifyGroup = horizontalPouleLosers.getQualifyGroup();
        if (!qualifyGroupWinners && !qualifyGroupLosers) {
            return '';
        }
        if (qualifyGroupWinners && qualifyGroupLosers) {
            const partialWinners = (qualifyGroupWinners.getNrOfToPlacesTooMuch() > 0 && horizontalPouleWinners.isBorderPoule());
            const partialLosers = (qualifyGroupLosers.getNrOfToPlacesTooMuch() > 0 && horizontalPouleLosers.isBorderPoule());
            if (partialWinners && partialLosers) {
                return 'q-partial q-w-' + qualifyGroupWinners.getNumber() + '-double-partial q-l-' 
                    + qualifyGroupLosers.getNumber() + '-double-partial';
            }
            if (!partialWinners) {
                return 'q-w-' + qualifyGroupWinners.getNumber();
            }
            return 'q-l-' + qualifyGroupLosers.getNumber();
        }
        if (qualifyGroupWinners && !qualifyGroupLosers) {
            return this.getQualifyPoule(horizontalPouleWinners);
        }
        return this.getQualifyPoule(horizontalPouleLosers);
    }

    getQualifyPoule(horizontalPoule: HorizontalPoule): string {
        const qualifyGroup = horizontalPoule.getQualifyGroup();
        if (qualifyGroup === undefined) {
            return '';
        }
        const classes = (qualifyGroup.getNrOfToPlacesTooMuch() > 0 && horizontalPoule.isBorderPoule()) ? 'q-partial' : '';
        return classes + ' q-' + this.getQualifyWinnersOrLosers(qualifyGroup.getWinnersOrLosers()) + '-' + qualifyGroup.getNumber();
    }

    getQualifyWinnersOrLosers(winnersOrLosers: number): string {
        return winnersOrLosers === QualifyGroup.WINNERS ? 'w' : 'l';
    }

    getQualifyRound(round: Round, noQualifyClass: string = ''): string {
        const qualifyGroup: QualifyGroup = round.getParentQualifyGroup();
        if (qualifyGroup === undefined) {
            return noQualifyClass;
        }
        return ' q-' + (qualifyGroup.getWinnersOrLosers() === QualifyGroup.WINNERS ? 'w' : 'l') + '-' + qualifyGroup.getNumber();
    }

    // getWinnersOrLosers(winnersOrLosers: number): string {
    //     return winnersOrLosers === QualifyGroup.WINNERS ? 'success' : (winnersOrLosers === QualifyGroup.LOSERS ? 'danger' : '');
    // }
}