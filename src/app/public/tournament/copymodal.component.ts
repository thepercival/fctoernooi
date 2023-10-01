import { Component, Input, OnInit, TemplateRef } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { NgbActiveModal, NgbDateStruct, NgbModal, NgbTimeStruct } from '@ng-bootstrap/ng-bootstrap';
import { Tournament } from '../../lib/tournament';
import { InfoModalComponent } from '../../shared/tournament/infomodal/infomodal.component';
import { League } from 'ngx-sport';

@Component({
    selector: 'app-ngbd-modal-copy',
    templateUrl: './copymodal.component.html',
    styleUrls: ['./copymodal.component.scss']
})
export class CopyModalComponent implements OnInit {
    @Input() name!: string;
    @Input() startDateTime!: Date; 
    @Input() showLowCreditsWarning: boolean = false; 
    
    public form: FormGroup<{
        name: FormControl<string>,
        date: FormControl<NgbDateStruct>,
        time: FormControl<NgbTimeStruct>,
        competitors: FormControl<boolean>,
    }>;
    copied: boolean = false;

    validations: any = {
        minlengthname: League.MIN_LENGTH_NAME,
        maxlengthname: League.MAX_LENGTH_NAME
    };
    
    constructor(
        public modal: NgbActiveModal,
        private modalService: NgbModal) {
        const date = new Date();

        this.form = new FormGroup({
            name: new FormControl('', { nonNullable: true,
                validators:
                    [
                        Validators.minLength(this.validations.minlengthname),
                        Validators.maxLength(this.validations.maxlengthname)
                    ] }),
            competitors: new FormControl(false, { nonNullable: true }),
            date: new FormControl(this.toDateStruct(date), { nonNullable: true }),
            time: new FormControl(this.toTimeStruct(date), { nonNullable: true }),
        });
    }

    ngOnInit() {
        this.form.controls.name.setValue(this.name);
        this.form.controls.date.setValue(this.toDateStruct(this.startDateTime));
        this.form.controls.time.setValue(this.toTimeStruct(this.startDateTime));
        this.form.controls.competitors.setValue(false);
    }

    toDateStruct(date: Date): NgbDateStruct {
        return { year: date.getFullYear(), month: date.getMonth() + 1, day: date.getDate() };
    }

    toTimeStruct(date: Date): NgbTimeStruct {
        return { hour: date.getHours(), minute: date.getMinutes(), second: 0 };
    }

    getCopyConfig(): CopyConfig {
        return {
            name: this.form.controls.name.value,
            competitors: this.form.controls.competitors.value,
            startDate: new Date(
                    this.form.controls.date.value.year,
                    this.form.controls.date.value.month - 1,
                    this.form.controls.date.value.day,
                    this.form.controls.time.value.hour,
                    this.form.controls.time.value.minute,
                )
        }
    }
}

export interface CopyConfig {
    name: string;
    competitors: boolean;
    startDate: Date;

}