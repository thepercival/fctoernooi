import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Competition, JsonSport, Sport, SportRepository } from 'ngx-sport';

import { IAlert } from '../../common/alert';
import { CSSService } from '../../common/cssservice';

@Component({
    selector: 'app-tournament-sport-select',
    templateUrl: './select.component.html',
    styleUrls: ['./select.component.css']
})
export class SportSelectComponent implements OnInit {
    @Input() competition: Competition;
    @Output() sendSport = new EventEmitter<Sport>();
    processing = false;
    form: FormGroup;
    public radioGroupForm: FormGroup;
    public alert: IAlert;

    constructor(
        public cssService: CSSService,
        private sportRepository: SportRepository,
        route: ActivatedRoute,
        router: Router,
        fb: FormBuilder
    ) {
        this.form = fb.group({
            newSportName: ['', Validators.compose([
                Validators.required,
                Validators.minLength(Sport.MIN_LENGTH_NAME),
                Validators.maxLength(Sport.MAX_LENGTH_NAME)
            ])],
            team: true
        });
        this.radioGroupForm = fb.group({
            inputtype: 'select'
        });
    }

    ngOnInit() {

    }

    getSportsToShow(): Sport[] {
        return [];
        // if (id === undefined || id === 0) {
        //     this.processing = false;
        //     return;
        // }
        // return this.tournament.getCompetition().getSportConfigs().find(sportConfig => id === sportConfig.getId());
    }

    protected setAlert(type: string, message: string) {
        this.alert = { 'type': type, 'message': message };
    }

    save() {
        this.processing = true;
        const json: JsonSport = { name: this.form.value['newSportName'], team: this.form.value['newSportName'] };
        this.sportRepository.createObject(json).subscribe(
            /* happy path */ sportRes => {
                this.sendSport.emit(sportRes);
            },
            /* error path */ e => {
                this.setAlert('danger', 'de toernooi-indeling kon niet worden aangemaakt: ' + e);
                this.processing = false;
            },
            /* onComplete */() => this.processing = false
        );
    }
    // private postInit(id: number) {

    //     const sports = this.tournament.getCompetition().getSports();
    //     // sports is filter for list
}
