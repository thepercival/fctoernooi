import { Game, Referee, Competitor, Place } from 'ngx-sport';
import { LockerRoom } from './lockerroom';
import { PlaceLocationMap } from 'ngx-sport';
import { Tournament } from './tournament';

export class Favorites {

    protected placeLocationMap: PlaceLocationMap;

    constructor(
        private tournament: Tournament,
        private competitors: Competitor[] = [],
        private referees: Referee[] = []
    ) {
        this.placeLocationMap = new PlaceLocationMap(tournament.getCompetitors());
    }

    getTournament(): Tournament {
        return this.tournament;
    }

    hasItems(): boolean {
        return this.hasCompetitors() || this.hasReferees();
    }

    // removeNonExisting(tournamentCompetitors: Competitor[], referees: Referee[]) {
    //     this.competitors = this.competitors.filter(competitor => {
    //         return tournamentCompetitors.some(tournamentCompetitor => (+competitor.getId()) === competitorId);
    //     });
    //     this.refereeIds = this.refereeIds.filter(refereeId => {
    //         return referees.some(referee => referee.getId() === refereeId);
    //     });
    // }

    hasGameItem(game: Game): boolean {
        return this.hasGameReferee(game) || this.hasGameCompetitor(game);
    }

    // getCompetitorIds(): number[] {
    //     return this.competitorIds;
    // }

    hasCompetitors(): boolean {
        return this.competitors.length > 0;
    }

    hasCompetitor(competitor: Competitor): boolean {
        if (competitor === undefined) {
            return false;
        }
        return this.competitors.find(competitorIt => competitorIt === competitor) !== undefined;
    }

    getNrOfCompetitors(): number {
        return this.competitors.length;
    }

    hasGameCompetitor(game: Game, homeAway?: boolean): boolean {
        // TODOSPORT
        return false;
        // return game.getPlaces(homeAway).some(gamePlace => {
        //     const competitor = this.placeLocationMap.getCompetitor(gamePlace.getPlace().getStartLocation());
        //     return competitor && this.hasCompetitor(competitor);
        // });
    }

    addCompetitor(competitor: Competitor) {
        if (this.hasCompetitor(competitor)) {
            return;
        }
        this.competitors.push(competitor);
    }

    removeCompetitor(competitor: Competitor) {
        if (this.hasCompetitor(competitor) === false) {
            return;
        }
        this.competitors.splice(this.competitors.indexOf(competitor), 1);
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
        return this.referees.length > 0;
    }

    hasReferee(referee: Referee): boolean {
        return this.referees.find(refereeIt => refereeIt === referee) !== undefined;
    }

    getNrOfReferees(): number {
        return this.referees.length;
    }

    hasGameReferee(game: Game): boolean {
        const referee = game.getReferee();
        if (referee !== undefined) {
            return this.hasReferee(referee);
        }
        const competitor = this.getCompetitorFromPlace(game.getRefereePlace());
        return competitor ? this.hasCompetitor(competitor) : false;
    }

    protected getCompetitorFromPlace(place: Place): Competitor {
        if (!place) {
            return undefined;
        }
        return this.placeLocationMap.getCompetitor(place.getStartLocation());
    }

    addReferee(referee: Referee) {
        if (this.hasReferee(referee)) {
            return;
        }
        this.referees.push(referee);
    }

    removeReferee(referee: Referee) {
        if (this.hasReferee(referee) === false) {
            return;
        }
        this.referees.splice(this.referees.indexOf(referee), 1);
    }

    filterReferees(referees: Referee[]): Referee[] {
        return referees.filter(referee => this.hasReferee(referee));
    }
}