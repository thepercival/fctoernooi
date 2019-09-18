import { Component, Input, OnInit } from '@angular/core';
import { NgbModal, NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { Structure, RoundNumber, NameService } from 'ngx-sport';
import { FormGroup, FormBuilder } from '@angular/forms';
import { IAlert } from '../../common/alert';

@Component({
    selector: 'app-ngbd-modal-roundnumbers',
    templateUrl: './selector.component.html',
})
export class ModalRoundNumbersComponent implements OnInit {
    @Input() structure: Structure;

    form: FormGroup;
    protected roundNumber: RoundNumber;
    processing = true;

    constructor(
        public nameService: NameService,
        public activeModal: NgbActiveModal,
        private fb: FormBuilder
    ) {
        this.form = fb.group({});
    }

    ngOnInit() {
        this.structure.getRoundNumbers().forEach(roundNumber => {
            this.form.addControl('rn' + roundNumber.getNumber(), this.fb.control(true));
        });
        this.onFormChanges();
        this.processing = false;
    }

    selectNext(roundNumber?: RoundNumber) {
        if (roundNumber === undefined) {
            return;
        }
        this.form.controls['rn' + roundNumber.getNumber()].setValue(true);
    }

    deselectPrevious(roundNumber?: RoundNumber) {
        if (roundNumber === undefined) {
            return;
        }
        this.form.controls['rn' + roundNumber.getNumber()].setValue(false);
    }


    getSelectedRoundNumber(): RoundNumber {
        return this.structure.getRoundNumbers().find(roundNumber => {
            return this.form.value['rn' + roundNumber.getNumber()];
        });
    }

    allDeselected(): boolean {
        return !this.structure.getRoundNumbers().some(roundNumber => {
            return this.form.value['rn' + roundNumber.getNumber()];
        });
    }

    onFormChanges(): void {
        this.structure.getRoundNumbers().forEach(roundNumber => {
            this.form.get('rn' + roundNumber.getNumber()).valueChanges.subscribe(val => {
                if (val === true) {
                    this.selectNext(roundNumber.getNext());
                } else {
                    this.deselectPrevious(roundNumber.getPrevious());
                }
            });
        });
    }
}
