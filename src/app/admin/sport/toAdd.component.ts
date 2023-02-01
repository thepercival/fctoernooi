import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { AgainstGpp, AgainstH2h, AllInOneGame, Single, Sport } from 'ngx-sport';

import { IAlert, IAlertType } from '../../shared/common/alert';
import { CSSService } from '../../shared/common/cssservice';
import { TranslateSportService } from '../../lib/translate/sport';
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
        public translate: TranslateSportService,
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
                        const s1Name = this.translate.getSportName(s1.getCustomId(), s1.getName());
                        const s2Name = this.translate.getSportName(s2.getCustomId(), s2.getName());
                        return s1Name > s2Name ? 1 : -1;
                    });
                    this.sports = sports;
                    this.processing = false;
                },
                error: (e) => {
                    this.setAlert(IAlertType.Danger, e); this.processing = false;
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
                        this.setAlert(IAlertType.Danger, e); this.processing = false;
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

    protected setAlert(type: IAlertType, message: string) {
        this.alert = { 'type': type, 'message': message };
    }
}

export interface SportWithFields {
    variant: Single | AgainstH2h | AgainstGpp | AllInOneGame;
    nrOfFields: number;
}
