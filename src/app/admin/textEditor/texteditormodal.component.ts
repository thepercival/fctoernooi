import { Component, OnInit } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { TournamentCompetitor } from '../../lib/competitor';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { TournamentRegistrationRepository } from '../../lib/tournament/registration/repository';
import { Tournament } from '../../lib/tournament';
import { TournamentRegistrationTextSubject } from '../../lib/tournament/registration/text';
import { IAlert, IAlertType } from '../../shared/common/alert';

@Component({
    selector: 'app-ngbd-modal-texteditor',
    templateUrl: './texteditormodal.component.html',
    styleUrls: ['./texteditormodal.component.scss']
})
export class TextEditorModalComponent implements OnInit {
    public initialText!: string;
    public header!: string;
    public tournament!: Tournament;
    public subject!: TournamentRegistrationTextSubject;
    public alert: IAlert = { type: IAlertType.Info, message : 'tekst tussen vierkante haken wordt automatisch vervangen'};

    public form: FormGroup<{
        text: FormControl<string>,
    }>|undefined;
    
    
    constructor(
        private registrationRepository: TournamentRegistrationRepository,
        public activeModal: NgbActiveModal) { }

    ngOnInit(): void {
        this.form = new FormGroup({            
            text: new FormControl(this.initialText, {
                nonNullable: true
            }),
        });

    }

    getText(): string {
        let text = this.form?.controls?.text?.value ?? '';
        return text.split('[tournamentName]').join(this.tournament.getName()); 
    }

    setCopyAlert() {
        this.alert = { type: IAlertType.Success, message: 'de tekst is naar het klembord gekopiëerd' }
    }

    save(): boolean {

         this.registrationRepository.editText(this.getText(), this.tournament, this.subject)
                .subscribe({
                  next: (text: string) => {
                    this.initialText = text;
                    // this.copied = false;
                    this.alert = { type: IAlertType.Success, message: 'de tekst is opgeslagen' }
                  }
                });

        return false;
    }

}
