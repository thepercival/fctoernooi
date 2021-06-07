import { Component, OnInit } from '@angular/core';
import { AbstractControl, FormArray, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import {
    Game,
    NameService,
    Round,
    State,
    RoundNumber,
    CompetitorMap,
    ScoreConfigService,
    ScoreConfig,
    AgainstGame,
    PlanningConfig,
    TogetherGame,
    GameMapper,
    JsonTogetherGame,
    TogetherGamePlace,
    JsonAgainstGame,
    AgainstSportVariant,
    Poule,
    CompetitionSport,
    SingleSportVariant,
    AllInOneGameSportVariant,
    CompetitionSportMapper,
    Place,
    GamePlaceMapper,
    AgainstSide,
    PlaceSportPerformance,
    FieldMapper,
    JsonField,
    JsonGame,
    JsonReferee,
    RefereeMapper,
    PlaceMapper,
} from 'ngx-sport';
import { Observable, of } from 'rxjs';

import { AuthService } from '../../lib/auth/auth.service';
import { MyNavigation } from '../../shared/common/navigation';
import { Role } from '../../lib/role';
import { TournamentRepository } from '../../lib/tournament/repository';
import { TournamentComponent } from '../../shared/tournament/component';
import { StructureRepository } from '../../lib/ngx-sport/structure/repository';
import { GameRepository } from '../../lib/ngx-sport/game/repository';
import { TournamentUser } from '../../lib/tournament/user';
import { map } from 'rxjs/operators';
import { EqualQualifiersChecker } from '../../lib/ngx-sport/ranking/equalQualifiersChecker';
import { DateFormatter } from '../../lib/dateFormatter';
import { TranslateService } from '../../lib/translate';
import { JsonTogetherGamePlace } from 'ngx-sport/src/game/place/together/json';
import { JsonAgainstGamePlace } from 'ngx-sport/src/game/place/against/json';

@Component({
    selector: 'app-tournament-game-add',
    templateUrl: './add.component.html',
    styleUrls: ['./add.component.scss']
})
export class GameAddComponent extends TournamentComponent implements OnInit {
    private roundNumber!: RoundNumber;
    public poules: Poule[] = [];
    public competitionSports: CompetitionSport[] = [];
    public againstSportVariant: AgainstSportVariant | undefined;
    public singleSportVariant: SingleSportVariant | undefined;
    public allInOneGameSportVariant: AllInOneGameSportVariant | undefined;
    public form: FormGroup;
    public nameService!: NameService;

    constructor(
        route: ActivatedRoute,
        router: Router,
        tournamentRepository: TournamentRepository,
        structureRepository: StructureRepository,
        private gameRepository: GameRepository,
        private competitionSportMapper: CompetitionSportMapper,
        private fieldMapper: FieldMapper,
        private refereeMapper: RefereeMapper,
        private placeMapper: PlaceMapper,
        public dateFormatter: DateFormatter,
        fb: FormBuilder
    ) {
        super(route, router, tournamentRepository, structureRepository);
        this.form = fb.group({
            poule: [undefined, Validators.compose([
                Validators.required
            ])],
            competitionSport: [undefined, Validators.compose([
                Validators.required
            ])],
            gamePlaces: new FormGroup({}),
            homeGamePlaces: new FormGroup({}),
            awayGamePlaces: new FormGroup({}),
        });
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
                this.nameService = new NameService(new CompetitorMap(this.tournament.getCompetitors()));
                const roundNumber = this.structure.getRoundNumber(+params.roundNumber);

                if (roundNumber === undefined) {
                    this.setAlert('danger', 'de wedstrijd kan niet gevonden worden');
                    this.processing = false;
                    return;
                }
                this.roundNumber = roundNumber;
                this.poules = this.roundNumber.getPoules();
                this.competitionSports = this.roundNumber.getCompetitionSports();
                this.initForm();
                this.processing = false;
            });
        });
    }


    protected initForm() {
        // if (this.poules.length === 1) {
        this.form.controls.poule.setValue(this.poules[0]);
        // }
        // if (this.competitionSports.length === 1) {
        this.form.controls.competitionSport.setValue(this.competitionSports[0]);
        this.changeCompetitionSport(this.competitionSports[0]);
        // }
    }

    changePoule(poule: Poule) {
        this.changeCompetitionSport(this.form.controls.competitionSport.value);
    }

    changeCompetitionSport(competitionSport: CompetitionSport) {
        this.setSportVariants(competitionSport);
        this.form.controls.homeGamePlaces = new FormGroup({});
        this.form.controls.awayGamePlaces = new FormGroup({});
        this.form.controls.gamePlaces = new FormGroup({});

        if (this.againstSportVariant !== undefined) {
            for (let homeNr = 1; homeNr <= this.againstSportVariant.getNrOfHomePlaces(); homeNr++) {
                this.getHomeGamePlacesFormGroup().addControl('' + homeNr, new FormControl({}));
            }
            for (let awayNr = 1; awayNr <= this.againstSportVariant.getNrOfAwayPlaces(); awayNr++) {
                this.getAwayGamePlacesFormGroup().addControl('' + awayNr, new FormControl({}));
            }
        } else if (this.singleSportVariant !== undefined) {
            for (let placeNr = 1; placeNr <= this.singleSportVariant.getNrOfGamePlaces(); placeNr++) {
                this.getGamePlacesFormGroup().addControl('' + placeNr, new FormControl({}));
            }
        }
    }

    setSportVariants(competitionSport: CompetitionSport) {
        this.againstSportVariant = undefined;
        this.singleSportVariant = undefined;
        this.allInOneGameSportVariant = undefined;
        const sportVariant = competitionSport.getVariant();
        if (sportVariant instanceof AgainstSportVariant) {
            this.againstSportVariant = sportVariant;
        } else if (sportVariant instanceof SingleSportVariant) {
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
            state: State.Created,
            startDateTime: this.roundNumber.getLastStartDateTime().toISOString(),
            refereePlace: undefined
        };
        if (this.againstSportVariant instanceof AgainstSportVariant) {
            const jsonAgainst = <JsonAgainstGame>json;
            jsonAgainst.places = this.getJsonAgainstPlacesFromForm(sportVariant);
            jsonAgainst.gameRoundNumber = 0;
            jsonAgainst.scores = [];
            return jsonAgainst;
        } else if (this.singleSportVariant instanceof SingleSportVariant) {
            const jsonSingle = <JsonTogetherGame>json;
            jsonSingle.places = this.getJsonSinglePlacesFromForm(sportVariant);
            return jsonSingle;
        }
        const jsonAllInOneGame = <JsonTogetherGame>json;
        jsonAllInOneGame.places = this.getJsonAllInOneGamePlaces();
        return jsonAllInOneGame;
    }

    getJsonAgainstPlacesFromForm(sportVariant: AgainstSportVariant): JsonAgainstGamePlace[] {
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

    getJsonSinglePlacesFromForm(sportVariant: SingleSportVariant): JsonTogetherGamePlace[] {
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
        this.setAlert('info', 'de wedstrijd wordt opgeslagen');

        const jsonGame = this.formToJson();
        this.gameRepository.createObject(
            jsonGame,
            this.form.controls.competitionSport.value,
            this.form.controls.poule.value,
            this.tournament)
            .subscribe(
                    /* happy path */ gameRes => {
                    const suffix = ((gameRes instanceof AgainstGame) ? 'against' : 'together')
                    this.router.navigate(['/admin/game' + suffix, this.tournament.getId(), gameRes.getId()], { replaceUrl: true });
                },
                 /* error path */ e => { this.setAlert('danger', e); this.processing = false; }
            );
        return false;
    }

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