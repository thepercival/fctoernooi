import { Component, OnInit, input, output} from '@angular/core';

import { TournamentRegistrationSettings } from '../../../lib/tournament/registration/settings';
import { TournamentRegistrationRepository } from '../../../lib/tournament/registration/repository';
import { IAlert, IAlertType } from '../../../shared/common/alert';
import { Tournament } from '../../../lib/tournament';
import { Category, StructureNameService } from 'ngx-sport';
import { RegistrationTab } from '../../../shared/common/tab-ids';

@Component({
  selector: 'app-tournament-registrations-nav',
  templateUrl: './nav.component.html',
  styleUrls: ['./nav.component.scss']
})
export class RegistrationsNavComponent implements OnInit {

  tournament = input.required<Tournament>();
  structureNameService = input.required<StructureNameService>();
  favoriteCategories = input.required<Category[]>();
  startTab = input<RegistrationTab>();

  onCompetitorsUpdate = output<void>();
  
  public alert: IAlert | undefined;
  public activeTab = RegistrationTab.Settings;
  public hasBegun!: boolean;
  public processing: boolean = false;
  public settings: TournamentRegistrationSettings|undefined;

  constructor(
    private tournamentRegistrationRepository: TournamentRegistrationRepository,
  ) {
   
  }

  ngOnInit() {   
    const startTab = this.startTab(); 
    if (startTab !== undefined ) {
      this.activeTab = startTab;
    }
    console.log(this.activeTab);

    
    this.tournamentRegistrationRepository.getSettings(this.tournament(), false)
      .subscribe({
        next: (settings: TournamentRegistrationSettings) => {
          this.settings = settings;
          if ( startTab === undefined && settings?.isEnabled() ) {
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
 
  get TabRegistrationSettings(): number { return RegistrationTab.Settings; }
  get TabRegistrationList(): number { return RegistrationTab.List; }
  get TabRegistrationForm(): number { return RegistrationTab.Form; }

  public setAlert(type: IAlertType, message: string) {
    this.alert = { 'type': type, 'message': message };
  }
}


