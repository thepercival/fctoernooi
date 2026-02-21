import { Component, input, ChangeDetectionStrategy, TemplateRef, inject } from '@angular/core';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { EscapeHtmlPipe } from '../../common/escapehtmlpipe';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

@Component({
    selector: 'app-infomodal',
    templateUrl: './infomodal.component.html',
    standalone: true,
    imports: [FontAwesomeModule,EscapeHtmlPipe],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class InfoModalComponent {
    public modalContent = input.required<TemplateRef<any>>();
    public activeModal = inject(NgbActiveModal);

    public header = input.required<string>();
    public noHeaderBorder = input(false);
    
    constructor() {
    }

    close(value: string) {
        this.activeModal.close(value);
    }
}