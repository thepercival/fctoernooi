import { Component, Input, OnInit, TemplateRef, ChangeDetectionStrategy, inject } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { NgbActiveModal, NgbAlert, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { Tournament } from '../../lib/tournament';
import { InfoModalComponent } from '../../shared/tournament/infomodal/infomodal.component';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faCopy, faInfoCircle } from '@fortawesome/free-solid-svg-icons';

@Component({
    selector: 'app-ngbd-modal-share-config',
    templateUrl: './sharemodal.component.html',
    styleUrls: ['./sharemodal.component.scss'],
    standalone: true,
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [NgbAlert, FontAwesomeModule, ReactiveFormsModule]
})
export class ShareModalComponent implements OnInit {
    modal = inject(NgbActiveModal);
    private modalService = inject(NgbModal);

    @Input() tournament!: Tournament;
    @Input() publicInitial!: boolean;
    public typedForm: FormGroup<{
        public: FormControl<boolean>,
        url: FormControl<string>,        
      }>;
    copied: boolean = false;
    faCopy = faCopy;
    faInfoCircle = faInfoCircle;    
    constructor() {
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
            activeModal.componentInstance.header = () => 'publiek';
            activeModal.componentInstance.modalContent = () => modalContent;
    }
}
