import { Injectable } from "@angular/core";
import { TournamentCompetitor } from "./competitor";
import { TournamentRegistration } from "./tournament/registration";

@Injectable({
    providedIn: 'root'
})
export class NameValidator {    
    
    

    public validate(
        name: string, 
        competitor: TournamentCompetitor | TournamentRegistration | undefined,
        competitors: TournamentCompetitor[],
        categoryNr: number): string | undefined {
        if (this.isNameDuplicate(name, competitor, competitors, categoryNr)) {
            return 'de naam bestaat al voor dit toernooi';
        }
        let checkName = (name: string): string | undefined => {
            if (name.length <= 20) {
                return undefined;
            }
            let pos = name.indexOf(' ');
            if (pos < 0 || pos >= 20) {
                return 'de naam mag maximaal 20 aaneengesloten karakters bevatten(liefst 15), gebruik een spatie';
            }
            return checkName(name.substring(pos + 1));
        };
        return checkName(name);
    }

    public validateName(name: string): string | undefined {
        let checkName = (name: string): string | undefined => {
            if (name.length <= 20) {
                return undefined;
            }
            let pos = name.indexOf(' ');
            if (pos < 0 || pos >= 20) {
                return 'de naam mag maximaal 20 aaneengesloten karakters bevatten(liefst 15), gebruik een spatie';
            }
            return checkName(name.substring(pos + 1));
        };
        return checkName(name);
    }    

    public isNameDuplicate(
        name: string, 
        competitor: TournamentCompetitor | TournamentRegistration | undefined,
        competitors: TournamentCompetitor[],
        categoryNr: number
        ): boolean {
        return competitors.find((competitorIt: TournamentCompetitor) => {
            return name === competitorIt.getName()
                && (competitor === undefined || competitor !== competitorIt)
                && competitorIt.getStartLocation().getCategoryNr() === categoryNr;
        }) !== undefined;
    }
}