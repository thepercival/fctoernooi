import { Component, OnInit, WritableSignal, input, output, signal, ChangeDetectionStrategy } from '@angular/core';

import { TournamentRegistrationSettings } from '../../../lib/tournament/registration/settings';
import { TournamentRegistrationRepository } from '../../../lib/tournament/registration/repository';
import { IAlert, IAlertType } from '../../../shared/common/alert';
import { Tournament } from '../../../lib/tournament';
import { Category, StructureNameService } from 'ngx-sport';
import { RegistrationTab } from '../../../shared/common/tab-ids';
import { RegistrationListComponent } from "./list.component";
import { RegistrationFormComponent } from "./form.component";
import { RegistrationSettingsComponent } from "./settings.component";
import { NgbNav, NgbNavContent, NgbNavItem, NgbNavLink, NgbNavOutlet } from '@ng-bootstrap/ng-bootstrap';

@Component({
    selector: 'app-tournament-registrations-nav',
    templateUrl: './nav.component.html',
    styleUrls: ['./nav.component.scss'],
    changeDetection: ChangeDetectionStrategy.Eager,
    imports: [RegistrationListComponent, RegistrationFormComponent, RegistrationSettingsComponent, NgbNav, NgbNavItem, NgbNavLink, NgbNavContent, NgbNavOutlet],
    
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
  public readonly processing: WritableSignal<boolean> = signal(true);
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

    
    this.tournamentRegistrationRepository.getSettings(this.tournament(), false)
      .subscribe({
        next: (settings: TournamentRegistrationSettings) => {
          this.settings = settings;
          this.processing.set(false);
        },
        error: (e: string) => {
          this.setAlert(IAlertType.Danger, e + ', instellingen niet gevonden');
          this.processing.set(false);
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


