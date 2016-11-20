import {CompetitionSeason} from "../competitionseason/competitionseason";
export class User {
    id: number;
    name: string;
    password: string;
    email: string;
    competitionSeasons: CompetitionSeason[];
}