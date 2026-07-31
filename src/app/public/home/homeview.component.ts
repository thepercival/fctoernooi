import { Component, OnInit, ChangeDetectionStrategy, inject } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

import { TournamentRepository } from '../../lib/tournament/repository';
import { StructureRepository } from '../../lib/ngx-sport/structure/repository';
import { TournamentComponent } from '../../shared/tournament/component';
import { AuthService } from '../../lib/auth/auth.service';
import { Role } from '../../lib/role';
import { TournamentMapper } from '../../lib/tournament/mapper';
import { GlobalEventsManager } from '../../shared/common/eventmanager';
import { TournamentScreen } from '../../shared/tournament/screenNames';
import { TournamentRuleRepository } from '../../lib/tournament/rule/repository';
import { JsonTournamentRule } from '../../lib/tournament/rule/json';
import { SponsorRepository } from '../../lib/sponsor/repository';
import { Sponsor } from '../../lib/sponsor';
import { IAlertType } from '../../shared/common/alert';
import { TournamentRegistrationRepository } from '../../lib/tournament/registration/repository';
import { TournamentRegistrationSettings } from '../../lib/tournament/registration/settings';
import { DateFormatter } from '../../lib/dateFormatter';
import { combineLatest } from 'rxjs';
import { Tournament } from '../../lib/tournament';
import { WebsitePart } from '../../shared/tournament/structure/admin-public-switcher.component';
import { DefaultJsonTheme } from '../../lib/tournament/theme';
import { AdminPublicSwitcherComponent } from '../../shared/tournament/structure/admin-public-switcher.component';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { NgbAlert } from '@ng-bootstrap/ng-bootstrap';
import { TournamentNavBarComponent } from '../../shared/tournament/tournamentNavBar/tournamentNavBar.component';
import { RouterModule } from '@angular/router';
import { faSpinner } from '@fortawesome/free-solid-svg-icons';

@Component({
    selector: 'app-tournament-home-view',
    templateUrl: './homeview.component.html',
    styleUrls: ['./homeview.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [FontAwesomeModule, NgbAlert, AdminPublicSwitcherComponent, TournamentNavBarComponent, RouterModule]
    
})
export class HomeViewComponent extends TournamentComponent implements OnInit {
    private sponsorRepository = inject(SponsorRepository);
    private rulesRepository = inject(TournamentRuleRepository);
    private tournamentRegistrationRepository = inject(TournamentRegistrationRepository);
    protected tournamentMapper = inject(TournamentMapper);
    protected authService = inject(AuthService);
    dateFormatter = inject(DateFormatter);

    faSpinner = faSpinner;
    public rules: JsonTournamentRule[] = [];
    public settings: TournamentRegistrationSettings|undefined;
    constructor() {
        const route = inject(ActivatedRoute);
        const router = inject(Router);
        const tournamentRepository = inject(TournamentRepository);
        const structureRepository = inject(StructureRepository);
        const globalEventsManager = inject(GlobalEventsManager);

        super(route, router, tournamentRepository, structureRepository, globalEventsManager);
    }

    ngOnInit() {
        super.myNgOnInit(() => {           
            const obsRules = this.rulesRepository.getObjects(this.tournament);
            const obsSettings = this.tournamentRegistrationRepository.getSettings(this.tournament, true);
            combineLatest([obsRules, obsSettings]).subscribe(
                ([rules, settings]) => {
                    this.rules = rules; 
                    this.settings = settings;
                    this.globalEventsManager.updateDataInNavBar.emit({
                        title: this.tournament.getName(),
                        atHome: false,
                        theme: this.tournament.getTheme() ?? DefaultJsonTheme
                    });
                    this.processing.set(false);
                })
        });
    }

    get HomeScreen(): TournamentScreen { return TournamentScreen.Home }
    get PublicWebsitePart(): WebsitePart { return WebsitePart.Public }

    isAdmin(): boolean {
        return this.authService.loggedInUserHasRole(this.tournament, Role.Admin);
    }

    public showRegistration(settings: TournamentRegistrationSettings): boolean{
        const weekBeforeStart = (new Date(this.tournament.getCompetition().getStartDateTime()));
        weekBeforeStart.setDate(weekBeforeStart.getDate() - 7);
        return this.registrateIsActive(settings) && (new Date()).getTime() < weekBeforeStart.getTime();
    }
    
    public registrateIsActive(settings: TournamentRegistrationSettings): boolean { 
        return settings.isEnabled() && (new Date()).getTime() < settings.getEnd().getTime()
    }

    public registrateIsInActive(settings: TournamentRegistrationSettings): boolean { 
        return settings.isEnabled() && (new Date()).getTime() > settings.getEnd().getTime()
    }

    locationIsCoordinate(location: string|undefined): boolean {
        if (location === undefined) {
            return false;
        }
        const parts = location.split(',')
        return parts.length === 2 && parts.every((part: string) => !isNaN(+part) );
    }

    getMapsUrl(location: string|undefined): string {

        if (location === undefined ) {
            return '#';
        }
        if (this.locationIsCoordinate(location) ) {
            return 'https://www.google.com/maps/place/' + location;
        }
        return 'https://maps.google.com/?q=' + location;
    }

    getSponsorLogoUrl(sponsor: Sponsor): string {
        return this.sponsorRepository.getLogoUrl(sponsor, 200);
    }
}
