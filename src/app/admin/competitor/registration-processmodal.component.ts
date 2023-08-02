import { Component } from '@angular/core';
import { NgbActiveModal, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { PlaceCompetitorItem } from '../../lib/ngx-sport/placeCompetitorItem';
import { TournamentRegistration } from '../../lib/tournament/registration';
import { JsonTournamentCompetitor } from '../../lib/competitor/json';
import { CompetitorRepository } from '../../lib/ngx-sport/competitor/repository';
import { Tournament } from '../../lib/tournament';
import { TournamentCompetitor } from '../../lib/competitor';
import { IAlert, IAlertType } from '../../shared/common/alert';
import { RegistrationState } from '../../lib/tournament/registration/state';
import { TournamentRegistrationRepository } from '../../lib/tournament/registration/repository';
import { TournamentRegistrationMapper } from '../../lib/tournament/registration/mapper';

@Component({
    selector: 'app-ngbd-modal-process-tournamentregistration',
    templateUrl: './registration-processmodal.component.html',
    styleUrls: ['./registration-processmodal.component.scss']
})
export class TournamentRegistrationProcessModalComponent {
    tournament!: Tournament;    
    registration!: TournamentRegistration;    
    public competitor: TournamentCompetitor|undefined;
    public processing = false;
    public errorAlert: IAlert|undefined;
    
    constructor(
        private competitorRepository: CompetitorRepository,
        private registrationRepository: TournamentRegistrationRepository,
        private registrationMapper: TournamentRegistrationMapper,
        private modalService: NgbModal,
        public activeModal: NgbActiveModal) { }

    get Accepted(): RegistrationState { return RegistrationState.Accepted; } 
    get Declined(): RegistrationState { return RegistrationState.Declined; }
    get Substitute(): RegistrationState { return RegistrationState.Substitute; }

    accept(): void {
      
        this.processing = true;
        this.errorAlert = undefined;
        this.competitorRepository.createObjectFromRegistration(this.registration, this.tournament)
            .subscribe({
                next: (competitor: TournamentCompetitor) => {
                    this.competitor = competitor;
                    this.registration.setStartLocation(competitor.getStartLocation());
                    this.activeModal.close(RegistrationState.Accepted);
                  },
                  error: (e: string) => {
                      this.errorAlert = { type: IAlertType.Danger, message: e };
                      this.processing = false;
                  },
                  complete: () => this.processing = false
              });          
    }

    substitute() {
        this.updateState(RegistrationState.Substitute);
    }

    decline(): void {
        this.updateState(RegistrationState.Declined);
    }

    updateState(state: RegistrationState): void {
        this.processing = true;
        this.errorAlert = undefined;
        const json = this.registrationMapper.toJson(this.registration, state);
        this.registrationRepository.editObject(json, this.registration, this.tournament)
            .subscribe({
                next: (registration: TournamentRegistration) => {
                    this.registration = registration;
                    this.activeModal.close(this.registration.getState());
                },
                error: (e: string) => {
                    this.errorAlert = { type: IAlertType.Danger, message: e };
                    this.processing = false;
                },
                complete: () => this.processing = false
            });     
    }

    remove(): void {
        this.processing = true;
        this.errorAlert = undefined;
        const json = this.registrationMapper.toJson(this.registration, RegistrationState.Declined);
        this.registrationRepository.removeObject(this.registration, this.tournament)
            .subscribe({
                next: () => {
                    this.activeModal.close(undefined);
                },
                error: (e: string) => {
                    this.errorAlert = { type: IAlertType.Danger, message: e };
                    this.processing = false;
                },
                complete: () => this.processing = false
            });         
    }
  

}
