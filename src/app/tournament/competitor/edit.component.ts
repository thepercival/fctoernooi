import { AfterViewChecked, Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import {
    Competitor,
    CompetitorRepository,
    JsonCompetitor,
    NameService,
    Place,
    PlaceRepository,
    StructureRepository,
} from 'ngx-sport';

import { MyNavigation } from '../../common/navigation';
import { TournamentRepository } from '../../lib/tournament/repository';
import { TournamentComponent } from '../component';

@Component({
    selector: 'app-tournament-competitor-edit',
    templateUrl: './edit.component.html',
    styleUrls: ['./edit.component.css']
})
export class CompetitorEditComponent extends TournamentComponent implements OnInit, AfterViewChecked {
    form: FormGroup;
    place: Place;
    private focused = false;

    @ViewChild('inputname', { static: false }) private elementRef: ElementRef;

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
        this.form.controls.name.setValue(this.place.getCompetitor() ? this.place.getCompetitor().getName() : undefined);
        this.form.controls.registered.setValue(this.place.getCompetitor() ? this.place.getCompetitor().getRegistered() : false);
        this.form.controls.info.setValue(this.place.getCompetitor() ? this.place.getCompetitor().getInfo() : undefined);
        this.processing = false;
    }

    ngAfterViewChecked() {
        if (this.place !== undefined && this.place.getCompetitor() === undefined && this.focused === false) {
            this.focused = true;
            this.elementRef.nativeElement.focus();
        }
    }

    save(): boolean {
        this.processing = true;
        this.setAlert('info', 'de deelnemer wordt opgeslagen');
        if (this.place.getCompetitor() !== undefined) {
            this.edit();
        } else {
            this.add();
        }
        return false;
    }

    add() {
        const name = this.form.controls.name.value;
        const info = this.form.controls.info.value;

        if (this.isNameDuplicate(this.form.controls.name.value)) {
            this.setAlert('danger', 'de naam bestaat al voor dit toernooi');
            this.processing = false;
            return;
        }
        const association = this.tournament.getCompetition().getLeague().getAssociation();
        const competitor: JsonCompetitor = {
            name: name,
            registered: this.form.controls.registered.value,
            info: info ? info : undefined
        };

        this.competitorRepository.createObject(competitor, association)
            .subscribe(
            /* happy path */ competitorRes => {
                    this.assignCompetitor(competitorRes);
                },
            /* error path */ e => { this.setAlert('danger', e); this.processing = false; }
            );
    }

    assignCompetitor(competitor: Competitor) {
        this.place.setCompetitor(competitor);
        this.placeRepository.editObject(this.place, this.place.getPoule())
            .subscribe(
                  /* happy path */ placeRes => {
                    this.navigateBack();
                },
                  /* error path */ e => { this.setAlert('danger', e); this.processing = false; }
            );
    }

    edit() {
        if (this.isNameDuplicate(this.form.controls.name.value, this.place.getCompetitor().getId())) {
            this.setAlert('danger', 'de naam bestaat al voor dit toernooi');
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
        this.competitorRepository.editObject(competitor)
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
