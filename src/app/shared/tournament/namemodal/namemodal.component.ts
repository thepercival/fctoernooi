import { ChangeDetectionStrategy, Component, InjectionToken, OnInit, inject } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { VoetbalRange } from 'ngx-sport';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { TOURNAMENT_UI_IMPORTS } from '../tournament.ui-imports';

export interface NameModalData {
    header: string;
    range: VoetbalRange;
    initialName?: string;
    labelName: string;
    buttonName: string;
    buttonOutline?: boolean;
    placeHolder?: string;
}

export const NAME_MODAL_DATA = new InjectionToken<NameModalData>('NAME_MODAL_DATA');

@Component({
    selector: 'app-ngbd-modal-name',
    templateUrl: './namemodal.component.html',
    styleUrls: ['./namemodal.component.scss'],
    standalone: true,
    imports: [TOURNAMENT_UI_IMPORTS],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class NameModalComponent implements OnInit {
    readonly data = inject(NAME_MODAL_DATA);
    form: FormGroup;

    public activeModal = inject(NgbActiveModal);

    constructor() {
        this.form = new FormGroup({
            name: new FormControl('')
        });
    }

    getPlaceHolder(): string {
        return this.data.placeHolder ?? 'max ' + this.data.range.max + ' karakters';
    }

    ngOnInit() {
        this.form.get('name')?.setValidators(
            Validators.compose([
                Validators.required,
                    Validators.minLength(this.data.range.min),
                    Validators.maxLength(this.data.range.max)
            ]));
        this.form.controls.name.setValue(this.data.initialName ?? '');
    }
}
