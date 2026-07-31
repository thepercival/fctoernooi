import { InjectionToken } from '@angular/core';
import { PlaceCompetitorItem } from '../../lib/ngx-sport/placeCompetitorItem';

export interface CompetitorListRemoveModalInputs {
    item: PlaceCompetitorItem;
    allPlacesAssigned: boolean;
}

export const COMPETITOR_LIST_REMOVE_MODAL_INPUTS = new InjectionToken<CompetitorListRemoveModalInputs>('COMPETITOR_LIST_REMOVE_MODAL_INPUTS');
