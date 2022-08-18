import { Component, OnInit } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup, Validators, AbstractControl } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { NgbDateStruct, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { Period } from 'ngx-sport';

import { MyNavigation } from '../../shared/common/navigation';
import { TournamentRepository } from '../../lib/tournament/repository';
import { TournamentComponent } from '../../shared/tournament/component';
import { StructureRepository } from '../../lib/ngx-sport/structure/repository';
import { PlanningRepository } from '../../lib/ngx-sport/planning/repository';
import { TournamentMapper } from '../../lib/tournament/mapper';
import { Tournament } from '../../lib/tournament';
import { DateFormatter } from '../../lib/dateFormatter';
import { IAlertType } from '../../shared/common/alert';
import { RecessRepository } from '../../lib/recess/repository';
import { Recess } from '../../lib/recess';
import { GlobalEventsManager } from '../../shared/common/eventmanager';
import { FavoritesRepository } from '../../lib/favorites/repository';

@Component({
    selector: 'app-tournament-startandrecesses',
    templateUrl: './startAndRecesses.component.html',
    styleUrls: ['./startAndRecesses.component.scss']
})
export class StartAndRecessesComponent extends TournamentComponent implements OnInit {
    public form: UntypedFormGroup;
    public processing = true;
    public minDateStruct!: NgbDateStruct;
    public sameDayFormat = true;
    public hasBegun!: boolean;

    constructor(
        route: ActivatedRoute,
        router: Router,
        tournamentRepository: TournamentRepository,
        structureRepository: StructureRepository,
        globalEventsManager: GlobalEventsManager,
        modalService: NgbModal,
        favRepository: FavoritesRepository,
        private recessRepository: RecessRepository,
        private planningRepository: PlanningRepository,
        private tournamentMapper: TournamentMapper,
        private myNavigation: MyNavigation,
        public dateFormatter: DateFormatter,
        fb: UntypedFormBuilder
    ) {
        super(route, router, tournamentRepository, structureRepository, globalEventsManager, modalService, favRepository);

        this.form = fb.group({
            date: ['', Validators.compose([])],
            time: ['', Validators.compose([])]
        });
    }

    ngOnInit() {
        super.myNgOnInit(() => this.initStart());
    }

    initStart() {
        this.hasBegun = this.structure.getFirstRoundNumber().hasBegun();
        const date = this.competition.getStartDateTime();

        const now = new Date();
        const minDate = date > now ? now : date;
        this.minDateStruct = { year: minDate.getFullYear(), month: minDate.getMonth() + 1, day: minDate.getDate() };

        this.setDate(this.form.controls.date, this.form.controls.time, date);

        if (this.hasBegun) {
            this.setAlert(IAlertType.Warning, 'er zijn al wedstrijden gespeeld, je kunt niet meer wijzigen');
        }
        this.sameDayFormat = this.canUseSameDayFormat();
        this.processing = false;
    }

    isTimeEnabled() {
        return this.structure.getFirstRoundNumber().getValidPlanningConfig().getEnableTime();
    }

    getDate(dateFormControl: AbstractControl, timeFormControl: AbstractControl): Date {
        return new Date(
            dateFormControl.value.year,
            dateFormControl.value.month - 1,
            dateFormControl.value.day,
            timeFormControl.value.hour,
            timeFormControl.value.minute
        );
    }

    setDate(dateFormControl: AbstractControl, timeFormControl: AbstractControl, date: Date) {
        dateFormControl.setValue({ year: date.getFullYear(), month: date.getMonth() + 1, day: date.getDate() });
        timeFormControl.setValue({ hour: date.getHours(), minute: date.getMinutes() });
    }

    protected canUseSameDayFormat(): boolean {
        const start = this.competition.getStartDateTime();
        const lastRecess = this.tournament.getRecesses().slice().pop();
        if (lastRecess === undefined) {
            return true;
        }
        const recessEnd: Date = lastRecess.getEndDateTime();
        return (start.getDate() === recessEnd.getDate()
            && start.getMonth() === recessEnd.getMonth()
            && start.getFullYear() === recessEnd.getFullYear());
    }

    edit(): boolean {
        this.setAlert(IAlertType.Info, 'het toernooi wordt opgeslagen');

        const startDateTime = this.getDate(this.form.controls.date, this.form.controls.time);

        this.processing = true;
        const firstRoundNumber = this.structure.getFirstRoundNumber();

        const json = this.tournamentMapper.toJson(this.tournament);
        json.competition.startDateTime = startDateTime.toISOString();

        this.tournamentRepository.editObject(json)
            .subscribe({
                next: (tournament: Tournament) => {
                    this.tournament = tournament;
                    this.planningRepository.reschedule(firstRoundNumber, this.tournament)
                        .subscribe({
                            next: () => {
                                this.myNavigation.back();
                            },
                            error: (e) => {
                                this.setAlert(IAlertType.Danger, 'de wedstrijden is niet opgeslagen: ' + e);
                                this.processing = false;
                            }
                        });
                },
                error: (e) => {
                    this.setAlert(IAlertType.Danger, 'het toernooi is niet opgeslagen: ' + e);
                    this.processing = false;
                }
            });

        return false;
    }

    removeRecess(recess: Recess) {
        this.processing = true;

        this.recessRepository.removeObject(recess, this.tournament)
            .subscribe({
                next: () => {
                    this.planningRepository.reschedule(this.structure.getFirstRoundNumber(), this.tournament)
                        .subscribe({
                            next: () => {
                                this.processing = false;
                            },
                            error: (e) => {
                                this.setAlert(IAlertType.Danger, 'de wedstrijden is niet opgeslagen: ' + e);
                                this.processing = false;
                            }
                        });
                },
                error: (e) => {
                    this.setAlert(IAlertType.Danger, 'het toernooi is niet opgeslagen: ' + e);
                    this.processing = false;
                }
            });
    }


}
