import { AfterViewChecked, Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import {
    Competitor,
    CompetitorRepository,
    JsonCompetitor,
    NameService,
    PoulePlace,
    PoulePlaceRepository,
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
export class TournamentCompetitorEditComponent extends TournamentComponent implements OnInit, AfterViewChecked {
    customForm: FormGroup;
    poulePlace: PoulePlace;
    private focused = false;

    @ViewChild('inputname') private elementRef: ElementRef;

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
        private poulePlaceRepository: PoulePlaceRepository,
        public nameService: NameService,
        private myNavigation: MyNavigation,
        fb: FormBuilder
    ) {
        super(route, router, tournamentRepository, structureRepository);
        this.customForm = fb.group({
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
            super.myNgOnInit(() => this.postInit(+params.poulePlaceId));
        });
    }

    private postInit(poulePlaceId: number) {
        if (poulePlaceId === undefined || poulePlaceId < 1) {
            this.processing = false;
            return;
        }
        const poulePlaces = this.structure.getRootRound().getPlaces();
        this.poulePlace = poulePlaces.find(poulePlace => poulePlaceId === poulePlace.getId());
        if (this.poulePlace === undefined) {
            this.processing = false;
            return;
        }
        this.customForm.controls.name.setValue(this.poulePlace.getCompetitor() ? this.poulePlace.getCompetitor().getName() : undefined);
        this.customForm.controls.registered.setValue(this.poulePlace.getCompetitor() ? this.poulePlace.getCompetitor().getRegistered() : false);
        this.customForm.controls.info.setValue(this.poulePlace.getCompetitor() ? this.poulePlace.getCompetitor().getInfo() : undefined);
        this.processing = false;
    }

    ngAfterViewChecked() {
        if (this.poulePlace !== undefined && this.poulePlace.getCompetitor() === undefined && this.focused === false) {
            this.focused = true;
            this.elementRef.nativeElement.focus();
        }
    }

    save(): boolean {
        this.processing = true;
        this.setAlert('info', 'de deelnemer wordt opgeslagen');
        if (this.poulePlace.getCompetitor() !== undefined) {
            this.edit();
        } else {
            this.add();
        }
        return false;
    }

    add() {
        const name = this.customForm.controls.name.value;
        const info = this.customForm.controls.info.value;

        if (this.isNameDuplicate(this.customForm.controls.name.value)) {
            this.setAlert('danger', 'de naam bestaat al voor dit toernooi');
            this.processing = false;
            return;
        }
        const association = this.tournament.getCompetition().getLeague().getAssociation();
        const competitor: JsonCompetitor = {
            name: name,
            registered: this.customForm.controls.registered.value,
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
        this.poulePlace.setCompetitor(competitor);
        this.poulePlaceRepository.editObject(this.poulePlace, this.poulePlace.getPoule())
            .subscribe(
                  /* happy path */ poulePlaceRes => {
                    this.navigateBack();
                },
                  /* error path */ e => { this.setAlert('danger', e); this.processing = false; }
            );
    }

    edit() {
        if (this.isNameDuplicate(this.customForm.controls.name.value, this.poulePlace.getCompetitor().getId())) {
            this.setAlert('danger', 'de naam bestaat al voor dit toernooi');
            this.processing = false;
            return;
        }

        const competitor = this.poulePlace.getCompetitor();
        const name = this.customForm.controls.name.value;
        const registered = this.customForm.controls.registered.value;
        const info = this.customForm.controls.info.value;

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
        const poulePlaces = this.structure.getRootRound().getPlaces();
        return poulePlaces.find(poulePlaceIt => {
            const competitorName = poulePlaceIt.getCompetitor() ? poulePlaceIt.getCompetitor().getName() : undefined;
            return (name === competitorName && (competitorId === undefined || poulePlaceIt.getCompetitor().getId() === undefined));
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
