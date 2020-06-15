import { Component, OnInit, Input } from '@angular/core';
import { SportConfig, Structure, SportCustom } from 'ngx-sport';

import { IAlert } from '../../../shared/common/alert';

import { Tournament } from '../../../lib/tournament';
import { FormBuilder, Validators, FormGroup } from '@angular/forms';
import { SportConfigRepository } from '../../../lib/ngx-sport/sport/config/repository';

@Component({
    selector: 'app-tournament-points-edit',
    templateUrl: './points.component.html',
    styleUrls: ['./points.component.scss']
})
export class PointsEditComponent implements OnInit {

    alert: IAlert;
    processing: boolean;
    @Input() tournament: Tournament;
    @Input() structure: Structure;
    @Input() sportConfig: SportConfig;
    @Input() hasBegun: boolean;

    form: FormGroup;
    ranges: any = {};
    validations: SportValidations = {
        minWinPoints: 1,
        maxWinPoints: 10,
        minDrawPoints: 0,
        maxDrawPoints: 5,
        minLosePoints: 0,
        maxLosePoints: 5,
        minMinutesPerGame: 0,
        maxMinutesPerGame: 60,
    };

    constructor(
        private sportConfigRepository: SportConfigRepository,
        fb: FormBuilder,
    ) {
        this.processing = true;

        this.form = fb.group({
            winPoints: ['', Validators.compose([
                Validators.required,
                Validators.min(this.validations.minWinPoints),
                Validators.max(this.validations.maxWinPoints)
            ])],
            drawPoints: ['', Validators.compose([
                Validators.required,
                Validators.min(this.validations.minDrawPoints),
                Validators.max(this.validations.maxDrawPoints)
            ])],
            winPointsExt: ['', Validators.compose([
                Validators.required,
                Validators.min(this.validations.minWinPoints),
                Validators.max(this.validations.maxWinPoints)
            ])],
            drawPointsExt: ['', Validators.compose([
                Validators.required,
                Validators.min(this.validations.minDrawPoints),
                Validators.max(this.validations.maxDrawPoints)
            ])],
            losePointsExt: ['', Validators.compose([
                Validators.required,
                Validators.min(this.validations.minLosePoints),
                Validators.max(this.validations.maxLosePoints)
            ])],
            nrOfFields: ['']
        });
    }

    initRanges() {
        this.ranges.winPoints = [];
        for (let i = this.validations.minWinPoints; i <= this.validations.maxWinPoints; i++) {
            this.ranges.winPoints.push(i);
        }
        this.ranges.drawPoints = [];
        for (let i = this.validations.minDrawPoints; i <= this.validations.maxDrawPoints; i++) {
            this.ranges.drawPoints.push(i);
        }
        this.ranges.losePoints = [];
        for (let i = this.validations.minLosePoints; i <= this.validations.maxLosePoints; i++) {
            this.ranges.losePoints.push(i);
        }
        const sport = this.sportConfig.getSport();
        if (sport.getCustomId() === SportCustom.Chess) {
            this.ranges.drawPoints.push(0.5);
            this.ranges.drawPoints.sort();
        }
        this.ranges.nrOfFields = [];
        for (let i = 0; i <= 5; i++) {
            this.ranges.nrOfFields.push(i);
        }
    }

    ngOnInit() {
        if (this.hasBegun) {
            this.alert = { type: 'warning', message: 'er zijn al wedstrijden gespeeld, je kunt niet meer toevoegen en verwijderen' };
        }
        this.initForm();
        this.processing = false;
    }

    initForm() {
        this.initRanges();
        this.form.controls.winPoints.setValue(this.sportConfig.getWinPoints());
        this.form.controls.drawPoints.setValue(this.sportConfig.getDrawPoints());
        this.form.controls.winPointsExt.setValue(this.sportConfig.getWinPointsExt());
        this.form.controls.drawPointsExt.setValue(this.sportConfig.getDrawPointsExt());
        this.form.controls.losePointsExt.setValue(this.sportConfig.getLosePointsExt());
        this.form.controls.nrOfFields.setValue(1);
        if (this.hasBegun) {
            Object.keys(this.form.controls).forEach(key => {
                this.form.controls[key].disable();
            });
        }
    }

    edit(): boolean {
        this.processing = true;

        this.sportConfig.setWinPoints(this.form.value['winPoints']);
        this.sportConfig.setDrawPoints(this.form.value['drawPoints']);
        this.sportConfig.setWinPointsExt(this.form.value['winPointsExt']);
        this.sportConfig.setDrawPointsExt(this.form.value['drawPointsExt']);
        this.sportConfig.setLosePointsExt(this.form.value['losePointsExt']);

        this.sportConfigRepository.editObject(this.sportConfig, this.tournament)
            .subscribe(
            /* happy path */ sportConfigRes => {

                },
            /* error path */ e => { this.alert = { type: 'danger', message: e }; this.processing = false; },
            /* onComplete */() => { this.processing = false; }
            );
        return false;
    }

    linkToPlanningConfig() {
        const roundNumber = this.structure.getFirstRoundNumber().getNumber();
        // this.router.navigate(['/admin/planningconfig', this.tournament.getId(), roundNumber]);
    }
}

export interface SportValidations {
    minWinPoints: number; // 1
    maxWinPoints: number; // 10
    minDrawPoints: number; // 0
    maxDrawPoints: number; // 5
    minLosePoints: number; // 0
    maxLosePoints: number; // 5
    minMinutesPerGame: number; // 0
    maxMinutesPerGame: number; // 60
}