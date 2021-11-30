import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { AgainstSportVariant, AllInOneGameSportVariant, SingleSportVariant, Sport, SportMapper } from 'ngx-sport';

import { IAlert } from '../../shared/common/alert';
import { CSSService } from '../../shared/common/cssservice';
import { TranslateService } from '../../lib/translate';
import { SportRepository } from '../../lib/ngx-sport/sport/repository';
import { DefaultService } from '../../lib/ngx-sport/defaultService';
import { NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { NameModalComponent } from '../../shared/tournament/namemodal/namemodal.component';
@Component({
    selector: 'app-tournament-sport-to-add',
    templateUrl: './toAdd.component.html',
    styleUrls: ['./toAdd.component.scss']
})
export class SportToAddComponent implements OnInit {
    processing = true;
    @Output() sportToAdd = new EventEmitter<Sport>();
    @Output() goToPrevious = new EventEmitter<void>();
    sports!: Sport[];
    alert: IAlert | undefined;

    constructor(
        public cssService: CSSService,
        private sportRepository: SportRepository,
        public translate: TranslateService,
        private defaultService: DefaultService,
        private modalService: NgbModal,
    ) {

    }

    ngOnInit() {
        this.processing = true;
        this.sportRepository.getObjects()
            .subscribe({
                next: (sports: Sport[]) => {
                    sports.sort((s1: Sport, s2: Sport) => {
                        return (this.translate.getSportName(s1) > this.translate.getSportName(s2) ? 1 : -1);
                    });
                    this.sports = sports;
                    this.processing = false;
                },
                error: (e) => {
                    this.setAlert('danger', e); this.processing = false;
                },
                complete: () => this.processing = false
            });
    }

    getNameModal(): NgbModalRef {
        const activeModal = this.modalService.open(NameModalComponent);
        activeModal.componentInstance.header = 'nieuwe sport';
        activeModal.componentInstance.range = { min: Sport.MIN_LENGTH_NAME, max: Sport.MAX_LENGTH_NAME };
        activeModal.componentInstance.initialName = '';
        activeModal.componentInstance.labelName = 'naam';
        activeModal.componentInstance.buttonName = 'opslaan';
        return activeModal;


    }

    createCustom() {
        this.getNameModal().result.then((nameRes: string) => {
            this.processing = true;
            this.alert = undefined;
            this.sportRepository.createObject(this.defaultService.getJsonSport(nameRes))
                .subscribe({
                    next: (sportRes: Sport) => {
                        this.sportToAdd.emit(sportRes);
                    },
                    error: (e) => {
                        this.setAlert('danger', e); this.processing = false;
                    },
                    complete: () => {
                        this.processing = false
                    }
                });
        }, (reason) => {
        });
    }

    select(sport: Sport) {
        this.sportToAdd.emit(sport);
    }

    protected setAlert(type: string, message: string) {
        this.alert = { 'type': type, 'message': message };
    }
}

export interface SportWithFields {
    variant: SingleSportVariant | AgainstSportVariant | AllInOneGameSportVariant;
    nrOfFields: number;
}
