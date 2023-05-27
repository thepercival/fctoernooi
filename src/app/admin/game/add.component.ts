import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import {
    GameState,
    RoundNumber,
    AgainstGame,
    JsonTogetherGame,
    JsonAgainstGame,
    Poule,
    CompetitionSport,
    CompetitionSportMapper,
    Place,
    AgainstSide,
    FieldMapper,
    JsonField,
    JsonGame,
    JsonReferee,
    RefereeMapper,
    PlaceMapper,
    AgainstGpp,
    AgainstH2h,
    AllInOneGame,
    Single,
    AgainstVariant,
    JsonTogetherGamePlace,
    JsonAgainstGamePlace,
    StructureNameService,
    StartLocationMap,
    Category
} from 'ngx-sport';

import { TournamentRepository } from '../../lib/tournament/repository';
import { TournamentComponent } from '../../shared/tournament/component';
import { StructureRepository } from '../../lib/ngx-sport/structure/repository';
import { GameRepository } from '../../lib/ngx-sport/game/repository';
import { DateFormatter } from '../../lib/dateFormatter';
import { IAlertType } from '../../shared/common/alert';
import { GlobalEventsManager } from '../../shared/common/eventmanager';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { FavoritesRepository } from '../../lib/favorites/repository';

@Component({
    selector: 'app-tournament-game-add',
    templateUrl: './add.component.html',
    styleUrls: ['./add.component.scss']
})
export class GameAddComponent extends TournamentComponent implements OnInit {
    private roundNumber!: RoundNumber;
    public categories: Category[] = [];
    public poules: Poule[] = [];
    public competitionSports: CompetitionSport[] = [];
    public againstSportVariant: AgainstH2h | AgainstGpp | undefined;
    public singleSportVariant: Single | undefined;
    public allInOneGameSportVariant: AllInOneGame | undefined;
    public form!: FormGroup;
    public structureNameService!: StructureNameService;

    constructor(
        route: ActivatedRoute,
        router: Router,
        tournamentRepository: TournamentRepository,
        structureRepository: StructureRepository,
        globalEventsManager: GlobalEventsManager,
        modalService: NgbModal,
        favRepository: FavoritesRepository,
        private gameRepository: GameRepository,
        private competitionSportMapper: CompetitionSportMapper,
        private fieldMapper: FieldMapper,
        private refereeMapper: RefereeMapper,
        private placeMapper: PlaceMapper,
        public dateFormatter: DateFormatter
    ) {
        super(route, router, tournamentRepository, structureRepository, globalEventsManager, modalService, favRepository);
    }

    protected createForm(category: Category, poule: Poule, competitionSport: CompetitionSport) {
        this.form = new FormGroup({
            category: new FormControl<Category>(category, Validators.compose([
                Validators.required
            ])),
            poule: new FormControl<Poule>(poule, Validators.compose([
                Validators.required
            ])),
            competitionSport: new FormControl<CompetitionSport>(competitionSport, Validators.compose([
                Validators.required
            ])),
            gamePlaces: new FormGroup({}),
            homeGamePlaces: new FormGroup({}),
            awayGamePlaces: new FormGroup({}),
        });
        if (this.againstSportVariant !== undefined) {
            for (let homeNr = 1; homeNr <= this.againstSportVariant.getNrOfHomePlaces(); homeNr++) {
                this.getHomeGamePlacesFormGroup().removeControl('' + homeNr);
                this.getHomeGamePlacesFormGroup().addControl('' + homeNr, new FormControl<Place>(poule.getPlace(homeNr)));
            }        
            for (let awayNr = 1; awayNr <= this.againstSportVariant.getNrOfAwayPlaces(); awayNr++) {
                this.getAwayGamePlacesFormGroup().removeControl('' + awayNr);
                this.getAwayGamePlacesFormGroup().addControl('' + awayNr, new FormControl<Place>(poule.getPlace(awayNr)));
            }
        } else if (this.singleSportVariant !== undefined) {
            for (let placeNr = 1; placeNr <= this.singleSportVariant.getNrOfGamePlaces(); placeNr++) {
                this.getGamePlacesFormGroup().removeControl('' + placeNr);
                this.getGamePlacesFormGroup().addControl('' + placeNr, new FormControl<Place>(poule.getPlace(placeNr)));
            }
        }
    }

    getGamePlacesFormGroup(): FormGroup {
        return <FormGroup>this.form.controls.gamePlaces;
    }

    getHomeGamePlacesFormGroup(): FormGroup {
        return <FormGroup>this.form.controls.homeGamePlaces;
    }

    getAwayGamePlacesFormGroup(): FormGroup {
        return <FormGroup>this.form.controls.awayGamePlaces;
    }

    ngOnInit() {
        this.route.params.subscribe(params => {
            super.myNgOnInit(() => {
                this.structureNameService = new StructureNameService(new StartLocationMap(this.tournament.getCompetitors()));
                const roundNumber = this.structure.getRoundNumber(+params.roundNumber);

                if (roundNumber === undefined) {
                    this.setAlert(IAlertType.Danger, 'de wedstrijd kan niet gevonden worden');
                    this.processing = false;
                    return;
                }
                this.roundNumber = roundNumber;
                this.competitionSports = this.roundNumber.getCompetitionSports();

                this.categories = roundNumber.getStructureCells().map(structureCell => structureCell.getCategory());
                this.changeCategory(this.categories[0]);

                this.processing = false;
            });
        });
    }

    changeCategory(category: Category) {
        const structureCell = this.roundNumber.getStructureCell(category);
        this.poules = structureCell.getPoules();
        
        this.changePoule(this.poules[0], category, this.competitionSports[0]);
                
    }

    // protected initForm() {
    //     const firstCategory = this.categories[0];
    //     this.form.controls.category.setValue(firstCategory);
    //     // if (this.poules.length === 1) {
    //     this.form.controls.poule.setValue(this.poule);
    //     // }
    //     // if (this.competitionSports.length === 1) {
    //     this.form.controls.competitionSport.setValue(this.competitionSports[0]);
    //     this.changeCompetitionSport(this.competitionSports[0], this.poules[0]);
    //     // }
    // }


    changePoule(poule: Poule, category: Category, competitionSport: CompetitionSport) {
        // console.log(poule);
        // this.poule = poule;
        
        this.changeCompetitionSport(competitionSport, poule, category);
    }

    changeCompetitionSport(competitionSport: CompetitionSport, poule: Poule, category: Category) {
        this.setSportVariants(competitionSport);
        this.createForm(category, poule, competitionSport);
    }

    setSportVariants(competitionSport: CompetitionSport) {
        this.againstSportVariant = undefined;
        this.singleSportVariant = undefined;
        this.allInOneGameSportVariant = undefined;
        const sportVariant = competitionSport.getVariant();
        if (sportVariant instanceof AgainstVariant) {
            this.againstSportVariant = sportVariant;
        } else if (sportVariant instanceof Single) {
            this.singleSportVariant = sportVariant;
        } else {
            this.allInOneGameSportVariant = sportVariant;
        }
    }

    getPlaceNrs(nrOfSidePlaces: number): number[] {
        let homePlaceNrs = [];
        for (let placeNr = 1; placeNr <= nrOfSidePlaces; placeNr++) {
            homePlaceNrs.push(placeNr);
        }
        return homePlaceNrs;
    }

    formToJson(): JsonAgainstGame | JsonTogetherGame {
        const poule = this.form.controls.poule.value;
        const competitionSport = this.form.controls.competitionSport.value;
        const sportVariant = competitionSport.getVariant();
        const json: JsonGame = {
            id: 0,
            batchNr: 0,
            competitionSport: this.competitionSportMapper.toJson(competitionSport),
            field: this.getDefaultJsonField(),
            referee: this.getDefaultJsonReferee(),
            state: GameState.Created,
            startDateTime: this.roundNumber.getLastStartDateTime().toISOString(),
            refereeStructureLocation: undefined
        };
        if (this.againstSportVariant instanceof AgainstVariant) {
            const jsonAgainst = <JsonAgainstGame>json;
            jsonAgainst.places = this.getJsonAgainstPlacesFromForm(sportVariant);
            jsonAgainst.gameRoundNumber = 0;
            jsonAgainst.scores = [];
            return jsonAgainst;
        } else if (this.singleSportVariant instanceof Single) {
            const jsonSingle = <JsonTogetherGame>json;
            jsonSingle.places = this.getJsonSinglePlacesFromForm(sportVariant);
            return jsonSingle;
        }
        const jsonAllInOneGame = <JsonTogetherGame>json;
        jsonAllInOneGame.places = this.getJsonAllInOneGamePlaces();
        return jsonAllInOneGame;
    }

    getJsonAgainstPlacesFromForm(sportVariant: AgainstVariant): JsonAgainstGamePlace[] {
        const places: JsonAgainstGamePlace[] = [];
        for (let homeNr of this.getPlaceNrs(sportVariant.getNrOfHomePlaces())) {
            places.push({
                id: 0,
                place: this.placeMapper.toJson(this.getHomeGamePlacesFormGroup().value[homeNr]),
                side: AgainstSide.Home,
            });
        }
        for (let awayNr of this.getPlaceNrs(sportVariant.getNrOfAwayPlaces())) {
            places.push({
                id: 0,
                place: this.placeMapper.toJson(this.getAwayGamePlacesFormGroup().value[awayNr]),
                side: AgainstSide.Away,
            });
        }
        return places;
    }

    getJsonSinglePlacesFromForm(sportVariant: Single): JsonTogetherGamePlace[] {
        const places: JsonTogetherGamePlace[] = [];
        for (let placeNr of this.getPlaceNrs(sportVariant.getNrOfGamePlaces())) {
            const place = this.getGamePlacesFormGroup().value[placeNr];
            if (!(place instanceof Place)) {
                continue;
            }
            places.push({
                id: 0,
                place: this.placeMapper.toJson(place),
                scores: [],
                gameRoundNumber: 0
            });
        }

        return places;
    }

    getJsonAllInOneGamePlaces(): JsonTogetherGamePlace[] {
        const places: JsonTogetherGamePlace[] = [];
        for (let place of this.form.controls.poule.value.getPlaces()) {
            places.push({
                id: 0,
                place: this.placeMapper.toJson(place),
                scores: [],
                gameRoundNumber: 0
            });
        }
        return places;
    }

    getDefaultJsonField(): JsonField {
        return this.fieldMapper.toJson(this.competition.getFields()[0]);
    }

    getDefaultJsonReferee(): JsonReferee | undefined {
        const defaultReferee = this.competition.getReferees()[0];
        if (defaultReferee === undefined || this.roundNumber.getValidPlanningConfig().selfRefereeEnabled()) {
            return undefined;
        }
        return this.refereeMapper.toJson(defaultReferee);
    }

    save(): boolean {
        this.processing = true;
        this.setAlert(IAlertType.Info, 'de wedstrijd wordt opgeslagen');

        const jsonGame = this.formToJson();
        this.gameRepository.createObject(
            jsonGame,
            this.form.controls.competitionSport.value,
            this.form.controls.poule.value,
            this.tournament)
            .subscribe({
                next: (gameRes) => {
                    const suffix = ((gameRes instanceof AgainstGame) ? 'against' : 'together')
                    this.router.navigate(['/admin/game' + suffix, this.tournament.getId(), gameRes.getId()], { replaceUrl: true });
                },
                error: (e) => {
                    this.setAlert(IAlertType.Danger, e); this.processing = false;
                }
            });
        return false;
    }

    // changeHomePlace(nr: string, place: Place) {
    //     this.form.controls.homeGamePlaces.get(nr)?.setValue(place);
    //     console.log('HTEST', place, nr);
    // }

    // changeAwayPlace(nr: string, place: Place) {
    //     this.form.controls.awayGamePlaces.get(nr)?.setValue(place);
    //     console.log('ATEST', place, nr);
    // }

    allPlacesAreValid(): boolean {
        const placesTaken: Place[] = [];
        if (this.againstSportVariant !== undefined) {
            for (let homeNr = 1; homeNr <= this.againstSportVariant.getNrOfHomePlaces(); homeNr++) {
                const place = this.getHomeGamePlacesFormGroup().value[homeNr];
                if (!(place instanceof Place) || placesTaken.indexOf(place) >= 0) {
                    return false;
                }
                placesTaken.push(place);
            }
            for (let awayNr = 1; awayNr <= this.againstSportVariant.getNrOfAwayPlaces(); awayNr++) {
                const place = this.getAwayGamePlacesFormGroup().value[awayNr];
                if (!(place instanceof Place) || placesTaken.indexOf(place) >= 0) {
                    return false;
                }
                placesTaken.push(place);
            }
            return true;
        } else if (this.singleSportVariant !== undefined) {
            for (let placeNr = 1; placeNr <= this.singleSportVariant.getNrOfGamePlaces(); placeNr++) {
                const place = this.getGamePlacesFormGroup().value[placeNr];
                if (place instanceof Place && placesTaken.indexOf(place) >= 0) {
                    return false;
                }
                placesTaken.push(place);
            }
            return true;
        } else if (this.allInOneGameSportVariant !== undefined) {
            return true;
        }
        return false;
    }
}