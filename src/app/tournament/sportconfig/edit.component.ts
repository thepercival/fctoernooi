import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import {
    JsonSport,
    SportConfig,
    Referee,
    RefereeRepository,
    StructureRepository,
} from 'ngx-sport';

import { MyNavigation } from '../../common/navigation';
import { TournamentRepository } from '../../lib/tournament/repository';
import { CSSService } from '../../common/cssservice';
import { User } from '../../lib/user';
import { TournamentComponent } from '../component';
import { formArrayNameProvider } from '@angular/forms/src/directives/reactive_directives/form_group_name';

@Component({
    selector: 'app-tournament-sportconfig-edit',
    templateUrl: './edit.component.html',
    styleUrls: ['./edit.component.css']
})
export class SportConfigEditComponent extends TournamentComponent implements OnInit {
    form: FormGroup;
    sportConfig: SportConfig;
    ranges: any = {};

    validations: SportValidations = {
        minWinPoints: 1,
        maxWinPoints: 10,
        minDrawPoints: 0,
        maxDrawPoints: 5,
        minMinutesPerGame: 0,
        maxMinutesPerGame: 60,
    };

    constructor(
        /*private sportRepository: SportRepository,*/
        public cssService: CSSService,
        route: ActivatedRoute,
        router: Router,
        tournamentRepository: TournamentRepository,
        structureRepository: StructureRepository,
        private myNavigation: MyNavigation,
        fb: FormBuilder
    ) {

        // winPoints       zie oude form
        // drawPoints      zie oude form
        // winPointsExt        zie oude form
        // drawPointsExt       zie oude form
        // pointsCalculation   nieuw optie uit drie:  wedstrijdpunten, subscore, wedstrijdpunten + subscore???
        // nrOfGameCompetitors is 2, zonder form

        // EditPermissions, EmailAddresses
        // andere groep moet dan zijn getEditPermission, wanneer ingelogd, bij gewone view
        super(route, router, tournamentRepository, structureRepository);
        this.initRanges();
        this.form = fb.group({
            winPoints: ['', Validators.compose([
                Validators.required,
                Validators.minLength(this.validations.minWinPoints),
                Validators.maxLength(this.validations.maxWinPoints)
            ])]/*,
            name: ['', Validators.compose([
                Validators.maxLength(this.validations.maxlengthname)
            ])],
            emailaddress: ['', Validators.compose([
                Validators.minLength(this.validations.minlengthemailaddress),
                Validators.maxLength(this.validations.maxlengthemailaddress)
            ])],
            info: ['', Validators.compose([
                Validators.maxLength(this.validations.maxlengthinfo)
            ])],*/
        });
    }

    // initialsValidator(control: FormControl): { [s: string]: boolean } {
    //     if (control.value.length < this.validations.minlengthinitials || control.value.length < this.validations.maxlengthinitials) {
    //         return { invalidInitials: true };
    //     }
    // }

    initRanges() {
        this.ranges.winPoints = [];
        for (let i = this.validations.minWinPoints; i <= this.validations.maxWinPoints; i++) {
            this.ranges.winPoints.push(i);
        }
        // this.ranges.drawPoints = [];
        // for (let i = this.validations.minDrawPoints; i <= this.validations.maxDrawPoints; i++) {
        //     this.ranges.drawPoints.push(i);
        // }
        // const sport = this.tournament.getCompetition().getLeague().getSport();
        // if (sport === SportConfig.Chess) {
        //     this.ranges.drawPoints.push(0.5);
        //     this.ranges.drawPoints.sort();
        // }
    }

    ngOnInit() {
        this.route.params.subscribe(params => {
            super.myNgOnInit(() => this.postInit(+params.sportConfigId));
        });
    }

    private getSportConfigById(id: number): SportConfig {
        if (id === undefined || id === 0) {
            this.processing = false;
            return;
        }
        return this.tournament.getCompetition().getSportConfigs().find(sportConfig => id === sportConfig.getId());
    }

    private postInit(id: number) {
        this.sportConfig = this.getSportConfigById(id);
        if (this.sportConfig === undefined) {
            this.processing = false;
            return;
        }
        // this.form.controls.initials.setValue(this.referee.getInitials());
        // this.form.controls.name.setValue(this.referee.getName());
        // this.form.controls.emailaddress.setValue(this.referee.getEmailaddress());
        // this.form.controls.info.setValue(this.referee.getInfo());
        this.processing = false;
    }

    // save(): boolean {
    //     if (this.referee !== undefined) {
    //         this.edit();
    //     } else {
    //         this.add();
    //     }
    //     return false;
    // }

    // add() {
    //     this.processing = true;
    //     this.setAlert('info', 'de scheidsrechter wordt toegevoegd');
    //     const initials = this.form.controls.initials.value;
    //     const name = this.form.controls.name.value;
    //     const emailaddress = this.form.controls.emailaddress.value;
    //     const info = this.form.controls.info.value;

    //     if (this.isInitialsDuplicate(this.form.controls.initials.value)) {
    //         this.setAlert('danger', 'de initialen bestaan al voor dit toernooi');
    //         this.processing = false;
    //         return;
    //     }
    //     const ref: JsonReferee = {
    //         initials: initials,
    //         name: name ? name : undefined,
    //         emailaddress: emailaddress ? emailaddress : undefined,
    //         info: info ? info : undefined
    //     };
    //     this.refereeRepository.createObject(ref, this.tournament.getCompetition()).subscribe(
    //         /* happy path */ refereeRes => {
    //             const firstRoundNumber = this.structure.getFirstRoundNumber();
    //             const tournamentService = new TournamentService(this.tournament);
    //             tournamentService.reschedule(new PlanningService(this.tournament.getCompetition()), firstRoundNumber);
    //             this.planningRepository.editObject(firstRoundNumber).subscribe(
    //             /* happy path */ gamesRes => {
    //                     this.tournamentRepository.syncRefereeRoles(this.tournament).subscribe(
    //                     /* happy path */ allRolesRes => {
    //                             this.processing = false;
    //                             this.navigateBack();
    //                         },
    //                     /* error path */ e => { this.setAlert('danger', e); this.processing = false; },
    //                     /* onComplete */() => this.processing = false
    //                     );
    //                 },
    //             /* error path */ e => { this.setAlert('danger', e); this.processing = false; },
    //             );
    //         },
    //         /* error path */ e => { this.setAlert('danger', e); this.processing = false; },
    //     );
    // }

    // edit() {
    //     this.processing = true;
    //     this.setAlert('info', 'de scheidsrechter wordt gewijzigd');
    //     if (this.isInitialsDuplicate(this.form.controls.initials.value, this.referee)) {
    //         this.setAlert('danger', 'de initialen bestaan al voor dit toernooi');
    //         this.processing = false;
    //         return;
    //     }
    //     const initials = this.form.controls.initials.value;
    //     const name = this.form.controls.name.value;
    //     const emailaddress = this.form.controls.emailaddress.value;
    //     const info = this.form.controls.info.value;

    //     this.referee.setInitials(initials);
    //     this.referee.setName(name ? name : undefined);
    //     const emailaddressChanged = emailaddress !== this.referee.getEmailaddress();
    //     this.referee.setEmailaddress(emailaddress ? emailaddress : undefined);
    //     this.referee.setInfo(info ? info : undefined);
    //     this.refereeRepository.editObject(this.referee, this.tournament.getCompetition())
    //         .subscribe(
    //         /* happy path */ refereeRes => {
    //                 if (!emailaddressChanged) {
    //                     this.navigateBack();
    //                     return;
    //                 }
    //                 this.tournamentRepository.syncRefereeRoles(this.tournament).subscribe(
    //                     /* happy path */ allRolesRes => {
    //                         this.navigateBack();
    //                     },
    //                     /* error path */ e => { this.setAlert('danger', e); this.processing = false; },
    //                     /* onComplete */() => this.processing = false
    //                 );
    //             },
    //         /* error path */ e => { this.setAlert('danger', e); this.processing = false; },
    //         /* onComplete */() => { this.processing = false; }
    //         );
    // }

    // navigateBack() {
    //     this.myNavigation.back();
    // }

    // isInitialsDuplicate(initials: string, referee?: Referee): boolean {
    //     const referees = this.tournament.getCompetition().getReferees();
    //     return referees.find(refereeIt => {
    //         return (initials === refereeIt.getInitials() && (referee === undefined || refereeIt.getId() === undefined));
    //     }) !== undefined;
    // }
}

export interface SportValidations {
    minWinPoints: number; // 1
    maxWinPoints: number; // 10
    minDrawPoints: number; // 0
    maxDrawPoints: number; // 5
    minMinutesPerGame: number; // 0
    maxMinutesPerGame: number; // 60
}
