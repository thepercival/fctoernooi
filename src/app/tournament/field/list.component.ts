import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Field, FieldRepository, PlanningRepository, PlanningService, StructureRepository } from 'ngx-sport';

import { Tournament } from '../../lib/tournament';
import { TournamentRepository } from '../../lib/tournament/repository';
import { TournamentService } from '../../lib/tournament/service';
import { TournamentComponent } from '../component';

@Component({
    selector: 'app-tournament-fields',
    templateUrl: './list.component.html',
    styleUrls: ['./list.component.scss']
})
export class FieldListComponent extends TournamentComponent implements OnInit {

    public disableEditButtons = false;
    private planningService: PlanningService;
    fields: Field[];

    validations: any = {
        'minlengthname': Field.MIN_LENGTH_NAME,
        'maxlengthname': Field.MAX_LENGTH_NAME
    };

    constructor(
        route: ActivatedRoute,
        router: Router,
        tournamentRepository: TournamentRepository,
        sructureRepository: StructureRepository,
        private fieldRepository: FieldRepository,
        private planningRepository: PlanningRepository
    ) {
        super(route, router, tournamentRepository, sructureRepository);
    }

    ngOnInit() {
        super.myNgOnInit(() => this.initFields());
    }

    initFields() {
        this.fields = this.tournament.getCompetition().getFields();
        this.planningService = new PlanningService(this.tournament.getCompetition());
        this.processing = false;
        if (this.hasBegun()) {
            this.setAlert('warning', 'er zijn al wedstrijden gespeeld, je kunt niet meer wijzigen');
        }
    }

    hasBegun() {
        return this.structure.getRootRound().hasBegun();
    }

    addField() {
        this.linkToEdit(this.tournament);
    }

    editField(field: Field) {
        this.linkToEdit(this.tournament, field);
    }

    linkToEdit(tournament: Tournament, field?: Field) {
        this.router.navigate(['/toernooi/fieldedit', tournament.getId(), field ? field.getNumber() : 0]);
    }

    removeField(field: Field) {
        this.setAlert('info', 'het veld wordt verwijderd');
        this.processing = true;

        this.fieldRepository.removeObject(field, this.tournament.getCompetition())
            .subscribe(
            /* happy path */ fieldRes => {
                    const tournamentService = new TournamentService(this.tournament);
                    tournamentService.reschedule(this.planningService, this.structure.getFirstRoundNumber());
                    this.planningRepository.editObject(this.structure.getFirstRoundNumber())
                        .subscribe(
                        /* happy path */ gamesRes => {
                                this.processing = false;
                                this.setAlert('success', 'het veld is verwijderd');
                            },
                /* error path */ e => { this.setAlert('danger', e); this.processing = false; },
                /* onComplete */() => this.processing = false
                        );
                },
            /* error path */ e => { this.setAlert('danger', 'X' + e); this.processing = false; },
            );
    }
}
