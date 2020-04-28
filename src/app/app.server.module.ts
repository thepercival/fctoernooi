import { NgModule } from '@angular/core';
import { ServerModule } from '@angular/platform-server';

import { AppModule } from './app.module';
import { ServerBootstrapComponent } from './serverbootstrap.component';

@NgModule({
  imports: [
    AppModule,
    ServerModule,
  ],
  bootstrap: [ServerBootstrapComponent],
})
export class AppServerModule { }
