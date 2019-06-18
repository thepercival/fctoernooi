import { enableProdMode } from '@angular/core';
import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';
import { APIConfig } from 'ngx-sport';

import { AppModule } from './app/app.module';
import { environment } from './environments/environment';

if (environment.production) {
  enableProdMode();
}

APIConfig.apiurl = environment.apiurl;
APIConfig.useExternal = environment.useExternal;

platformBrowserDynamic().bootstrapModule(AppModule)
  .catch(err => console.log(err));
