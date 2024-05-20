import { Component, Input, OnInit, output} from '@angular/core';

import { TournamentRegistrationSettings } from '../../../lib/tournament/registration/settings';
import { TournamentRegistrationRepository } from '../../../lib/tournament/registration/repository';
import { IAlert, IAlertType } from '../../../shared/common/alert';
import { Tournament } from '../../../lib/tournament';
import { TournamentRegistrationTextSubject } from '../../../lib/tournament/registration/text';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { TextEditorModalComponent } from '../../textEditor/texteditormodal.component';
import { Category, StructureNameService } from 'ngx-sport';

@Component({
  selector: 'app-tournament-registrations-nav',
  templateUrl: './nav.component.html',
  styleUrls: ['./nav.component.scss']
})
export class RegistrationsNavComponent implements OnInit {

  @Input() tournament!: Tournament;
  @Input() structureNameService!: StructureNameService;
  @Input() favoriteCategories!: Category[];

  onCompetitorsUpdate = output<void>();
  
  public alert: IAlert | undefined;  
  public activeTab!: number;
  public hasBegun!: boolean;
  public processing: boolean = false;
  public settings: TournamentRegistrationSettings|undefined;

  constructor(
    private modalService: NgbModal,
    private tournamentRegistrationRepository: TournamentRegistrationRepository,
  ) {
   
  }

  ngOnInit() {    
    this.activeTab = RegistrationTab.Settings;

    this.tournamentRegistrationRepository.getSettings(this.tournament, false)
      .subscribe({
        next: (settings: TournamentRegistrationSettings) => {
          this.settings = settings;
          if( settings?.isEnabled() ) {
            this.activeTab = RegistrationTab.List;
          }
          this.processing = false;
        },
        error: (e: string) => {
          this.setAlert(IAlertType.Danger, e + ', instellingen niet gevonden');
          this.processing = false;
        }
      });
  }

  updateSettings(settings: TournamentRegistrationSettings): void {
    this.settings = settings;
  }
 
  get TabRegistrationSettings(): number { return RegistrationTab.Settings; }
  get TabRegistrationList(): number { return RegistrationTab.List; }
  get TabRegistrationForm(): number { return RegistrationTab.Form; }

  public setAlert(type: IAlertType, message: string) {
    this.alert = { 'type': type, 'message': message };
  }
}


export enum RegistrationTab {
  Settings = 10, List, Form
}