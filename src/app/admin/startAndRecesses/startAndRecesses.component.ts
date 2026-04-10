import { Component, OnInit, TemplateRef } from '@angular/core';
import { AbstractControl, FormGroup, FormControl, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, NavigationExtras, Router, RouterLink } from '@angular/router';
import { NgbAlert, NgbDateStruct, NgbInputDatepicker, NgbTimepicker } from '@ng-bootstrap/ng-bootstrap';

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
import { StartEditMode } from '../../lib/tournament/startEditMode';
import { DateConverter } from '../../lib/dateConverter';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { TournamentNavBarComponent } from '../../shared/tournament/tournamentNavBar/tournamentNavBar.component';
import { faSpinner } from '@fortawesome/free-solid-svg-icons';

@Component({
    selector: 'app-tournament-startandrecesses',
    templateUrl: './startAndRecesses.component.html',
    styleUrls: ['./startAndRecesses.component.scss'],
    standalone: true,
    imports: [TournamentNavBarComponent,NgbAlert, NgbTimepicker, NgbInputDatepicker, FontAwesomeModule, ReactiveFormsModule, RouterLink]
})
export class StartAndRecessesComponent extends TournamentComponent implements OnInit {
    
    public typedForm: FormGroup<{
        date: FormControl<string>,
        time: FormControl<string>
      }>;
    public minDateStruct!: NgbDateStruct;
    public sameDayFormat = true;
    public hasBegun!: boolean;

    faSpinner = faSpinner;

    constructor(
        route: ActivatedRoute,
        router: Router,
        tournamentRepository: TournamentRepository,
        structureRepository: StructureRepository,
        globalEventsManager: GlobalEventsManager,        
        private recessRepository: RecessRepository,
        private planningRepository: PlanningRepository,
        private tournamentMapper: TournamentMapper,
        private myNavigation: MyNavigation,
        public dateFormatter: DateFormatter,
        private dateConverter: DateConverter,
    ) {
        super(route, router, tournamentRepository, structureRepository, globalEventsManager);

        this.typedForm = new FormGroup({
            date: new FormControl('', { nonNullable: true}),
            time: new FormControl('', { nonNullable: true})
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

        this.dateConverter.setDateTime(this.typedForm.controls.date, this.typedForm.controls.time, date);

        if (this.hasBegun) {
            this.alert.set({ type: IAlertType.Warning, message: 'er zijn al wedstrijden gespeeld, je kunt niet meer wijzigen' });
        }
        this.sameDayFormat = this.canUseSameDayFormat();
        this.processing.set(false);
    }

    get StartEditMode(): StartEditMode { return this.tournament.getStartEditMode(); }
    get LongTerm(): StartEditMode { return StartEditMode.EditLongTerm; }
    get ShortTerm(): StartEditMode { return StartEditMode.EditShortTerm; }
    get ReadOnly(): StartEditMode { return StartEditMode.ReadOnly; }

    isTimeEnabled() {
        return this.structure.getFirstRoundNumber().getValidPlanningConfig().getEnableTime();
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

    preEdit(modalContent: TemplateRef<any>): boolean {
        const startDateTime = this.dateConverter.getDateTime(this.typedForm.controls.date, this.typedForm.controls.time);
        if( startDateTime.getTime() <= this.tournament.getCompetition().getStartDateTime().getTime() ) {
            return this.edit();
        }
        this.openModalEditStart(modalContent);
        return false;
    }
    
    openModalEditStart(modalContent: TemplateRef<any> ) {
        const activeModal = this.modalService.open(modalContent);
        activeModal.result.then((result) => {
            if (result === 'update') {            
                this.edit();
            } else { 
                const startAsTime = this.dateConverter.getDateTime(this.typedForm.controls.date, this.typedForm.controls.time).getTime();
                const navigationExtras: NavigationExtras = {
                    queryParams: { newStartForCopyAsTime: startAsTime }
                  };
                this.router.navigate(['/admin', this.tournament.getId()], navigationExtras);
            }
        }, (reason) => {
        });
    }

    edit(): boolean {
        this.alert.set({ type: IAlertType.Info, message: 'het toernooi wordt opgeslagen' });

        const startDateTime = this.dateConverter.getDateTime(this.typedForm.controls.date, this.typedForm.controls.time);

        this.processing.set(true);
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
                                this.alert.set({ type: IAlertType.Danger, message: 'de wedstrijden is niet opgeslagen: ' + e });
                                this.processing.set(false);
                            }
                        });
                },
                error: (e) => {
                    this.alert.set({ type: IAlertType.Danger, message: 'het toernooi is niet opgeslagen: ' + e });
                    this.processing.set(false);
                }
            });

        return false;
    }

    removeRecess(recess: Recess) {
        this.processing.set(true);

        this.recessRepository.removeObject(recess, this.tournament)
            .subscribe({
                next: () => {
                    this.planningRepository.reschedule(this.structure.getFirstRoundNumber(), this.tournament)
                        .subscribe({
                            next: () => {
                                this.processing.set(false);
                            },
                            error: (e) => {
                                this.alert.set({ type: IAlertType.Danger, message: 'de wedstrijden is niet opgeslagen: ' + e });
                                this.processing.set(false);
                            }
                        });
                },
                error: (e) => {
                    this.alert.set({ type: IAlertType.Danger, message: 'het toernooi is niet opgeslagen: ' + e });
                    this.processing.set(false);
                }
            });
    }


}
