import { Component, Input, OnInit, TemplateRef } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { NgbActiveModal, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { Tournament } from '../../lib/tournament';
import { InfoModalComponent } from '../../shared/tournament/infomodal/infomodal.component';

@Component({
    selector: 'app-ngbd-modal-share-config',
    templateUrl: './sharemodal.component.html',
    styleUrls: ['./sharemodal.component.scss']
})
export class ShareModalComponent implements OnInit {
    @Input() tournament!: Tournament;
    @Input() publicInitial!: boolean;
    public typedForm: FormGroup<{
        public: FormControl<boolean>,
        url: FormControl<string>,        
      }>;
    copied: boolean = false;
    
    constructor(
        public modal: NgbActiveModal,
        private modalService: NgbModal) {
        this.typedForm = new FormGroup({
            public: new FormControl(false, { nonNullable: true }),
            url: new FormControl('', { nonNullable: true })            
        });
        this.typedForm.controls.url.disable({onlySelf: true});
    }

    ngOnInit() {
        this.typedForm.controls.url.setValue(location.origin + '/' + this.tournament.getId());
        this.typedForm.controls.public.setValue(this.tournament.getPublic());
    }

    save(): boolean {
        return this.typedForm.controls.public.value;
    }

    getButtonLabel(): string {
        if (this.publicInitial === false && this.typedForm.controls.public.value === true) {
            return 'opslaan & homepagina aanpassen';
        }
        return 'opslaan';
    }

    openInfoModal(modalContent: TemplateRef<any>) {
        const activeModal = this.modalService.open(InfoModalComponent, { windowClass: 'info-modal' });
        activeModal.componentInstance.header = 'publiek';
        activeModal.componentInstance.modalContent = modalContent;
    }
}
