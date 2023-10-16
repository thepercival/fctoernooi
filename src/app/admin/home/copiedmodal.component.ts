import { Component, Input } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

@Component({
    selector: 'app-ngbd-modal-copied',
    templateUrl: './copiedmodal.component.html',
    styleUrls: ['./copiedmodal.component.scss']
})
export class CopiedModalComponent {
    @Input() previousId!: string;
    @Input() title!: string; 
    
    constructor(public modal: NgbActiveModal) {
        
    }

    
}
