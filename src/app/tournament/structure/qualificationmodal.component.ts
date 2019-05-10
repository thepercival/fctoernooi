import { Component } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { NameService, QualifyGroup, Round } from 'ngx-sport';

@Component({
    selector: 'app-ngbd-modal-help',
    templateUrl: './qualificationmodal.component.html',
    styleUrls: ['./qualificationmodal.component.scss']
})
export class TournamentStructureQualificationModalComponent {
    private round: Round;
    public winnersAndLosers: number[];
    public nameService: NameService;
    public rangeNrOfQualifiers: number[] = [];
    public nrOfQualifiers: number;

    constructor(
        public activeModal: NgbActiveModal
    ) {
        this.nameService = new NameService();
        this.winnersAndLosers = [QualifyGroup.WINNERS, QualifyGroup.LOSERS];
    }

    getWinnersLosersName(winnersOrLosers: number): string {
        return 'nrof' + (winnersOrLosers === QualifyGroup.WINNERS ? 'winners' : 'losers');
    }

    public init(round: Round) {
        this.round = round;

        const nrOfPlaces = round.getNrOfPlaces();
        for (let n = 0; n <= nrOfPlaces; n++) {
            this.rangeNrOfQualifiers.push(n);
        }
    }

    public getNrOfQualifiers(winnersOrLosers: number): number {
        return this.round.getNrOfPlacesChildren(winnersOrLosers);
    }

    public changeNrOfQualifiers(nrOfQualifiers: number) {
        // do something with qualifypoules!!
    }
}
