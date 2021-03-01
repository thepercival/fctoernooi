import { Place } from "ngx-sport";
import { TournamentCompetitor } from "../competitor";

export interface PlaceCompetitorItem {
    place: Place,
    competitor: TournamentCompetitor | undefined;
}