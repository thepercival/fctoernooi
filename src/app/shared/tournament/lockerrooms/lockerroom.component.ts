import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';

import { LockerRoom } from '../../../lib/lockerroom';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { NameModalComponent } from '../namemodal/namemodal.component';
import { Competitor, Round } from 'ngx-sport';
import { CompetitorChooseModalComponent } from '../competitorchoosemodal/competitorchoosemodal';

@Component({
    selector: 'app-tournament-lockerroom',
    templateUrl: './lockerroom.component.html',
    styleUrls: ['./lockerroom.component.scss']
})
export class LockerRoomComponent implements OnInit {
    @Input() rootRound: Round;
    @Input() lockerRoom: LockerRoom;
    @Input() editable: boolean;
    @Output() remove = new EventEmitter<LockerRoom>();

    constructor(
        private modalService: NgbModal,
    ) {
    }

    ngOnInit() {
    }

    addCompetitor() {

        const activeModal = this.modalService.open(CompetitorChooseModalComponent);
        activeModal.componentInstance.rootRound = this.rootRound;
        activeModal.componentInstance.filter = this.lockerRoom.getCompetitors();

        activeModal.result.then((result) => {
            console.log('121212');
            this.lockerRoom.getCompetitors().push(result);
        }, (reason) => {
        });
    }

    removeCompetitor(competitor: Competitor) {
        const idx = this.lockerRoom.getCompetitors().indexOf(competitor);
        if (idx >= 0) {
            this.lockerRoom.getCompetitors().splice(idx, 1);
        }
    }

    openModalName() {
        const activeModal = this.modalService.open(NameModalComponent);
        activeModal.componentInstance.header = 'kleedkamernaam';
        activeModal.componentInstance.range = { min: LockerRoom.MIN_LENGTH_NAME, max: LockerRoom.MAX_LENGTH_NAME };
        activeModal.componentInstance.name = this.lockerRoom.getName();

        activeModal.result.then((result) => {
            this.lockerRoom.setName(result);
        }, (reason) => {
        });
    }
}
