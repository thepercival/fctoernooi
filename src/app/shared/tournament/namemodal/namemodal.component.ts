import { ChangeDetectionStrategy, Component, OnInit, input } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { VoetbalRange } from 'ngx-sport';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { TOURNAMENT_UI_IMPORTS } from '../tournament.ui-imports';

@Component({
    selector: 'app-ngbd-modal-name',
    templateUrl: './namemodal.component.html',
    styleUrls: ['./namemodal.component.scss'],
    standalone: true,
    imports: [TOURNAMENT_UI_IMPORTS],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class NameModalComponent implements OnInit {
    readonly _header = input.required<string>();
    readonly _range = input.required<VoetbalRange>();
    readonly _initialName = input.required<string>();
    readonly _labelName = input.required<string>();
    readonly _buttonName = input.required<string>();
    readonly _buttonOutline = input.required<boolean>();
    form: FormGroup;
    readonly _placeHolder = input<string | undefined>(undefined);

    private activeModal = inject(NgbActiveModal);

    constructor() {
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

    get header(): string {
        return this._header();
    }

    get range(): VoetbalRange {
        return this._range();
    }

    get initialName(): string {
        return this._initialName();
    }

    get labelName(): string {
        return this._labelName();
    }

    get buttonName(): string {
        return this._buttonName();
    }

    get buttonOutline(): boolean {
        return this._buttonOutline();
    }

    get placeHolder(): string | undefined {
        return this._placeHolder();
    }
}
