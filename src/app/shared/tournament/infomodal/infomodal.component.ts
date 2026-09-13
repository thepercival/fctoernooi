import { Component, ChangeDetectionStrategy, TemplateRef, inject } from '@angular/core';
import { NgClass, NgTemplateOutlet } from '@angular/common';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { EscapeHtmlPipe } from '../../common/escapehtmlpipe';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { faInfoCircle } from '@fortawesome/free-solid-svg-icons';
import { INFO_MODAL_INPUTS } from '../../modal-input-interfaces/info-modal-inputs.interface';

@Component({
    selector: 'app-infomodal',
    templateUrl: './infomodal.component.html',
    standalone: true,
    imports: [NgClass, NgTemplateOutlet, FontAwesomeModule,EscapeHtmlPipe],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class InfoModalComponent {
    private readonly modalInputs = inject(INFO_MODAL_INPUTS, { optional: true });
    private modalContentRaw!: TemplateRef<any> | (() => TemplateRef<any>);
    private headerRaw: string | (() => string) = '';
    public noHeaderBorder = false;

    public get modalContent(): TemplateRef<any> {
        return (typeof this.modalContentRaw === 'function') ? this.modalContentRaw() : this.modalContentRaw;
    }
    public set modalContent(value: TemplateRef<any> | (() => TemplateRef<any>)) {
        this.modalContentRaw = value;
    }

    public get header(): string {
        return (typeof this.headerRaw === 'function') ? this.headerRaw() : this.headerRaw;
    }
    public set header(value: string | (() => string)) {
        this.headerRaw = value;
    }
    
    faInfoCircle = faInfoCircle;
    public activeModal = inject(NgbActiveModal);
    
    
    constructor() {
        if (this.modalInputs) {
            this.modalContent = this.modalInputs.modalContent;
            this.header = this.modalInputs.header;
            this.noHeaderBorder = this.modalInputs.noHeaderBorder ?? false;
        }
    }

    close(value: string) {
        this.activeModal.close(value);
    }
}