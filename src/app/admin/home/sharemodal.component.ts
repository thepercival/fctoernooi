import { Component, Input, OnInit, TemplateRef } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
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
    copied: boolean = false;
    form: FormGroup;

    constructor(
        public modal: NgbActiveModal,
        private modalService: NgbModal,
        formBuilder: FormBuilder) {
        this.form = formBuilder.group({
            url: [{ value: '', disabled: true }, Validators.compose([
            ])],
            public: ['', Validators.compose([
            ])]
        });
    }

    ngOnInit() {
        this.form.controls.url.setValue(location.origin + '/' + this.tournament.getId());
        this.form.controls.public.setValue(this.tournament.getPublic());
    }

    save(): boolean {
        return this.form.controls.public.value;
    }

    openInfoModal(modalContent: TemplateRef<any>) {
        const activeModal = this.modalService.open(InfoModalComponent, { windowClass: 'info-modal' });
        activeModal.componentInstance.header = 'publiek';
        activeModal.componentInstance.modalContent = modalContent;
    }
}
