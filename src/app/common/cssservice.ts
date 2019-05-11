import { Injectable } from '@angular/core';
import { PoulePlace, QualifyGroup, SportConfig } from 'ngx-sport';

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

    getQualify(place: PoulePlace): string {
        const qualifyGroupWinners: QualifyGroup = place.getHorizontalPoule(QualifyGroup.WINNERS).getQualifyGroup();
        const qualifyGroupLosers: QualifyGroup = place.getHorizontalPoule(QualifyGroup.LOSERS).getQualifyGroup();
        if (!qualifyGroupWinners && !qualifyGroupLosers) {
            return "";
        }
        if (qualifyGroupWinners && !qualifyGroupLosers) {
            return "q-w-" + qualifyGroupWinners.getNumber();
        }
        if (qualifyGroupLosers && !qualifyGroupWinners) {
            return "q-w-" + qualifyGroupLosers.getNumber();
        }
        console.error('make css combination');
        return "";
    }

    getWinnersOrLosers(winnersOrLosers: number): string {
        return winnersOrLosers === QualifyGroup.WINNERS ? 'success' : (winnersOrLosers === QualifyGroup.LOSERS ? 'danger' : '');
    }

    //       <div>
    //     <div style="color: #52D017">color winner 1</div>
    //     <div style="color: #347235">color winner 2</div>

    //     <div style="color: #F87217">color loser 2</div>
    //     <div style="color: #FF0000">color loser 1</div>
    //   </div>
}

//       <div>
    //     <div style="color: #52D017">color winner 1</div>
    //     <div style="color: #347235">color winner 2</div>

    //     <div style="color: #F87217">color loser 2</div>
    //     <div style="color: #FF0000">color loser 1</div>
    //   </div>