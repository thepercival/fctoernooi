import { Component, OnInit, Input } from '@angular/core';
import { Field, SportConfig, JsonField, Structure } from 'ngx-sport';

import { FieldRepository } from '../../../lib/ngx-sport/field/repository';
import { PlanningRepository } from '../../../lib/ngx-sport/planning/repository';
import { IAlert } from '../../../shared/common/alert';
import { NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { NameModalComponent } from '../../../shared/tournament/namemodal/namemodal.component';
import { TranslateService } from '../../../lib/translate';
import { Tournament } from '../../../lib/tournament';

@Component({
    selector: 'app-tournament-fields',
    templateUrl: './fieldlist.component.html',
    styleUrls: ['./fieldlist.component.scss']
})
export class FieldListComponent implements OnInit {

    // public disableEditButtons = false;
    // fields: Field[];
    alert: IAlert;
    processing: boolean;
    @Input() tournament: Tournament;
    @Input() structure: Structure;
    @Input() sportConfig: SportConfig;
    @Input() hasBegun: boolean;

    // validations: any = {
    //     'minlengthname': Field.MIN_LENGTH_NAME,
    //     'maxlengthname': Field.MAX_LENGTH_NAME
    // };

    constructor(
        private fieldRepository: FieldRepository,
        private planningRepository: PlanningRepository,
        private modalService: NgbModal,
    ) {
        this.processing = true;

    }

    ngOnInit() {
        if (this.hasBegun) {
            this.alert = { type: 'warning', message: 'er zijn al wedstrijden gespeeld, je kunt niet meer toevoegen en verwijderen' };
        }
        this.processing = false;
    }

    getFieldDescription(): string {
        const translate = new TranslateService();
        return translate.getFieldNameSingular(this.sportConfig.getSport());
    }

    getChangeNameModel(buttonLabel: string, initialName?: string): NgbModalRef {
        const activeModal = this.modalService.open(NameModalComponent);
        activeModal.componentInstance.header = this.getFieldDescription() + 'naam';
        activeModal.componentInstance.range = { min: Field.MIN_LENGTH_NAME, max: Field.MAX_LENGTH_NAME };
        activeModal.componentInstance.buttonName = buttonLabel;
        activeModal.componentInstance.initialName = initialName;
        activeModal.componentInstance.labelName = 'naam';
        activeModal.componentInstance.buttonOutline = true;
        return activeModal;
    }

    addField() {
        const modal = this.getChangeNameModel('toevoegen');
        modal.result.then((resName: string) => {
            this.processing = true;
            const jsonField: JsonField = {
                priority: this.sportConfig.getCompetition().getFields().length + 1,
                name: resName
            };
            this.fieldRepository.createObject(jsonField, this.sportConfig, this.tournament).subscribe(
                /* happy path */ fieldRes => {
                    this.planningRepository.create(this.structure, this.tournament, 1).subscribe(
                    /* happy path */ roundNumberOut => {
                            this.processing = false;
                        },
                    /* error path */ e => { this.alert = { type: 'danger', message: e }; this.processing = false; },
                    );
                },
            /* error path */ e => { this.alert = { type: 'danger', message: e }; this.processing = false; },
            );
        }, (reason) => {
        });
    }

    editField(field: Field) {
        const modal = this.getChangeNameModel('wijzigen', field.getName());
        modal.result.then((resName: string) => {
            this.processing = true;
            field.setName(resName);
            this.fieldRepository.editObject(field, this.tournament)
                .subscribe(
            /* happy path */ fieldRes => {
                    },
            /* error path */ e => { this.alert = { type: 'danger', message: e }; this.processing = false; },
            /* onComplete */() => { this.processing = false; }
                );
        }, (reason) => {
        });
    }

    removeField(field: Field) {
        if (this.sportConfig.getFields().length === 1) {
            this.alert = { type: 'warning', message: 'een sport moet minimaal 1 ' + this.getFieldDescription() + ' houden, verwijder eventueel de sport' };
            return;
        }
        this.processing = true;

        this.fieldRepository.removeObject(field, this.tournament)
            .subscribe(
            /* happy path */ fieldRes => {
                    this.planningRepository.create(this.structure, this.tournament, 1)
                        .subscribe(
                        /* happy path */ roundNumberOut => {
                                this.processing = false;
                            },
                /* error path */ e => { this.alert = { type: 'danger', message: e }; this.processing = false; },
                /* onComplete */() => this.processing = false
                        );
                },
            /* error path */ e => { this.alert = { type: 'danger', message: e }; this.processing = false; },
            );
    }
}

export interface FieldValidations {
    minlengthname: number;
    maxlengthname: number;
}