import { JsonCompetition, JsonCompetitor } from 'ngx-sport';
import { JsonLockerRoom } from '../lockerroom/json';
import { JsonIdentifiable } from 'ngx-sport';
import { JsonSponsor } from '../sponsor/json';
import { JsonRecess } from '../recess/json';
import { JsonTournamentUser } from './user/json';

export interface JsonTournament extends JsonIdentifiable {
    competition: JsonCompetition;
    public: boolean;
    users: JsonTournamentUser[];
    competitors: JsonCompetitor[];
    lockerRooms: JsonLockerRoom[];
    recesses: JsonRecess[];
    sponsors: JsonSponsor[];
}