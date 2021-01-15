import { JsonCompetition, JsonCompetitor } from 'ngx-sport';
import { JsonTournamentUser } from './user/mapper';
import { JsonLockerRoom } from '../lockerroom/json';
import { JsonSponsor } from '../sponsor/mapper';
import { JsonIdentifiable } from 'ngx-sport';

export interface JsonTournament extends JsonIdentifiable {
    competition: JsonCompetition;
    breakStartDateTime?: string;
    breakEndDateTime?: string;
    public: boolean;
    users: JsonTournamentUser[];
    competitors: JsonCompetitor[];
    lockerRooms: JsonLockerRoom[];
    sponsors: JsonSponsor[];
}