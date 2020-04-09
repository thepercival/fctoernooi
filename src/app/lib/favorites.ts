import { Competitor, Game, Referee } from 'ngx-sport';
import { LockerRoom } from './lockerroom';

export class Favorites {
    constructor(
        private tournamentId: number,
        private competitorIds: number[] = [],
        private refereeIds: number[] = []
    ) {

    }

    getTournamentId(): number {
        return this.tournamentId;
    }

    hasItems(): boolean {
        return this.hasCompetitors() || this.hasReferees();
    }

    removeNonExisting(competitors: Competitor[], referees: Referee[]) {
        this.competitorIds = this.competitorIds.filter(competitorId => {
            return competitors.some(competitor => competitor.getId() === competitorId);
        });
        this.refereeIds = this.refereeIds.filter(refereeId => {
            return referees.some(referee => referee.getId() === refereeId);
        });
    }

    hasGameItem(game: Game): boolean {
        return this.hasGameReferee(game) || this.hasGameCompetitor(game);
    }

    getCompetitorIds(): number[] {
        return this.competitorIds;
    }

    hasCompetitors(): boolean {
        return this.competitorIds.length > 0;
    }

    hasCompetitor(competitor: Competitor): boolean {
        if (competitor === undefined) {
            return false;
        }
        return this.competitorIds.find(competitorId => competitorId === competitor.getId()) !== undefined;
    }

    getNrOfCompetitors(): number {
        return this.competitorIds.length;
    }

    hasGameCompetitor(game: Game, homeaway?: boolean): boolean {
        return game.getPlaces(homeaway).some(gamePlace => this.hasCompetitor(gamePlace.getPlace().getCompetitor()));
    }

    addCompetitor(competitor: Competitor) {
        if (this.hasCompetitor(competitor)) {
            return;
        }
        this.competitorIds.push(competitor.getId());
    }

    removeCompetitor(competitor: Competitor) {
        if (this.hasCompetitor(competitor) === false) {
            return;
        }
        this.competitorIds.splice(this.competitorIds.indexOf(competitor.getId()), 1);
    }

    filterLockerRooms(lockerRooms: LockerRoom[]): LockerRoom[] {
        return lockerRooms.filter(lockerRoom => {
            return lockerRoom.getCompetitors().some(competitor => this.hasCompetitor(competitor));
        });
    }

    filterCompetitors(competitors: Competitor[]): Competitor[] {
        return competitors.filter(competitor => this.hasCompetitor(competitor));
    }

    hasReferees(): boolean {
        return this.refereeIds.length > 0;
    }

    hasReferee(referee: Referee): boolean {
        return this.refereeIds.find(refereeId => refereeId === referee.getId()) !== undefined;
    }

    getNrOfReferees(): number {
        return this.refereeIds.length;
    }

    hasGameReferee(game: Game): boolean {
        const referee = game.getReferee();
        if (referee !== undefined) {
            return this.hasReferee(referee);
        }
        return game.getRefereePlace() ? this.hasCompetitor(game.getRefereePlace().getCompetitor()) : false;
    }

    addReferee(referee: Referee) {
        if (this.hasReferee(referee)) {
            return;
        }
        this.refereeIds.push(referee.getId());
    }

    removeReferee(referee: Referee) {
        if (this.hasReferee(referee) === false) {
            return;
        }
        this.refereeIds.splice(this.refereeIds.indexOf(referee.getId()), 1);
    }

    filterReferees(referees: Referee[]): Referee[] {
        return referees.filter(referee => this.hasReferee(referee));
    }
}
