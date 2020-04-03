import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { NameService, Competitor, Place, Round } from 'ngx-sport';

@Component({
    selector: 'app-ngbd-modal-competitor-choose',
    templateUrl: './competitorchoosemodal.component.html',
    styleUrls: ['./competitorchoosemodal.component.scss']
})
export class CompetitorChooseModalComponent {
    @Input() rootRound: Round;
    @Input() filter: Competitor[];
    @Output() competitor = new EventEmitter<Competitor>();
    places: Place[];
    constructor(public nameService: NameService, public activeModal: NgbActiveModal) {
    }

    //     toon alle deelnemers en filter worden diegene die geselecteerd zijn
    //     er moet een deelnemers-toevoegen - knop komen
    // bij opslaan een lijst van deelnemers teruggeven

    selectable(place: Place): boolean {
        return place.getCompetitor() && !(this.filter && this.filter.find(filterIt => filterIt === place.getCompetitor()));
    }
}
