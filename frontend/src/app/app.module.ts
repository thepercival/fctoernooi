import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { HttpModule } from '@angular/http';

import { AppComponent } from './app.component';
import { NavComponent } from './nav/nav.component';
import { FooterComponent } from './footer/footer.component';
import { UserModule } from './user/user.module';
import { RoutingModule } from './app-routing.module';
import { HomeComponent } from './home/home.component';
import { AuthguardService } from './auth/authguard.service';
import { AuthService } from './auth/auth.service';

@NgModule({
  declarations: [
    AppComponent,
    NavComponent,
    FooterComponent,
    HomeComponent,
  ],
  imports: [
    BrowserModule,
    HttpModule,
    RoutingModule
  ],
  providers: [
    AuthguardService,
    AuthService,
    UserModule
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
