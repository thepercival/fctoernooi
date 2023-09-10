import { JsonCompetitor } from "ngx-sport";

export interface JsonTournamentCompetitor extends JsonCompetitor{ 
    emailaddress: string | undefined;
    telephone: string | undefined;
    logoExtension?: string | undefined;
}