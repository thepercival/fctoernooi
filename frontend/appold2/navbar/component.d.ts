import { AuthenticationService } from '../auth/service';
import { GlobalEventsManager } from "./../global-events-manager";
export declare class NavbarComponent {
    private authenticationService;
    private globalEventsManager;
    title: string;
    showCompetitionSeasonDetails: boolean;
    constructor(authenticationService: AuthenticationService, globalEventsManager: GlobalEventsManager);
}
