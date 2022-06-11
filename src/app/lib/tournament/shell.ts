import { CustomSport } from "ngx-sport";

export interface TournamentShell {
    tournamentId: number;
    singleCustomSport: CustomSport | 0;
    name: string;
    startDateTime: Date;
    roles: number;
    public: boolean;
}