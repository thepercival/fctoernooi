/// <reference types="@angular/localize" />

import { bootstrapApplication } from '@angular/platform-browser';
import { provideRouter } from '@angular/router';
import { provideZonelessChangeDetection } from '@angular/core';
// import { provideHttpClient, withInterceptorsFromDi } from '@angular/common';

import { AppComponent } from './app/app.component';
import { routes } from './app/app.routes';
import { provideModalA11yInitializer } from './app/shared/common/modal-a11y-initializer';

bootstrapApplication(AppComponent, {
  providers: [
    provideRouter(routes),
    provideZonelessChangeDetection(),
    provideModalA11yInitializer(),
    // provideHttpClient(withInterceptorsFromDi())
  ]
}).catch((e: Error) => console.error(e));
