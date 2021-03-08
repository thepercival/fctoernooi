import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import {
    JsonCompetitor,
    NameService,
    CompetitorMap,
} from 'ngx-sport';

import { MyNavigation } from '../../shared/common/navigation';
import { TournamentRepository } from '../../lib/tournament/repository';
import { CompetitorRepository } from '../../lib/ngx-sport/competitor/repository';
import { TournamentComponent } from '../../shared/tournament/component';
import { StructureRepository } from '../../lib/ngx-sport/structure/repository';
import { TournamentCompetitor } from '../../lib/competitor';

@Component({
    selector: 'app-tournament-competitor-edit',
    templateUrl: './edit.component.html',
    styleUrls: ['./edit.component.css']
})
export class CompetitorEditComponent extends TournamentComponent implements OnInit {
    form: FormGroup;
    originalCompetitor: TournamentCompetitor | undefined;
    hasBegun!: boolean;
    public nameService!: NameService;
    pouleNr!: number;
    placeNr!: number;

    validations: CompetitorValidations = {
        minlengthname: TournamentCompetitor.MIN_LENGTH_NAME,
        maxlengthname: TournamentCompetitor.MAX_LENGTH_NAME,
        maxlengthinfo: TournamentCompetitor.MAX_LENGTH_INFO
    };

    constructor(
        private competitorRepository: CompetitorRepository,
        route: ActivatedRoute,
        router: Router,
        tournamentRepository: TournamentRepository,
        structureRepository: StructureRepository,
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
            registered: false,
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
            super.myNgOnInit(() => this.postInit(+params.pouleNr, +params.placeNr));
        });
    }

    private postInit(pouleNr: number, placeNr: number) {
        if (placeNr < 1 || pouleNr < 1) {
            this.setAlert('danger', 'de rondeplek kan niet gevonden worden');
            return;
        }
        this.pouleNr = pouleNr;
        this.placeNr = placeNr;
        this.hasBegun = this.structure.getRootRound().hasBegun();
        this.nameService = new NameService(new CompetitorMap(this.tournament.getCompetitors()));

        const competitor = this.tournament.getCompetitors().find(competitorIt => {
            return competitorIt.getPouleNr() === pouleNr && competitorIt.getPlaceNr() === placeNr;
        });
        this.originalCompetitor = competitor;
        this.form.controls.name.setValue(this.originalCompetitor?.getName());
        this.form.controls.registered.setValue(this.originalCompetitor ? this.originalCompetitor.getRegistered() : false);
        this.form.controls.info.setValue(this.originalCompetitor?.getInfo());
        this.processing = false;
    }

    formToJson(): JsonCompetitor {
        const name = this.form.controls.name.value;
        const info = this.form.controls.info.value;
        return {
            id: this.originalCompetitor ? this.originalCompetitor.getId() : 0,
            name: name,
            registered: this.form.controls.registered.value,
            info: info ? info : undefined,
            pouleNr: this.pouleNr,
            placeNr: this.placeNr
        };
    }

    save(): boolean {
        const jsonCompetitor = this.formToJson();
        const message = this.validateName(jsonCompetitor.name, this.originalCompetitor);
        if (message) {
            this.setAlert('danger', message);
            return false;
        }
        this.processing = true;
        this.setAlert('info', 'de deelnemer wordt opgeslagen');
        if (this.originalCompetitor) {
            this.competitorRepository.editObject(jsonCompetitor, this.originalCompetitor, this.tournament)
                .subscribe(
                    /* happy path */ competitorRes => {
                        this.navigateBack();
                    },
            /* error path */ e => { this.setAlert('danger', e); this.processing = false; },
            /* onComplete */() => this.processing = false
                );
            return false;
        }
        this.competitorRepository.createObject(jsonCompetitor, this.tournament)
            .subscribe(
            /* happy path */ competitorRes => {
                    this.navigateBack();
                },
            /* error path */ e => { this.setAlert('danger', e); this.processing = false; }
            );
        return false;
    }


    navigateBack() {
        this.myNavigation.back();
    }

    protected validateName(name: string, competitor: TournamentCompetitor | undefined): string | undefined {
        if (this.isNameDuplicate(name, competitor)) {
            return 'de naam bestaat al voor dit toernooi';
        }
        let checkName = (name: string): string | undefined => {
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

    isNameDuplicate(name: string, competitor: TournamentCompetitor | undefined): boolean {
        return this.tournament.getCompetitors().find((competitorIt: TournamentCompetitor) => {
            return (name === competitorIt.getName() && (competitor === undefined || competitor !== competitorIt));
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
