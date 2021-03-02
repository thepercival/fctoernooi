import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { GameMode, Sport } from 'ngx-sport';

import { IAlert } from '../../shared/common/alert';
import { CSSService } from '../../shared/common/cssservice';
import { TranslateService } from '../../lib/translate';
import { SportRepository } from '../../lib/ngx-sport/sport/repository';
import { GameModeInfoModalComponent } from '../../shared/tournament/gameMode/infomodal.component';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
@Component({
    selector: 'app-tournament-sports-selector',
    templateUrl: './select.component.html',
    styleUrls: ['./select.component.css']
})
export class SportSelectComponent implements OnInit {
    @Input() selectedSports: Sport[] = [];
    @Input() editMode!: SportSelectMode;
    @Output() selected = new EventEmitter<Sport[]>();
    processing = true;
    inputType: SportInputType = SportInputType.Select;
    form: FormGroup;
    public alert: IAlert | undefined;
    public selectableSports: Sport[] = [];

    constructor(
        public cssService: CSSService,
        private sportRepository: SportRepository,
        private translateService: TranslateService,
        private modalService: NgbModal,
        fb: FormBuilder
    ) {
        this.form = fb.group({});
    }

    ngOnInit() {
        this.processing = true;
        this.sportRepository.getObjects().subscribe(
            /* happy path */(sports: Sport[]) => {
                this.selectableSports = this.initSelectableSports(sports);
                this.selectableSports.forEach((sport: Sport) => {
                    this.form.addControl(this.getControlId(sport), new FormControl(
                        { value: this.isInSelected(sport), disabled: this.isDisabled(sport) }
                    ));
                });
                this.processing = false;
            },
            /* error path */ e => { this.setAlert('danger', e); this.processing = false; },
            /* onComplete */() => this.processing = false
        );
    }

    protected initSelectableSports(sports: Sport[]): Sport[] {
        sports.sort((s1: Sport, s2: Sport) => {
            return (this.translate(s1) > this.translate(s2) ? 1 : -1);
        });
        return sports;
    }

    getControlId(sport: Sport): string {
        return 'sport-' + sport.getId();
    }

    isInSelected(sport: Sport): boolean {
        return this.selectedSports.indexOf(sport) >= 0;
    }

    isDisabled(sport: Sport): boolean {
        return this.editMode === SportSelectMode.Add && this.isInSelected(sport);
    }

    getHeader(): string {
        return this.editMode === SportSelectMode.AddRemove ? 'kiezen' : 'toevoegen';
    }

    get inputTypeSelect(): SportInputType { return SportInputType.Select; }
    get inputTypeNew(): SportInputType { return SportInputType.New; }

    createdSport(sport: Sport) {
        if (this.selectableSports.indexOf(sport) < 0) {
            this.selectableSports.unshift(sport);
            this.form.addControl(this.getControlId(sport), new FormControl(true));
        } else {
            this.form.controls[this.getControlId(sport)].setValue(true);
        }
        this.inputType = this.inputTypeSelect;
    }

    navigateBack() {
        if (this.editMode === SportSelectMode.Add) {
            return this.selected.emit([]);
        }
        this.selected.emit(this.selectedSports);
    }

    save() {
        let sports = this.getSelectedFormSports();
        if (this.editMode === SportSelectMode.Add) {
            sports = sports.filter((sport: Sport) => this.selectedSports.indexOf(sport) < 0);
        }
        this.selected.emit(sports);
    }

    getSelectedFormSports(): Sport[] {
        return this.selectableSports.filter((sport: Sport) => {
            return this.form.controls[this.getControlId(sport)].value;
        });
    }

    someSportSelected(): boolean {
        return this.selectableSports.some((sport: Sport) => {
            return this.form.controls[this.getControlId(sport)].value;
        });
    }

    bothGameModeSelected(): boolean {
        return this.hasGameModeSelected(GameMode.Against) && this.hasGameModeSelected(GameMode.Together);
    }

    hasGameModeSelected(gameMode: GameMode): boolean {
        return this.getSelectedFormSports().some((sportIt: Sport) => sportIt.getGameMode() === gameMode)
    }

    hasOtherGameMode(sport: Sport): boolean {
        const opposite = sport.getGameMode() === GameMode.Against ? GameMode.Together : GameMode.Against;
        return this.hasGameModeSelected(opposite);
    }

    getGameModeClass(sport: Sport): string {
        return 'custom-switch-' + (sport.getGameMode() === GameMode.Against ? 'against' : 'together');
    }

    translate(sport: Sport): string {
        if (sport.getCustomId() > 0) {
            return this.translateService.getSportName(sport.getCustomId());
        }
        return sport.getName();
    }

    get Against(): GameMode { return GameMode.Against; }

    openGameModeInfoModal() {
        this.modalService.open(GameModeInfoModalComponent, { windowClass: 'info-modal' });
    }

    protected setAlert(type: string, message: string) {
        this.alert = { 'type': type, 'message': message };
    }
}

enum SportInputType { Select, New };

export enum SportSelectMode { AddRemove, Add }
