import { Component, EventEmitter, Input, OnChanges, OnInit, Output } from '@angular/core';
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { CompetitionSport, GameMode, JsonSport, Sport, SportCustom } from 'ngx-sport';

import { IAlert } from '../../shared/common/alert';
import { CSSService } from '../../shared/common/cssservice';
import { TranslateService } from '../../lib/translate';
import { SportRepository } from '../../lib/ngx-sport/sport/repository';

@Component({
    selector: 'app-tournament-sports-selector',
    templateUrl: './select.component.html',
    styleUrls: ['./select.component.css']
})
export class SportSelectComponent implements OnInit, OnChanges {
    @Input() sports: Sport[];
    @Input() selectedSports: Sport[] = [];
    @Output() selected = new EventEmitter<Sport[]>();
    processing = true;
    private originalSelectedSports: Sport[] = [];
    inputType: SportInputType = SportInputType.Select;
    form: FormGroup;
    public alert: IAlert;
    translateService: TranslateService;

    constructor(
        public cssService: CSSService,
        private sportRepository: SportRepository,
        fb: FormBuilder
    ) {
        this.form = fb.group({});
        this.translateService = new TranslateService();
    }

    ngOnInit() {
        this.processing = true;
        this.originalSelectedSports = this.selectedSports.slice();
        this.sportRepository.getObjects().subscribe(
            /* happy path */(sports: Sport[]) => {
                this.sort(sports).forEach((sport: Sport) => {
                    this.form.addControl('sport-' + sport.getId(), new FormControl(
                        this.isSelected(sport)
                    ));
                });
                this.sports = sports;
                this.processing = false;
            },
            /* error path */ e => { this.setAlert('danger', e); this.processing = false; },
            /* onComplete */() => this.processing = false
        );
    }

    ngOnChanges() {


    }

    protected addControl() {

    }

    sort(sports: Sport[]): Sport[] {
        sports.sort((s1, s2) => {
            return (this.translate(s1) > this.translate(s2) ? 1 : -1);
        });
        return sports;
    }

    get inputTypeSelect(): SportInputType { return SportInputType.Select; }
    get inputTypeNew(): SportInputType { return SportInputType.New; }

    createdSport(sport: Sport) {
        if (this.sports.indexOf(sport) < 0) {
            this.sports.unshift(sport);
            this.form.addControl('sport-' + sport.getId(), new FormControl(true));
        }
        this.form.controls['sport-' + sport.getId()].setValue(true);

        if (this.selectedSports.indexOf(sport) < 0) {
            this.selectedSports.unshift(sport);
        }
        this.inputType = this.inputTypeSelect;
    }

    isSelected(sport: Sport): boolean {
        return this.selectedSports.indexOf(sport) >= 0;
    }

    toggle(toggle: boolean, sport: Sport) {
        if (toggle) {
            this.selectedSports.push(sport);
        } else {
            this.selectedSports.splice(this.selectedSports.indexOf(sport), 1);
        }
    }

    navigateBack() {
        this.selected.emit(this.originalSelectedSports);
    }

    save() {
        this.selected.emit(this.selectedSports);
    }

    bothGameModeSelected(): boolean {
        return this.hasGameModeSelected(GameMode.Against) && this.hasGameModeSelected(GameMode.Together);
    }

    hasGameModeSelected(gameMode: GameMode): boolean {
        return this.selectedSports.some((sportIt: Sport) => sportIt.getGameMode() === gameMode);
    }

    hasOtherGameMode(sport: Sport): boolean {
        const opposite = sport.getGameMode() === GameMode.Against ? GameMode.Together : GameMode.Against;
        return this.hasGameModeSelected(opposite);
    }



    // protected isInputTypeHelper(inputType: number): boolean {
    //     return (inputType & this.radioGroupForm.value['inputtype']) === inputType;
    // }

    // showInputTypeChoice() {
    //     return this.inputSelectOnly !== true;
    // }

    translate(sport: Sport): string {
        if (sport.getCustomId() > 0) {
            return this.translateService.getSportName(sport.getCustomId());
        }
        return sport.getName();
    }

    protected setAlert(type: string, message: string) {
        this.alert = { 'type': type, 'message': message };
    }

    // save() {
    //this.processing = true;
    // TODOSPORT
    // const json: JsonSport = {
    //     id: 0,
    //     name: this.form.value['newSportName'],
    //     team: this.form.value['team'],
    //     customId: 0
    // };
    // this.sportRepository.createObject(json).subscribe(
    //     /* happy path */ sportRes => {
    //         this.sendSport.emit(sportRes);
    //     },
    //     /* error path */ e => {
    //         this.setAlert('danger', 'de sport kon niet worden aangemaakt: ' + e);
    //         this.processing = false;
    //     },
    //     /* onComplete */() => this.processing = false
    // );
    // }

    // sendSportByCustomId(customId: number) {
    //     this.processing = true;
    //     this.sportRepository.getObjectByCustomId(customId).subscribe(
    //         /* happy path */ sportRes => {
    //             this.sendSport.emit(sportRes);
    //         },
    //         /* error path */ e => {
    //             this.setAlert('danger', 'de sport kan niet gevonden worden: ' + e);
    //             this.processing = false;
    //         },
    //         /* onComplete */() => this.processing = false
    //     );

    // }

    // private postInit(id: number) {

    //     const sports = this.tournament.getCompetition().getSports();
    //     // sports is filter for list
}

enum SportInputType { Select, New };

