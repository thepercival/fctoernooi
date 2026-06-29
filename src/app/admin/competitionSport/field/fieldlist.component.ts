import { Component, OnInit, Input, signal, WritableSignal, Injector, ChangeDetectionStrategy } from '@angular/core';
import { Field, CompetitionSport, JsonField, Structure } from 'ngx-sport';

import { FieldRepository } from '../../../lib/ngx-sport/field/repository';
import { PlanningRepository } from '../../../lib/ngx-sport/planning/repository';
import { IAlert, IAlertType } from '../../../shared/common/alert';
import { NgbModal, NgbModalRef, NgbAlert } from '@ng-bootstrap/ng-bootstrap';
import { Tournament } from '../../../lib/tournament';
import { NAME_MODAL_DATA, NameModalComponent } from '../../../shared/tournament/namemodal/namemodal.component';
import { TranslateFieldService } from '../../../lib/translate/field';
import { FaIconComponent } from "@fortawesome/angular-fontawesome";
import { faArrowUp, faPencil, faPlus, faSort, faSpinner, faTrashCan } from '@fortawesome/free-solid-svg-icons';

@Component({
    selector: 'app-tournament-fields',
    templateUrl: './fieldlist.component.html',
    styleUrls: ['./fieldlist.component.scss'],
    changeDetection: ChangeDetectionStrategy.Eager,
    imports: [NgbAlert, FaIconComponent],
})
export class FieldListComponent implements OnInit {

    public readonly alert: WritableSignal<IAlert | undefined> = signal(undefined);
    public readonly processing: WritableSignal<boolean> = signal(true);
    @Input() tournament!: Tournament;
    @Input() structure!: Structure;
    @Input() competitionSport!: CompetitionSport;
    @Input() hasBegun!: boolean;
    prioritizable!: boolean;

    faSpinner = faSpinner;
    faSort = faSort;
    faPlus = faPlus;
    faPencilAlt = faPencil;
    faLevelUpAlt = faArrowUp;
    faTrashAlt = faTrashCan;

    constructor(
        private fieldRepository: FieldRepository,
        private planningRepository: PlanningRepository,
        private translate: TranslateFieldService,
        private modalService: NgbModal,
        private injector: Injector,
    ) {
        this.processing.set(true);

    }

    ngOnInit() {
        if (this.hasBegun) {
            this.alert.set({ type: IAlertType.Warning, message: 'er zijn al wedstrijden gespeeld, je kunt niet meer toevoegen of verwijderen' });
        }
        this.prioritizable = !this.competitionSport.getCompetition().hasMultipleSports();
        this.processing.set(false);
    }

    getFieldDescription(): string {
        return this.translate.getFieldNameSingular(this.competitionSport.getSport().getCustomId());
    }

    getChangeNameModel(buttonLabel: string, initialName?: string): NgbModalRef {
        return this.modalService.open(NameModalComponent, {
            injector: Injector.create({
                providers: [{
                    provide: NAME_MODAL_DATA,
                    useValue: {
                        header: this.getFieldDescription() + 'naam',
                        range: { min: Field.MIN_LENGTH_NAME, max: Field.MAX_LENGTH_NAME },
                        buttonName: buttonLabel,
                        initialName: initialName ?? '',
                        labelName: 'naam'
                    }
                }],
                parent: this.injector
            })
        });
    }

    formToJson(name: string, field?: Field): JsonField {
        return {
            id: field ? field.getId() : 0,
            priority: field ? field.getPriority() : this.competitionSport.getCompetition().getFields().length + 1,
            name: name
        };
    }

    addField() {
        this.alert.set(undefined);
        const modal = this.getChangeNameModel('toevoegen');
        modal.result.then((resName: string) => {
            this.processing.set(true);
            const jsonField = this.formToJson(resName);
            this.fieldRepository.createObject(jsonField, this.competitionSport, this.tournament)
                .subscribe({
                    next: () => this.updatePlanning(),
                    error: (e) => {
                        this.alert.set({ type: IAlertType.Danger, message: e }); this.processing.set(false);
                    }
                });
        }, (reason) => {
        });
    }

    editField(field: Field) {
        this.alert.set(undefined);
        const modal = this.getChangeNameModel('wijzigen', field.getName());
        modal.result.then((resName: string) => {
            this.processing.set(true);
            const jsonField = this.formToJson(resName, field);
            this.fieldRepository.editObject(jsonField, field, this.tournament)
                .subscribe({
                    next: () => { },
                    error: (e) => {
                        this.alert.set({ type: IAlertType.Danger, message: e }); this.processing.set(false);
                    },
                    complete: () => this.processing.set(false)
                });
        }, (reason) => {
        });
    }

    upgradePriority(field: Field) {
        this.processing.set(true);
        this.fieldRepository.upgradeObject(field, this.tournament).subscribe({
            next: () => this.updatePlanning(),
            error: (e) => {
                this.alert.set({ type: IAlertType.Danger, message: e }); this.processing.set(false);
            }
        });
    }

    removeField(field: Field) {
        this.processing.set(true);

        this.fieldRepository.removeObject(field, this.tournament).subscribe({
            next: () => this.updatePlanning(),
            error: (e) => {
                this.alert.set({ type: IAlertType.Danger, message: e }); this.processing.set(false);
            }
        });
    }

    protected updatePlanning() {
        this.planningRepository.create(this.structure, this.tournament).subscribe({
            next: () => { },
            error: (e) => {
                this.alert.set({ type: IAlertType.Danger, message: e }); this.processing.set(false);
            },
            complete: () => this.processing.set(false)
        });
    }
}
