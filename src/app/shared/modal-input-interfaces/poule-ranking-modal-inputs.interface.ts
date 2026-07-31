import { InjectionToken } from '@angular/core';
import { CompetitionSport, Poule, StructureNameService } from 'ngx-sport';
import { Favorites } from '../../lib/favorites';

export interface PouleRankingModalInputs {
    poule: Poule;
    competitionSports: CompetitionSport[];
    favorites?: Favorites;
    structureNameService?: StructureNameService;
}

export const POULE_RANKING_MODAL_INPUTS = new InjectionToken<PouleRankingModalInputs>('POULE_RANKING_MODAL_INPUTS');
