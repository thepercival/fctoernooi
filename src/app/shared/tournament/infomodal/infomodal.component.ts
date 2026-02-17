import { ChangeDetectionStrategy, Component, TemplateRef, inject, input } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { TOURNAMENT_UI_IMPORTS } from '../tournament.ui-imports';
import { EscapeHtmlPipe } from '../../common/escapehtmlpipe';

@Component({
    selector: 'app-ngbd-modal-info',
    templateUrl: './infomodal.component.html',
    styleUrls: ['./infomodal.component.scss'],
    standalone: true,
    imports: [TOURNAMENT_UI_IMPORTS,EscapeHtmlPipe],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class InfoModalComponent {
    readonly _header = input('');
    readonly _modalContent = input.required<TemplateRef<any>>();
    readonly _noHeaderBorder = input(false);
    public activeModal = inject(NgbActiveModal);

    constructor() {

    }

    close(value: string) {
        this.activeModal.close(value);
    }

    get header(): string {
        return this._header();
    }

    get modalContent(): TemplateRef<any> {
        return this._modalContent();
    }

    get noHeaderBorder(): boolean {
        return this._noHeaderBorder();
    }
}