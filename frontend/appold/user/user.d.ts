import { CompetitionSeason } from "../voetbal/competitionseason";
export declare class User {
    id: number;
    name: string;
    password: string;
    email: string;
    competitionSeasons: CompetitionSeason[];
}
