import { JsonCompetition, JsonCompetitor } from 'ngx-sport';
import { JsonTournamentUser } from './user/mapper';
import { JsonLockerRoom } from '../lockerroom/json';
import { JsonIdentifiable } from 'ngx-sport';
import { JsonSponsor } from '../sponsor/json';
import { JsonRecess } from '../recess/json';

export interface JsonTournament extends JsonIdentifiable {
    competition: JsonCompetition;
    public: boolean;
    users: JsonTournamentUser[];
    competitors: JsonCompetitor[];
    lockerRooms: JsonLockerRoom[];
    recesses: JsonRecess[];
    sponsors: JsonSponsor[];
}