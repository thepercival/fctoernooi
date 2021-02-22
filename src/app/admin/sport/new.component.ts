import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { CompetitionSport, GameMode, JsonSport, NameService, Sport, SportCustom } from 'ngx-sport';

import { IAlert } from '../../shared/common/alert';
import { CSSService } from '../../shared/common/cssservice';
import { TranslateService } from '../../lib/translate';
import { SportRepository } from '../../lib/ngx-sport/sport/repository';
import { DefaultService } from '../../lib/ngx-sport/defaultService';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { GameModeInfoModalComponent } from '../../shared/tournament/gameMode/infomodal.component';

@Component({
    selector: 'app-tournament-sport-new',
    templateUrl: './new.component.html',
    styleUrls: ['./new.component.css']
})
export class SportNewComponent implements OnInit {
    @Output() created = new EventEmitter<Sport>();
    public processing = true;
    public form: FormGroup;
    public alert: IAlert | undefined;
    public translateService: TranslateService;
    public gameModes: GameMode[] = [GameMode.Against, GameMode.Together];
    public nrOfGamePlacesOptions: NrOfGamePlacesOption[] = [];
    public nameService!: NameService;
    private jsonDefaultSport: JsonSport;

    constructor(
        public cssService: CSSService,
        private sportRepository: SportRepository,
        private defaultService: DefaultService,
        private modalService: NgbModal,
        fb: FormBuilder
    ) {
        this.jsonDefaultSport = this.defaultService.getJsonSport();
        this.form = fb.group({
            name: ['', Validators.compose([
                Validators.required,
                Validators.minLength(Sport.MIN_LENGTH_NAME),
                Validators.maxLength(Sport.MAX_LENGTH_NAME)
            ])],
            team: this.jsonDefaultSport.team,
            nrOfGamePlaces: this.jsonDefaultSport.nrOfGamePlaces,
            gameMode: this.jsonDefaultSport.gameMode
        });
        this.translateService = new TranslateService();
    }

    ngOnInit() {
        this.nameService = new NameService();

        this.nrOfGamePlacesOptions = this.getNrOfGamePlacesOptions(this.jsonDefaultSport.gameMode);
        this.processing = false;
    }

    showWarning(): boolean {
        return this.form.controls.gameMode.value === GameMode.Against && this.form.controls.nrOfGamePlaces.value > 2;
    }

    private getNrOfGamePlacesOptions(gameMode: GameMode) {
        const nrOfGamePlacesOptions: NrOfGamePlacesOption[] = [];
        const addOption = (nrOfGamePlaces: number) => {
            const description = this.nameService.getNrOfGamePlacesName(nrOfGamePlaces);
            nrOfGamePlacesOptions.push({ nrOfGamePlaces, description });
        };
        if (gameMode === GameMode.Together) {
            addOption(0);
        }
        for (let nrOfGamePlaces = 1; nrOfGamePlaces <= 6; nrOfGamePlaces++) {
            if (gameMode === GameMode.Against && nrOfGamePlaces < 2) {
                continue;
            }
            addOption(nrOfGamePlaces);
        }
        return nrOfGamePlacesOptions;
    }

    private formToJson(): JsonSport {
        return {
            id: 0,
            name: this.form.controls.name.value,
            team: this.form.controls.team.value,
            gameMode: this.form.controls.gameMode.value,
            nrOfGamePlaces: this.form.controls.nrOfGamePlaces.value,
            customId: 0
        };
    }

    protected setAlert(type: string, message: string) {
        this.alert = { 'type': type, 'message': message };
    }

    openGameModeInfoModal() {
        this.modalService.open(GameModeInfoModalComponent, { windowClass: 'info-modal' });
    }

    add() {
        this.processing = true;
        this.alert = undefined;
        this.sportRepository.createObject(this.formToJson()).subscribe(
            /* happy path */ sportRes => {
                this.created.emit(sportRes);
            },
            /* error path */ e => {
                this.setAlert('danger', e);
                this.processing = false;
            },
            /* onComplete */() => this.processing = false
        );
    }
}

interface NrOfGamePlacesOption {
    nrOfGamePlaces: number;
    description: string;
}