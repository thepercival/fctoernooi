import { Component, inject, Injector, OnInit, WritableSignal, output, signal, ChangeDetectionStrategy } from '@angular/core';
import { AgainstGpp, AgainstH2h, AllInOneGame, Single, Sport } from 'ngx-sport';

import { IAlert, IAlertType } from '../../shared/common/alert';
import { CSSService } from '../../shared/common/cssservice';
import { TranslateSportService } from '../../lib/translate/sport';
import { SportRepository } from '../../lib/ngx-sport/sport/repository';
import { DefaultService } from '../../lib/ngx-sport/defaultService';
import { NgbAlert, NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { NAME_MODAL_DATA, NameModalComponent } from '../../shared/tournament/namemodal/namemodal.component';
import { FaIconComponent } from '@fortawesome/angular-fontawesome';
import { IconDefinition } from '@fortawesome/fontawesome-svg-core';
import { getSportIconDef } from '../../shared/tournament/sport/icon.mapper';
import { CustomSportId } from '../../lib/ngx-sport/sport/custom';
@Component({
    selector: 'app-tournament-sport-to-add',
    templateUrl: './toAdd.component.html',
    styleUrls: ['./toAdd.component.scss'],
    standalone: true,
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [NgbAlert, FaIconComponent]
})
export class SportToAddComponent implements OnInit {
    cssService = inject(CSSService);
    private sportRepository = inject(SportRepository);
    translate = inject(TranslateSportService);
    private defaultService = inject(DefaultService);
    private modalService = inject(NgbModal);

    sportToAdd = output<Sport>();
    goToPrevious = output<void>();
    
    public readonly processing: WritableSignal<boolean> = signal(true);
    sports!: Sport[];
    alert: IAlert | undefined;
    private injector = inject(Injector);
    constructor() {

    }

    ngOnInit() {
        this.processing.set(true);
        this.sportRepository.getObjects()
            .subscribe({
                next: (sports: Sport[]) => {
                    sports.sort((s1: Sport, s2: Sport) => {
                        const s1Name = this.translate.getSportName(s1.getCustomId(), s1.getName());
                        const s2Name = this.translate.getSportName(s2.getCustomId(), s2.getName());
                        return s1Name > s2Name ? 1 : -1;
                    });
                    this.sports = sports;
                    this.processing.set(false);
                },
                error: (e) => {
                    this.setAlert(IAlertType.Danger, e); this.processing.set(false);
                },
                complete: () => this.processing.set(false)
            });
    }

    getNameModal(): NgbModalRef {
        return this.modalService.open(NameModalComponent, {
            injector: Injector.create({
                providers: [{
                    provide: NAME_MODAL_DATA,
                    useValue: {
                        header: 'nieuwe sport',
                        range: { min: Sport.MIN_LENGTH_NAME, max: Sport.MAX_LENGTH_NAME },
                        initialName: '',
                        labelName: 'naam',
                        buttonName: 'opslaan'
                    }
                }],
                parent: this.injector
            })
        });


    }

    createCustom() {
        this.getNameModal().result.then((nameRes: string) => {
            this.processing.set(true);
            this.alert = undefined;
            this.sportRepository.createObject(this.defaultService.getJsonSport(nameRes))
                .subscribe({
                    next: (sportRes: Sport) => {
                        this.sportToAdd.emit(sportRes);
                    },
                    error: (e) => {
                        this.setAlert(IAlertType.Danger, e); this.processing.set(false);
                    },
                    complete: () => {
                        this.processing.set(false)
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

    getSportIcon(customId: number): IconDefinition | undefined {
        return getSportIconDef(customId as CustomSportId);
    }
}

export interface SportWithFields {
    variant: Single | AgainstH2h | AgainstGpp | AllInOneGame;
    nrOfFields: number;
}
