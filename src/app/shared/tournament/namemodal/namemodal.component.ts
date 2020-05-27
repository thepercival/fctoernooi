import { Component, Input, OnInit } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { VoetbalRange } from 'ngx-sport';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

@Component({
    selector: 'app-ngbd-modal-name',
    templateUrl: './namemodal.component.html',
    styleUrls: ['./namemodal.component.scss']
})
export class NameModalComponent implements OnInit {
    @Input() header: string;
    @Input() range: VoetbalRange;
    @Input() initialName: string;
    @Input() labelName: string;
    @Input() buttonName: string;
    @Input() buttonOutline: boolean;
    form: FormGroup;

    constructor(public activeModal: NgbActiveModal, private fb: FormBuilder) {
        this.form = fb.group({
            name: ''
        });
    }

    ngOnInit() {
        this.form.get('name').setValidators(
            Validators.compose([
                Validators.required,
                Validators.minLength(this.range.min),
                Validators.maxLength(this.range.max)
            ]));
        this.form.controls.name.setValue(this.initialName);
    }
}
