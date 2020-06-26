import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import {
    Competitor,
    JsonCompetitor,
    NameService,
    Place,
} from 'ngx-sport';

import { MyNavigation } from '../../shared/common/navigation';
import { TournamentRepository } from '../../lib/tournament/repository';
import { CompetitorRepository } from '../../lib/ngx-sport/competitor/repository';
import { TournamentComponent } from '../../shared/tournament/component';
import { StructureRepository } from '../../lib/ngx-sport/structure/repository';
import { PlaceRepository } from '../../lib/ngx-sport/place/repository';

@Component({
    selector: 'app-tournament-competitor-edit',
    templateUrl: './edit.component.html',
    styleUrls: ['./edit.component.css']
})
export class CompetitorEditComponent extends TournamentComponent implements OnInit {
    form: FormGroup;
    place: Place;
    competitor: Competitor;
    hasBegun: boolean;

    validations: CompetitorValidations = {
        minlengthname: Competitor.MIN_LENGTH_NAME,
        maxlengthname: Competitor.MAX_LENGTH_NAME,
        maxlengthinfo: Competitor.MAX_LENGTH_INFO
    };

    constructor(
        private competitorRepository: CompetitorRepository,
        route: ActivatedRoute,
        router: Router,
        tournamentRepository: TournamentRepository,
        structureRepository: StructureRepository,
        private placeRepository: PlaceRepository,
        public nameService: NameService,
        private myNavigation: MyNavigation,
        fb: FormBuilder
    ) {
        super(route, router, tournamentRepository, structureRepository);
        this.form = fb.group({
            name: ['', Validators.compose([
                Validators.required,
                Validators.minLength(this.validations.minlengthname),
                Validators.maxLength(this.validations.maxlengthname)
            ])],
            registered: [''],
            info: ['', Validators.compose([
                Validators.maxLength(this.validations.maxlengthinfo)
            ])],
        });
    }

    // initialsValidator(control: FormControl): { [s: string]: boolean } {
    //     if (control.value.length < this.validations.minlengthinitials || control.value.length < this.validations.maxlengthinitials) {
    //         return { invalidInitials: true };
    //     }
    // }

    ngOnInit() {
        this.route.params.subscribe(params => {
            super.myNgOnInit(() => this.postInit(+params.placeId));
        });
    }

    private postInit(placeId: number) {
        if (placeId === undefined || placeId < 1) {
            this.processing = false;
            return;
        }
        const places = this.structure.getRootRound().getPlaces();
        this.place = places.find(placeIt => placeId === placeIt.getId());
        if (this.place === undefined) {
            this.processing = false;
            return;
        }
        this.competitor = this.place.getCompetitor();

        this.form.controls.name.setValue(this.competitor?.getName());
        this.form.controls.registered.setValue(this.competitor ? this.competitor.getRegistered() : false);
        this.form.controls.info.setValue(this.competitor?.getInfo());

        this.hasBegun = this.structure.getRootRound().hasBegun();

        this.processing = false;
    }

    save(): boolean {
        this.processing = true;
        this.setAlert('info', 'de deelnemer wordt opgeslagen');
        if (this.competitor !== undefined) {
            this.edit();
        } else {
            this.add();
        }
        return false;
    }

    add() {
        const name = this.form.controls.name.value;
        const info = this.form.controls.info.value;

        const message = this.validateName(this.form.controls.name.value);
        if (message) {
            this.setAlert('danger', message);
            this.processing = false;
            return;
        }
        const association = this.competition.getLeague().getAssociation();
        const competitor: JsonCompetitor = {
            name: name,
            registered: this.form.controls.registered.value,
            info: info ? info : undefined
        };

        this.competitorRepository.createObject(competitor, this.tournament)
            .subscribe(
            /* happy path */ competitorRes => {
                    this.assignCompetitor(competitorRes);
                },
            /* error path */ e => { this.setAlert('danger', e); this.processing = false; }
            );
    }

    assignCompetitor(competitor: Competitor) {
        this.place.setCompetitor(competitor);
        this.placeRepository.editObject(this.place, this.place.getPoule(), this.tournament)
            .subscribe(
                  /* happy path */ placeRes => {
                    this.navigateBack();
                },
                  /* error path */ e => { this.setAlert('danger', e); this.processing = false; }
            );
    }


    edit() {
        const message = this.validateName(this.form.controls.name.value, +this.place.getCompetitor().getId());
        if (message) {
            this.setAlert('danger', message);
            this.processing = false;
            return;
        }

        const competitor = this.place.getCompetitor();
        const name = this.form.controls.name.value;
        const registered = this.form.controls.registered.value;
        const info = this.form.controls.info.value;

        competitor.setName(name);
        competitor.setRegistered(registered);
        competitor.setInfo(info ? info : undefined);
        this.competitorRepository.editObject(competitor, this.tournament)
            .subscribe(
                    /* happy path */ competitorRes => {
                    this.navigateBack();
                },
            /* error path */ e => { this.setAlert('danger', e); this.processing = false; },
            /* onComplete */() => this.processing = false
            );
    }

    navigateBack() {
        this.myNavigation.back();
    }

    protected validateName(name: string, competitorId?: number): string {
        if (this.isNameDuplicate(name, competitorId)) {
            return 'de naam bestaat al voor dit toernooi';
        }
        let checkName = (name: string): string => {
            if (name.length <= 20) {
                return undefined;
            }
            let pos = name.indexOf(' ');
            if (pos < 0 || pos >= 20) {
                return 'de naam mag maximaal 20 aaneengesloten karakters bevatten(liefst 15), gebruik een spatie';
            }
            return checkName(name.substring(pos + 1));
        };
        return checkName(name);
    }

    isNameDuplicate(name: string, competitorId?: number): boolean {
        const places = this.structure.getRootRound().getPlaces();
        return places.find(placeIt => {
            const competitorName = placeIt.getCompetitor() ? placeIt.getCompetitor().getName() : undefined;
            return (name === competitorName && (competitorId === undefined || placeIt.getCompetitor().getId() === undefined));
        }) !== undefined;
    }


    // setName(name) {
    //     this.error = undefined;
    //     if (name.length < this.validations.minlengthinitials || name.length > this.validations.maxlengthinfo) {
    //         return;
    //     }
    //     this.model.name = name;
    // }
}

export interface CompetitorValidations {
    minlengthname: number;
    maxlengthname: number;
    maxlengthinfo: number;
}
