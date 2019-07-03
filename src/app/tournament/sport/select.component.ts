import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Competition, Sport, SportConfig, SportCustom, SportRepository } from 'ngx-sport';

import { CSSService } from '../../common/cssservice';

@Component({
    selector: 'app-tournament-sport-select',
    templateUrl: './select.component.html',
    styleUrls: ['./select.component.css']
})
export class SportSelectComponent implements OnInit {
    @Input() competition: Competition;
    @Output() finish = new EventEmitter<SportConfig>();


    // this.finish.emit(sportConfig);

    form: FormGroup;

    public inputType = 'select'; // or new
    public radioGroupForm: FormGroup;


    constructor(
        public cssService: CSSService,
        private sportRepository: SportRepository,
        route: ActivatedRoute,
        router: Router,
        fb: FormBuilder
    ) {
        this.form = fb.group({
            search: ['', Validators.compose([
                Validators.required,
                Validators.minLength(Sport.MIN_LENGTH_NAME),
                Validators.maxLength(Sport.MAX_LENGTH_NAME)
            ])]
        });
        this.radioGroupForm = fb.group({
            model: 1
        });
    }

    ngOnInit() {
        console.log(SportCustom.get());

    }

    getSportsToShow(): Sport[] {
        return [];
        // if (id === undefined || id === 0) {
        //     this.processing = false;
        //     return;
        // }
        // return this.tournament.getCompetition().getSportConfigs().find(sportConfig => id === sportConfig.getId());
    }

    // private postInit(id: number) {

    //     const sports = this.tournament.getCompetition().getSports();
    //     // sports is filter for list



    // this.sportConfig = this.getSportConfigById(id);
    // if (this.sportConfig === undefined) {
    //     this.processing = false;
    //     return;
    // }

    // this.form.controls.initials.setValue(this.referee.getInitials());
    // this.form.controls.name.setValue(this.referee.getName());
    // this.form.controls.emailaddress.setValue(this.referee.getEmailaddress());
    // this.form.controls.info.setValue(this.referee.getInfo());
    //     this.processing = false;
    // }


}
