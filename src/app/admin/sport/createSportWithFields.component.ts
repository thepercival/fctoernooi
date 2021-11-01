import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { AgainstSportVariant, AllInOneGameSportVariant, CustomSport, GameMode, GamePlaceStrategy, NameService, SingleSportVariant, Sport, VoetbalRange } from 'ngx-sport';

import { IAlert } from '../../shared/common/alert';
import { CSSService } from '../../shared/common/cssservice';
import { TranslateService } from '../../lib/translate';
import { GameModeModalComponent } from '../gameMode/modal.component';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { DefaultService } from '../../lib/ngx-sport/defaultService';

@Component({
    selector: 'app-tournament-create-sportwithfields',
    templateUrl: './createSportWithFields.component.html',
    styleUrls: ['./createSportWithFields.component.scss']
})
export class CreateSportWithFieldsComponent implements OnInit {
    @Input() labelBtnNext: string = 'toevoegen';
    @Input() sport: Sport | undefined;
    @Input() existingSportVariants: (SingleSportVariant | AgainstSportVariant | AllInOneGameSportVariant)[] = [];
    public sportWithFields: SportWithFields | undefined;
    @Output() created = new EventEmitter<SportWithFields>();
    @Output() goToPrevious = new EventEmitter<void>();
    processing = true;
    form: FormGroup;
    public alert: IAlert | undefined;
    public gameModes: GameMode[] = [GameMode.Single, GameMode.Against, GameMode.AllInOneGame];
    public selectedGameMode!: GameMode;
    public nrOfGamePlacesOptions: NrOfGamePlacesOption[] = [];
    public gameAmountRange!: VoetbalRange;
    public nameService!: NameService;

    get minNrOfSidePlaces(): number { return 1; }
    get maxNrOfSidePlaces(): number { return 2; }
    get minNrOfFields(): number { return 1; }
    get maxNrOfFields(): number { return 64; }
    get minNrOfGamePlaces(): number { return 1; }
    get maxNrOfGamePlaces(): number { return 4; }

    constructor(
        public cssService: CSSService,
        private translate: TranslateService,
        private defaultService: DefaultService,
        private modalService: NgbModal,
        private fb: FormBuilder
    ) {
        this.form = this.fb.group({
        });
    }

    ngOnInit() {
        this.nameService = new NameService();
        this.processing = true;
    }

    sportChanged(newSport: Sport) {
        this.nrOfGamePlacesOptions = this.getNrOfGamePlacesOptions(newSport.getDefaultGameMode());
        this.gameAmountRange = this.defaultService.getGameAmountRange(newSport.getDefaultGameMode());
        const nrOfFields = 2;
        this.form = new FormGroup({
            sportName: new FormControl({
                value: this.translate.getSportName(newSport),
                disabled: true
            }, Validators.required),
            nrOfFields: new FormControl(nrOfFields),
            gameMode: new FormControl({
                value: this.nameService.getGameModeName(newSport.getDefaultGameMode()),
                disabled: true
            }, Validators.required),
            // Against
            mixed: new FormControl(newSport.getDefaultNrOfSidePlaces() > 1),
            nrOfHomePlaces: new FormControl(newSport.getDefaultNrOfSidePlaces()),
            nrOfAwayPlaces: new FormControl(newSport.getDefaultNrOfSidePlaces()),
            nrOfGamePlaces: new FormControl(1),
            // Single, AllInOneGame
            gameAmount: new FormControl(1),
        });
        if (newSport.getCustomId() !== 0) {
            this.form.controls.gameMode.disable();
        }
        this.selectedGameMode = newSport.getDefaultGameMode();
        this.sport = newSport;
    }

    changeGameMode(gameMode: GameMode) {
        this.gameAmountRange = this.defaultService.getGameAmountRange(gameMode);
    }

    getFieldsDescription(): string {
        return this.translate.getFieldNamePlural(this.sport);
    }

    toSportToAdd() {
        this.sport = undefined;
    }

    private getNrOfGamePlacesOptions(gameMode: GameMode) {
        const nrOfGamePlacesOptions: NrOfGamePlacesOption[] = [];
        const addOption = (nrOfGamePlaces: number) => {
            const description = this.nameService.getNrOfGamePlacesName(nrOfGamePlaces);
            nrOfGamePlacesOptions.push({ nrOfGamePlaces, description });
        };
        if (gameMode !== GameMode.Against) {
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

    protected formToSportWithFields(sport: Sport): SportWithFields {
        return {
            variant: this.formToVariant(sport),
            nrOfFields: this.form.controls.nrOfFields.value
        };
    }

    protected formToVariant(sport: Sport): SingleSportVariant | AgainstSportVariant | AllInOneGameSportVariant {
        if (this.selectedGameMode === GameMode.Single) {
            return new SingleSportVariant(sport, this.form.controls.nrOfGamePlaces.value, this.form.controls.gameAmount.value);
        } else if (this.selectedGameMode === GameMode.Against) {
            let home = this.form.controls.nrOfHomePlaces.value;
            let away = this.form.controls.nrOfAwayPlaces.value;
            if (away < home) {
                home = away;
                away = this.form.controls.nrOfHomePlaces.value;
            }
            return new AgainstSportVariant(sport, home, away, (home + away) > 2 ? 0 : 1, (home + away) > 2 ? 1 : 0);
        }
        return new AllInOneGameSportVariant(sport, this.form.controls.gameAmount.value);
    }

    save(sport: Sport) {
        this.created.emit(this.formToSportWithFields(sport));
    }

    get Against(): GameMode { return GameMode.Against; }
    get Single(): GameMode { return GameMode.Single; }
    get Equally(): GamePlaceStrategy { return GamePlaceStrategy.EquallyAssigned; }
    get Randomly(): GamePlaceStrategy { return GamePlaceStrategy.RandomlyAssigned; }

    openGameModeInfoModal() {
        // const modalRef = this.modalService.open(RoundsSelectorModalComponent);
        // modalRef.componentInstance.structure = this.structure;
        this.modalService.open(GameModeModalComponent, { windowClass: 'info-modal' });
    }

    openGameModeChooseModal() {
        const modalRef = this.modalService.open(GameModeModalComponent);
        modalRef.componentInstance.defaultGameMode = this.selectedGameMode;
        modalRef.result.then((gameMode: GameMode) => {
            this.form.controls.gameMode.setValue(this.nameService.getGameModeName(gameMode));
            this.selectedGameMode = gameMode;
        }, (reason) => { });
    }

    // getCreationStrategy(sport: Sport): GameCreationStrategy {
    //     const calculator = new GameCreationStrategyCalculator();
    //     const thisSportVariant: SingleSportVariant | AgainstSportVariant | AllInOneGameSportVariant = this.formToVariant(sport);
    //     // console.log(this.existingSportVariants.concat([thisSportVariant]));
    //     return calculator.calculate(this.existingSportVariants.concat([thisSportVariant]));
    // }

    protected setAlert(type: string, message: string) {
        this.alert = { 'type': type, 'message': message };
    }
}


export interface SportWithFields {
    variant: SingleSportVariant | AgainstSportVariant | AllInOneGameSportVariant;
    nrOfFields: number;
}

interface NrOfGamePlacesOption {
    nrOfGamePlaces: number;
    description: string;
}
