import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { JsonSport, Sport, SportConfig, SportCustom } from 'ngx-sport';

import { IAlert } from '../../shared/common/alert';
import { CSSService } from '../../shared/common/cssservice';
import { TranslateService } from '../../lib/translate';
import { SportRepository } from '../../lib/ngx-sport/sport/repository';

@Component({
    selector: 'app-tournament-sport-select',
    templateUrl: './select.component.html',
    styleUrls: ['./select.component.css']
})
export class SportSelectComponent implements OnInit {
    static readonly SELECT = 1;
    static readonly NEW = 2;

    @Input() sportConfigs: SportConfig[];
    @Input() filterSportConfigs: SportConfig[];
    @Input() staticInfo: string;
    @Input() inputSelectOnly: boolean;
    @Output() sendSport = new EventEmitter<Sport>();
    processing = true;
    form: FormGroup;
    public radioGroupForm: FormGroup;
    public alert: IAlert;
    translateService: TranslateService;

    constructor(
        public cssService: CSSService,
        private sportRepository: SportRepository,
        fb: FormBuilder
    ) {
        this.form = fb.group({
            newSportName: ['', Validators.compose([
                Validators.required,
                Validators.minLength(Sport.MIN_LENGTH_NAME),
                Validators.maxLength(Sport.MAX_LENGTH_NAME)
            ])],
            team: true
        });
        this.radioGroupForm = fb.group({ inputtype: SportSelectComponent.SELECT });
        this.translateService = new TranslateService();
    }

    ngOnInit() {
        this.processing = false;
    }

    getInputSelect(): number { return SportSelectComponent.SELECT; }
    getInputNew(): number { return SportSelectComponent.NEW; }

    isInputTypeSelect(): boolean {
        return this.isInputTypeHelper(this.getInputSelect());
    }

    isInputTypeNew(): boolean {
        return this.isInputTypeHelper(this.getInputNew());
    }

    protected isInputTypeHelper(inputType: number): boolean {
        return (inputType & this.radioGroupForm.value['inputtype']) === inputType;
    }

    showInputTypeChoice() {
        return this.inputSelectOnly !== true;
    }

    getSortedSports(): SortableSport[] {
        return SportCustom.get().filter(customId => {
            if (this.sportConfigs) {
                return this.sportConfigs.some(sportConfig => sportConfig.getSport().getCustomId() === customId);
            } else if (this.filterSportConfigs) {
                return !this.filterSportConfigs.some(sportConfig => sportConfig.getSport().getCustomId() === customId);
            }
            return true;
        }).map(customId => {
            return { customId: customId, name: this.translate(customId) };
        }).sort((s1, s2) => {
            return (s1.name > s2.name ? 1 : -1);
        });
    }

    translate(sportCustomId: number): string {
        return this.translateService.getSportName(sportCustomId);
    }

    protected setAlert(type: string, message: string) {
        this.alert = { 'type': type, 'message': message };
    }

    save() {
        this.processing = true;
        const json: JsonSport = {
            name: this.form.value['newSportName'],
            team: this.form.value['team'],
            customId: 0
        };
        this.sportRepository.createObject(json).subscribe(
            /* happy path */ sportRes => {
                this.sendSport.emit(sportRes);
            },
            /* error path */ e => {
                this.setAlert('danger', 'de sport kon niet worden aangemaakt: ' + e);
                this.processing = false;
            },
            /* onComplete */() => this.processing = false
        );
    }

    sendSportByCustomId(customId: number) {
        this.processing = true;
        this.sportRepository.getObjectByCustomId(customId).subscribe(
            /* happy path */ sportRes => {
                this.sendSport.emit(sportRes);
            },
            /* error path */ e => {
                this.setAlert('danger', 'de sport kan niet gevonden worden: ' + e);
                this.processing = false;
            },
            /* onComplete */() => this.processing = false
        );

    }

    // private postInit(id: number) {

    //     const sports = this.tournament.getCompetition().getSports();
    //     // sports is filter for list
}

interface SortableSport {
    customId: number;
    name: string;
}
