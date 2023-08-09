import { JsonCompetition } from 'ngx-sport';
import { JsonLockerRoom } from '../lockerroom/json';
import { JsonIdentifiable } from 'ngx-sport';
import { JsonSponsor } from '../sponsor/json';
import { JsonRecess } from '../recess/json';
import { JsonTournamentUser } from './user/json';
import { StartEditMode } from './startEditMode';
import { JsonTournamentCompetitor } from '../competitor/json';

export interface JsonTournament extends JsonIdentifiable {
    competition: JsonCompetition;
    public: boolean;
    startEditMode: StartEditMode;
    users: JsonTournamentUser[];
    competitors: JsonTournamentCompetitor[];
    lockerRooms: JsonLockerRoom[];
    recesses: JsonRecess[];
    sponsors: JsonSponsor[];
}