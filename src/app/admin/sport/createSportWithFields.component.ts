import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { AgainstGpp, AgainstH2h, AllInOneGame, GameMode, NameService, Single, Sport, VoetbalRange } from 'ngx-sport';

import { IAlert, IAlertType } from '../../shared/common/alert';
import { CSSService } from '../../shared/common/cssservice';
import { TranslateSportService } from '../../lib/translate/sport';
import { TranslateFieldService } from '../../lib/translate/field';
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
    @Input() smallestNrOfPoulePlaces: number | undefined;
    @Input() existingSportVariants: (Single | AgainstH2h | AgainstGpp | AllInOneGame)[] = [];
    @Output() created = new EventEmitter<SportWithFields>();
    @Output() goToPrevious = new EventEmitter<void>();

    public sportWithFields: SportWithFields | undefined;
    processing = true;
    public typedForm: FormGroup<{
        sportName: FormControl<string>,
        nrOfFields: FormControl<number>,
        gameMode: FormControl<string>,
        mixed: FormControl<boolean>,
        nrOfHomePlaces: FormControl<number>,
        nrOfAwayPlaces: FormControl<number>,
        nrOfGamePlaces: FormControl<number>,
      }>|undefined;
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
        private translateSport: TranslateSportService,
        private translateField: TranslateFieldService,
        private defaultService: DefaultService,
        private modalService: NgbModal
    ) {
        
    }

    ngOnInit() {
        this.nameService = new NameService();
        this.processing = true;
    }

    sportChanged(newSport: Sport) {
        this.nrOfGamePlacesOptions = this.getNrOfGamePlacesOptions(newSport.getDefaultGameMode());
        this.gameAmountRange = this.defaultService.getGameAmountRange(newSport.getDefaultGameMode());
        const nrOfFields = 2;
        const form = new FormGroup<{
            sportName: FormControl<string>,
            nrOfFields: FormControl<number>,
            gameMode: FormControl<string>,
            mixed: FormControl<boolean>,
            nrOfHomePlaces: FormControl<number>,
            nrOfAwayPlaces: FormControl<number>,
            nrOfGamePlaces: FormControl<number>,
          }>({
            sportName: new FormControl(this.translateSport.getSportName(newSport.getCustomId(), newSport.getName()),{ 
                nonNullable: true, validators: [Validators.required] 
            }),
            nrOfFields: new FormControl(nrOfFields, { nonNullable: true }),
            gameMode: new FormControl(this.nameService.getGameModeName(newSport.getDefaultGameMode()),{ 
                nonNullable: true, validators: [Validators.required] 
            }),
            mixed: new FormControl(newSport.getDefaultNrOfSidePlaces() > 1, { nonNullable: true }),
            nrOfHomePlaces: new FormControl(newSport.getDefaultNrOfSidePlaces(), { nonNullable: true }),
            nrOfAwayPlaces: new FormControl(newSport.getDefaultNrOfSidePlaces(), { nonNullable: true }),
            nrOfGamePlaces: new FormControl(1, { nonNullable: true })
        });
        form.controls.sportName.disable({onlySelf: true});
        form.controls.gameMode.disable({onlySelf: true});
        if (newSport.getCustomId() !== 0) {
            form.controls.gameMode.disable();
        }
        this.typedForm = form;
        this.selectedGameMode = newSport.getDefaultGameMode();
        this.sport = newSport;
    }

    changeGameMode(gameMode: GameMode) {
        this.gameAmountRange = this.defaultService.getGameAmountRange(gameMode);
    }

    mixedChanged(typedForm: FormGroup): void {
        if( typedForm.controls.mixed.value ) {
            typedForm.controls.nrOfHomePlaces.setValue(2);
            typedForm.controls.nrOfAwayPlaces.setValue(2);            
        } else if( this.sport !== undefined) {
            typedForm.controls.nrOfHomePlaces.setValue(this.sport.getDefaultNrOfSidePlaces());
            typedForm.controls.nrOfAwayPlaces.setValue(this.sport.getDefaultNrOfSidePlaces());
        }        
    }

    getFieldsDescription(): string {
        return this.translateField.getFieldNamePlural(this.sport?.getCustomId());
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

    protected formToSportWithFields(typedForm: FormGroup, sport: Sport): SportWithFields {
        return {
            variant: this.formToVariant(typedForm, sport),
            nrOfFields: typedForm.controls.nrOfFields.value
        };
    }

    protected formToVariant(typedForm: FormGroup, sport: Sport): Single | AgainstH2h | AgainstGpp | AllInOneGame {
        if (this.selectedGameMode === GameMode.Single) {
            return new Single(sport, typedForm.controls.nrOfGamePlaces.value, 1);
        } else if (this.selectedGameMode === GameMode.Against) {
            let home = typedForm.controls.nrOfHomePlaces.value;
            let away = typedForm.controls.nrOfAwayPlaces.value;
            if (away < home) {
                home = away;
                away = typedForm.controls.nrOfHomePlaces.value;
            }
            if (this.existingSportVariants.length > 0 || home > 1 || away > 1) {
                return new AgainstGpp(sport, home, away, 1);
            }
            return new AgainstH2h(sport, home, away, 1);
        }
        return new AllInOneGame(sport, 1);
    }

    tooFewPoulePlaces(typedForm: FormGroup): boolean {
        if (this.smallestNrOfPoulePlaces === undefined || this.sport === undefined) {
            return false;
        }
        const variant: Single | AgainstH2h | AgainstGpp | AllInOneGame = this.formToVariant(typedForm, this.sport);
        if (variant instanceof AllInOneGame) {
            return false;
        }
        return this.smallestNrOfPoulePlaces < variant.getNrOfGamePlaces();
    }

    save(typedForm: FormGroup, sport: Sport) {
        this.created.emit(this.formToSportWithFields(typedForm, sport));
    }

    get Against(): GameMode { return GameMode.Against; }
    get Single(): GameMode { return GameMode.Single; }
    // get Equally(): GamePlaceStrategy { return GamePlaceStrategy.EquallyAssigned; }
    // get Randomly(): GamePlaceStrategy { return GamePlaceStrategy.RandomlyAssigned; }

    openGameModeInfoModal() {
        // const modalRef = this.modalService.open(RoundsSelectorModalComponent);
        this.modalService.open(GameModeModalComponent, { windowClass: 'info-modal' });
    }

    openGameModeChooseModal(typedForm: FormGroup) {
        const modalRef = this.modalService.open(GameModeModalComponent);
        modalRef.componentInstance.defaultGameMode = this.selectedGameMode;
        modalRef.result.then((gameMode: GameMode) => {
            typedForm.controls.gameMode.setValue(this.nameService.getGameModeName(gameMode));
            this.selectedGameMode = gameMode;
        }, (reason) => { });
    }

    // getCreationStrategy(sport: Sport): GameCreationStrategy {
    //     const calculator = new GameCreationStrategyCalculator();
    //     const thisSportVariant: SingleSportVariant | AgainstSportVariant | AllInOneGameSportVariant = this.formToVariant(sport);
    //     // console.log(this.existingSportVariants.concat([thisSportVariant]));
    //     return calculator.calculate(this.existingSportVariants.concat([thisSportVariant]));
    // }

    protected setAlert(type: IAlertType, message: string) {
        this.alert = { 'type': type, 'message': message };
    }
}


export interface SportWithFields {
    variant: Single | AgainstH2h | AgainstGpp | AllInOneGame;
    nrOfFields: number;
}

interface NrOfGamePlacesOption {
    nrOfGamePlaces: number;
    description: string;
}
