import { Component, input, ChangeDetectionStrategy, TemplateRef, inject } from '@angular/core';
import { NgClass, NgTemplateOutlet } from '@angular/common';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { EscapeHtmlPipe } from '../../common/escapehtmlpipe';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { faInfoCircle } from '@fortawesome/free-solid-svg-icons';

@Component({
    selector: 'app-infomodal',
    templateUrl: './infomodal.component.html',
    standalone: true,
    imports: [NgClass, NgTemplateOutlet, FontAwesomeModule,EscapeHtmlPipe],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class InfoModalComponent {
    public modalContent = input.required<TemplateRef<any>>();
    public header = input.required<string>();
    public noHeaderBorder = input(false);
    
    faInfoCircle = faInfoCircle;
    public activeModal = inject(NgbActiveModal);
    
    
    constructor() {
    }

    close(value: string) {
        this.activeModal.close(value);
    }
}