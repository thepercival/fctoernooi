import { JsonCompetitor } from "ngx-sport";

export interface JsonTournamentCompetitor extends JsonCompetitor{ 
    hasLogo: boolean;
    emailaddress: string | undefined;
    telephone: string | undefined;
}