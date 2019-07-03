import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { SportConfig, SportConfigRepository, SportCustom, StructureRepository } from 'ngx-sport';

import { CSSService } from '../../common/cssservice';
import { MyNavigation } from '../../common/navigation';
import { TournamentRepository } from '../../lib/tournament/repository';
import { TournamentComponent } from '../component';

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
        private sportConfigRepository: SportConfigRepository,
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
        this.form = fb.group({
            winPoints: ['', Validators.compose([
                Validators.required,
                Validators.minLength(this.validations.minWinPoints),
                Validators.maxLength(this.validations.maxWinPoints)
            ])],
            drawPoints: ['', Validators.compose([
                Validators.required,
                Validators.minLength(this.validations.minDrawPoints),
                Validators.maxLength(this.validations.maxDrawPoints)
            ])]
            /*,
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
        this.ranges.drawPoints = [];
        for (let i = this.validations.minDrawPoints; i <= this.validations.maxDrawPoints; i++) {
            this.ranges.drawPoints.push(i);
        }
        const sport = this.sportConfig.getSport();
        if (sport.getCustomId() === SportCustom.Chess) {
            this.ranges.drawPoints.push(0.5);
            this.ranges.drawPoints.sort();
        }
    }

    ngOnInit() {
        this.route.params.subscribe(params => {
            console.log(params.sportConfigId);
            if (params.sportConfigId !== undefined) {
                super.myNgOnInit(() => this.postInit(+params.sportConfigId), true);
            }
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
            this.setAlert('danger', 'de sport kan niet gevonden worden');
            return;
        }
        this.initRanges();
        this.form.controls.winPoints.setValue(this.sportConfig.getWinPoints());
        this.form.controls.drawPoints.setValue(this.sportConfig.getDrawPoints());
        this.processing = false;
    }

    onAddSportConfig(sportConfig: SportConfig) {
        this.sportConfig = sportConfig;
    }

    save(): boolean {
        this.setAlert('info', 'de sport wordt gewijzigd');

        this.sportConfig.setWinPoints(this.form.controls.winPoints.value);
        this.sportConfig.setDrawPoints(this.form.controls.drawPoints.value);
        this.sportConfigRepository.editObject(this.sportConfig, this.tournament.getCompetition())
            .subscribe(
            /* happy path */ sportRes => {
                    // if (!emailaddressChanged) {
                    this.navigateBack();
                    // return;
                    // }
                    // this.tournamentRepository.syncRefereeRoles(this.tournament).subscribe(
                    //     /* happy path */ allRolesRes => {
                    //         this.navigateBack();
                    //     },
                    //     /* error path */ e => { this.setAlert('danger', e); this.processing = false; },
                    //     /* onComplete */() => this.processing = false
                    // );
                },
            /* error path */ e => { this.setAlert('danger', e); this.processing = false; },
            /* onComplete */() => { this.processing = false; }
            );
        return false;
    }

    navigateBack() {
        this.myNavigation.back();
    }
}

export interface SportValidations {
    minWinPoints: number; // 1
    maxWinPoints: number; // 10
    minDrawPoints: number; // 0
    maxDrawPoints: number; // 5
    minMinutesPerGame: number; // 0
    maxMinutesPerGame: number; // 60
}
