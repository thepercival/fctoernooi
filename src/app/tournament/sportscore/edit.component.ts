import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import {
  Sport,
  SportConfig,
  SportConfigRepository,
  SportConfigService,
  SportCustom,
  SportPlanningConfigService,
  SportScoreConfigService,
  StructureRepository,
  FieldRepository,
  JsonField,
  PlanningRepository,
  PlanningService,
  SportScoreConfig,
  RoundNumber,
} from 'ngx-sport';
import { forkJoin } from 'rxjs';
import { CSSService } from '../../common/cssservice';
import { MyNavigation } from '../../common/navigation';
import { TournamentRepository } from '../../lib/tournament/repository';
import { TournamentComponent } from '../component';
import { TournamentService } from '../../lib/tournament/service';
import { NgbModal, NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { TranslateService } from '../../lib/translate';
import { ModalRoundNumbersComponent } from '../roundnumber/selector.component';

@Component({
    selector: 'app-tournament-sportscore-edit',
    templateUrl: './edit.component.html',
    styleUrls: ['./edit.component.css']
})
export class SportScoreEditComponent extends TournamentComponent implements OnInit {
    form: FormGroup;
    sportConfig: SportConfig;
    sportConfigService: SportConfigService;
    private translateService: TranslateService;
    scoreConfig: SportScoreConfig;

    validations: SportScoreValidations = {
        minScore: 0,
        maxScore: 9999
    };

    constructor(
        private sportConfigRepository: SportConfigRepository,
        public cssService: CSSService,
        route: ActivatedRoute,
        router: Router,
        tournamentRepository: TournamentRepository,
        structureRepository: StructureRepository,
        private myNavigation: MyNavigation,
        fb: FormBuilder,
        private modalService: NgbModal
    ) {

        super(route, router, tournamentRepository, structureRepository);
        this.translateService = new TranslateService();
        this.form = fb.group({
            max: ['', Validators.compose([
                Validators.required,
                Validators.min(this.validations.minScore),
                Validators.max(this.validations.maxScore)
            ])],
            maxNext: ['', Validators.compose([
                Validators.required,
                Validators.min(this.validations.minScore),
                Validators.max(this.validations.maxScore)
            ])],
        });
        this.sportConfigService = new SportConfigService(new SportScoreConfigService(), new SportPlanningConfigService());
    }

    ngOnInit() {
        this.route.params.subscribe(params => {
            if (params.sportConfigId !== undefined) {
                super.myNgOnInit(() => this.postInit(+params.sportConfigId), false);
            }
        });
    }

    private getSportConfigById(id: number): SportConfig {
        if (id === undefined || id === 0) {
            return undefined;
        }
        return this.tournament.getCompetition().getSportConfigs().find(sportConfig => id === sportConfig.getId());
    }

    private postInit(id: number) {
        this.sportConfig = this.getSportConfigById(id);
        if (this.sportConfig === undefined) {
            this.processing = false;
            return;
        }

        if( this.structure.getFirstRoundNumber().hasNext() ) {
            this.openModal();
        } else {
            this.setScoreConfig();
        }
        this.processing = false;
    }

    setScoreConfig(scoreConfig?: SportScoreConfig) {
        if( scoreConfig === undefined ) {
            scoreConfig = this.structure.getFirstRoundNumber().getSportScoreConfig(this.sportConfig.getSport());
        }
        this.scoreConfig = scoreConfig;
        this.form.controls.max.setValue(this.scoreConfig.getMaximum());
    }

    openModal() {
        const modalRef = this.modalService.open(ModalRoundNumbersComponent);
        modalRef.componentInstance.structure = this.structure;
        modalRef.result.then((roundNumber: RoundNumber) => {
            const scoreConfig = roundNumber.getSportScoreConfig(this.sportConfig.getSport());
            this.setScoreConfig(scoreConfig);
        }, (reason) => { this.setScoreConfig(); });
    }

    // save(): boolean {
    //     if (this.sportConfig.getId() === undefined) {
    //         return this.add();
    //     }
    //     return this.edit();
    // }

    // add(): boolean {
    //     this.processing = true;
    //     this.setAlert('info', 'de sport wordt gewijzigd');

    //     this.sportConfig.setWinPoints(this.form.value['winPoints']);
    //     this.sportConfig.setDrawPoints(this.form.value['drawPoints']);
    //     this.sportConfig.setWinPointsExt(this.form.value['winPointsExt']);
    //     this.sportConfig.setDrawPointsExt(this.form.value['drawPointsExt']);

    //     const competition = this.tournament.getCompetition();

    //     this.sportConfigRepository.createObject(this.sportConfig, competition)
    //     .subscribe(
    //     /* happy path */ sportConfigRes => {

    //         const fieldReposAdds = [];
    //         for ( let i = 0 ; i < this.form.value['nrOfFields'] ; i++ ) {
    //             const fieldNr = competition.getFields().length + i + 1;
    //             const jsonField: JsonField = { number: fieldNr, name: '' + fieldNr, sportId: this.sportConfig.getSport().getId() };
    //             fieldReposAdds.push(this.fieldRepository.createObject(jsonField, competition));
    //         }

    //         forkJoin(fieldReposAdds).subscribe(results => {

    //             const firstRoundNumber = this.structure.getFirstRoundNumber();
    //             const tournamentService = new TournamentService(this.tournament);
    //             const planningService = new PlanningService(competition);
    //             tournamentService.reschedule(planningService, firstRoundNumber);
    //             this.planningRepository.editObject(firstRoundNumber).subscribe(
    //                 /* happy path */ gamesRes => {
    //                     this.linkToSportConfig(); /* niet navigate back van kan van sport komen */
    //                     this.processing = false;
    //                 },
    //                 /* error path */ e => { this.setAlert('danger', e); this.processing = false; },
    //                 /* onComplete */() => this.processing = false
    //             );
    //         },
    //             err => {
    //                 this.processing = false;
    //                 this.setAlert('danger', 'de wedstrijd is niet opgeslagen: ' + err);
    //             }
    //         );
    //     },
    //     /* error path */ e => { this.setAlert('danger', e); this.processing = false; },
    //     /* onComplete */() => { this.processing = false; }
    //     );
    //     return false;
    // }

    // edit(): boolean {
    //     this.processing = true;
    //     this.setAlert('info', 'de sport wordt gewijzigd');

    //     this.sportConfig.setWinPoints(this.form.value['winPoints']);
    //     this.sportConfig.setDrawPoints(this.form.value['drawPoints']);
    //     this.sportConfig.setWinPointsExt(this.form.value['winPointsExt']);
    //     this.sportConfig.setDrawPointsExt(this.form.value['drawPointsExt']);

    //     this.sportConfigRepository.editObject(this.sportConfig, this.tournament.getCompetition())
    //         .subscribe(
    //         /* happy path */ sportConfigRes => {
    //                 this.linkToSportConfig(); /* niet navigate back van kan van sport komen */
    //             },
    //         /* error path */ e => { this.setAlert('danger', e); this.processing = false; },
    //         /* onComplete */() => { this.processing = false; }
    //         );
    //     return false;
    // }

    // navigateBack() {
    //     this.myNavigation.back();
    // }

    // linkToSportConfig() {
    //     if (!this.tournament.getCompetition().hasMultipleSportConfigs()) {
    //         this.router.navigate(['/toernooi/sportconfigedit'
    //             , this.tournament.getId(), this.tournament.getCompetition().getFirstSportConfig().getId()]);
    //     } else {
    //         this.router.navigate(['/toernooi/sportconfigs', this.tournament.getId()]);
    //     }
    // }

    setScoreConfigMaximum(scoreConfig: SportScoreConfig, scoreConfigMaximum) {
        if (scoreConfigMaximum > 9999 || scoreConfigMaximum < 0) {
            return;
        }
        if (scoreConfigMaximum === 0 && scoreConfig.getParent() !== undefined) {
            this.setScoreConfigMaximum(scoreConfig.getParent(), 0);
        }
        scoreConfig.setMaximum(scoreConfigMaximum);
    }

    isScoreConfigReadOnly(scoreConfig: SportScoreConfig) {
        if (scoreConfig.getChild() !== undefined && scoreConfig.getChild().getMaximum() === 0) {
            return true;
        }
        // if (this.modelConfig.getEnableTime() && scoreConfig.getParent() === undefined) {
        //     return true;
        // }
        return false;
    }

     getDirectionName(scoreConfig: SportScoreConfig) {
        return scoreConfig.getDirection() === SportScoreConfig.UPWARDS ? 'naar' : 'vanaf';
    }
}

export interface SportScoreValidations {
    minScore: number;
    maxScore: number;
}
