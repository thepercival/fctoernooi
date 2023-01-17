import { Component, Input, OnInit } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { VoetbalRange } from 'ngx-sport';
import { FormControl, FormGroup, Validators } from '@angular/forms';

@Component({
    selector: 'app-ngbd-modal-name',
    templateUrl: './namemodal.component.html',
    styleUrls: ['./namemodal.component.scss']
})
export class NameModalComponent implements OnInit {
    @Input() header!: string;
    @Input() range!: VoetbalRange;
    @Input() initialName!: string;
    @Input() labelName!: string;
    @Input() buttonName!: string;
    @Input() buttonOutline!: boolean;
    form: FormGroup;
    @Input() placeHolder: string | undefined;

    constructor(public activeModal: NgbActiveModal) {
        this.form = new FormGroup({
            name: new FormControl('')
        });
    }

    getPlaceHolder(): string {
        return this.placeHolder ?? 'max ' + this.range.max + ' karakters';
    }

    ngOnInit() {
        this.form.get('name')?.setValidators(
            Validators.compose([
                Validators.required,
                Validators.minLength(this.range.min),
                Validators.maxLength(this.range.max)
            ]));
        this.form.controls.name.setValue(this.initialName);
    }
}
