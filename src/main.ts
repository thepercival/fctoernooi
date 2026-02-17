import { enableProdMode } from '@angular/core';
import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';

import { AppComponent } from './app.component';
import { provideRouter, Router, RouterOutlet } from '@angular/router';
import { routes } from './app-routing.module';
import { provideExperimentalZonelessChangeDetection } from '@angular/core';
import { AuthService } from './lib/auth/auth.service';
import { AuthUserGuardService } from './lib/auth/auth-user-guard.service';
import { PoolShellRepository } from './poolmodule/pool-shell.repository';
import { UserMapper } from './usermodule/user.mapper';
import { MyNavigation } from './shared/common/navigation';
import { GlobalEventsManager } from './shared/common/global-events-manager.service';
import { StartSessionService } from './shared/startsession/start-session.service';
import { TournamentShellRepository } from './tournamentmodule/tournament-shell.repository';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { environment } from './environments/environment';

if (environment.production) {
  enableProdMode();
}


bootstrapApplication(AppComponent, {
  providers: [
    provideRouter(routes),
    provideExperimentalZonelessChangeDetection(),
    RouterOutlet,
    Router,
    AuthService,
    AuthUserGuardService,
    PoolShellRepository,
    UserMapper,
    MyNavigation,
    GlobalEventsManager,
    StartSessionService,
    TournamentShellRepository
    provideHttpClient(withInterceptorsFromDi())
  ],
}).catch((e) => console.error(e));
