import { Referee, Competitor, Place, AgainstGame, TogetherGame, AgainstSide, AgainstGamePlace, TogetherGamePlace, StartLocationMap } from 'ngx-sport';
import { LockerRoom } from './lockerroom';
import { Tournament } from './tournament';

export class Favorites {

    protected startLocationMap: StartLocationMap;

    constructor(
        private tournament: Tournament,
        private competitors: Competitor[] = [],
        private referees: Referee[] = []
    ) {
        this.startLocationMap = new StartLocationMap(tournament.getCompetitors());
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

    hasGameItem(game: AgainstGame | TogetherGame): boolean {
        return this.hasGameReferee(game) || this.hasGameCompetitor(game);
    }

    getCompetitorIds(): number[] {
        return this.competitors.map((competitor: Competitor) => +competitor.getId());
    }

    getRefereeIds(): number[] {
        return this.referees.map((referee: Referee) => +referee.getId());
    }

    hasCompetitors(): boolean {
        return this.competitors.length > 0;
    }

    hasPlace(place: Place): boolean {
        if (this.getNrOfCompetitors() === 0) {
            return false;
        }
        const startLocation = place.getStartLocation();
        if (startLocation === undefined) {
            return false;
        }
        const competitor = this.startLocationMap.getCompetitor(startLocation);
        if (competitor === undefined) {
            return false;
        }
        return this.hasCompetitor(competitor);
    }

    hasCompetitor(competitor: Competitor | undefined): boolean {
        if (competitor === undefined || this.getNrOfCompetitors() === 0) {
            return false;
        }
        return this.competitors.find(competitorIt => competitorIt === competitor) !== undefined;
    }

    getNrOfCompetitors(): number {
        return this.competitors.length;
    }

    protected hasGameCompetitor(game: AgainstGame | TogetherGame): boolean {
        if (game instanceof AgainstGame) {
            return this.hasAgainstGameCompetitor(game);
        }
        return this.hasTogetherGameCompetitor(game);
    }

    hasAgainstGameCompetitor(game: AgainstGame, side?: AgainstSide): boolean {
        return game.getSidePlaces(side).some((gamePlace: AgainstGamePlace) => {
            const competitor = this.getCompetitorFromPlace(gamePlace.getPlace());
            return competitor && this.hasCompetitor(competitor);
        });
    }

    hasTogetherGameCompetitor(game: TogetherGame): boolean {
        return game.getTogetherPlaces().some((gamePlace: TogetherGamePlace) => {
            const competitor = this.getCompetitorFromPlace(gamePlace.getPlace());
            return competitor && this.hasCompetitor(competitor);
        });
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

    hasGameReferee(game: AgainstGame | TogetherGame): boolean {
        const referee = game.getReferee();
        if (referee !== undefined) {
            return this.hasReferee(referee);
        }
        const refereePlace = game.getRefereePlace();
        const competitor = refereePlace ? this.getCompetitorFromPlace(refereePlace) : undefined;
        return competitor ? this.hasCompetitor(competitor) : false;
    }

    protected getCompetitorFromPlace(place: Place): Competitor | undefined {
        const startLocation = place.getStartLocation();
        if (startLocation === undefined) {
            return undefined;
        }
        return this.startLocationMap.getCompetitor(startLocation);
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