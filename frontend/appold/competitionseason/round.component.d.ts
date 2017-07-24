import { Round } from '../voetbal/round';
export declare class CompetitionSeasonRoundComponent {
    round: Round;
    constructor();
    addPoulePlaceToNextRound(): void;
    updateQualifyRules(fromRound: any, toRound: any, newnrofqualifyers: any): void;
    removePoulePlaceFromNextRound(): void;
}
