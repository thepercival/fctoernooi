import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { AgainstSportVariant, AllInOneGameSportVariant, GameMode, NameService, SingleSportVariant, Sport } from 'ngx-sport';

import { IAlert } from '../../shared/common/alert';
import { CSSService } from '../../shared/common/cssservice';
import { TranslateService } from '../../lib/translate';
import { SportRepository } from '../../lib/ngx-sport/sport/repository';
import { GameModeInfoModalComponent } from '../../shared/tournament/gameMode/infomodal.component';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { DefaultService, GameAmountConfigValidations } from '../../lib/ngx-sport/defaultService';

@Component({
    selector: 'app-tournament-create-sportwithfields',
    templateUrl: './createSportWithFields.component.html',
    styleUrls: ['./createSportWithFields.component.scss']
})
export class CreateSportWithFieldsComponent implements OnInit {
    @Input() labelBtnNext: string = 'toevoegen';
    @Input() sport: Sport | undefined;
    public sportWithFields: SportWithFields | undefined;
    @Output() created = new EventEmitter<SportWithFields>();
    @Output() goToPrevious = new EventEmitter<void>();
    processing = true;
    form: FormGroup;
    public alert: IAlert | undefined;
    public gameModes: GameMode[] = [GameMode.Single, GameMode.Against, GameMode.AllInOneGame];
    public nrOfGamePlacesOptions: NrOfGamePlacesOption[] = [];
    public nameService!: NameService;
    gameAmountValidations: GameAmountConfigValidations;

    get minNrOfSidePlaces(): number { return 1; }
    get maxNrOfSidePlaces(): number { return 6; }
    get minNrOfFields(): number { return 1; }
    get maxNrOfFields(): number { return 64; }

    constructor(
        public cssService: CSSService,
        private translate: TranslateService,
        private defaultService: DefaultService,
        private modalService: NgbModal,
        private fb: FormBuilder
    ) {
        this.form = this.fb.group({
        });
        this.gameAmountValidations = this.defaultService.getGameAmountConfigValidations()
    }

    ngOnInit() {
        this.nameService = new NameService();
        this.processing = true;
    }

    sportChanged(newSport: Sport) {
        console.log(newSport);
        this.nrOfGamePlacesOptions = this.getNrOfGamePlacesOptions(newSport.getDefaultGameMode());
        this.form = new FormGroup({
            sportName: new FormControl({
                value: this.translate.getSportName(newSport),
                disabled: true
            }, Validators.required),
            nrOfFields: new FormControl(2),
            gameMode: new FormControl(newSport.getDefaultGameMode()),
            // Against
            mixed: new FormControl(newSport.getDefaultNrOfSidePlaces() > 1),
            nrOfHomePlaces: new FormControl(newSport.getDefaultNrOfSidePlaces()),
            nrOfAwayPlaces: new FormControl(newSport.getDefaultNrOfSidePlaces()),
            // Single, AllInOneGame
            gameAmount: new FormControl(2),
        });
        this.sport = newSport;
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
        if (this.form.controls.gameMode.value === GameMode.Single) {
            return new SingleSportVariant(sport, 1, this.form.controls.gameAmount.value);
        } else if (this.form.controls.gameMode.value === GameMode.Against) {
            return new AgainstSportVariant(
                sport,
                this.form.controls.nrOfHomePlaces.value,
                this.form.controls.nrOfAwayPlaces.value,
                1
            );
        }
        return new AllInOneGameSportVariant(sport, 1);
    }

    save(sport: Sport) {
        this.created.emit(this.formToSportWithFields(sport));
    }

    get Against(): GameMode { return GameMode.Against; }

    openGameModeInfoModal() {
        this.modalService.open(GameModeInfoModalComponent, { windowClass: 'info-modal' });
    }

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
