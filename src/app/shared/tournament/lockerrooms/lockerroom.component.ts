import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';

import { LockerRoom } from '../../../lib/lockerroom';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { NameModalComponent } from '../namemodal/namemodal.component';
import { CompetitorChooseModalComponent } from '../competitorchoosemodal/competitorchoosemodal.component';
import { LockerRoomValidator } from '../../../lib/lockerroom/validator';
import { Place, Competitor } from 'ngx-sport';

@Component({
    selector: 'app-tournament-lockerroom',
    templateUrl: './lockerroom.component.html',
    styleUrls: ['./lockerroom.component.scss']
})
export class LockerRoomComponent implements OnInit {
    @Input() validator: LockerRoomValidator;
    @Input() places: Place[];
    @Input() lockerRoom: LockerRoom;
    @Input() editable: boolean;
    @Output() remove = new EventEmitter<LockerRoom>();
    @Output() change = new EventEmitter();

    constructor(
        private modalService: NgbModal
    ) {
    }

    ngOnInit() {
    }

    hasCompetitors(): boolean {
        return this.lockerRoom.getCompetitors().length > 0;
    }

    selectCompetitors() {
        const activeModal = this.modalService.open(CompetitorChooseModalComponent);
        activeModal.componentInstance.validator = this.validator;
        activeModal.componentInstance.places = this.places;
        activeModal.componentInstance.lockerRoom = this.lockerRoom;
        activeModal.componentInstance.selectedCompetitors = this.lockerRoom.getCompetitors().slice();
        activeModal.result.then((result: Competitor[]) => {
            this.lockerRoom.getCompetitors().splice(0);
            result.forEach((competitor: Competitor) => this.lockerRoom.getCompetitors().push(competitor));
            this.change.emit();
        }, (reason) => { });
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
