import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { FontAwesomeModule, FaIconLibrary } from '@fortawesome/angular-fontawesome';
import { faKey, faLevelUpAlt } from '@fortawesome/free-solid-svg-icons';
import { NgbAlertModule } from '@ng-bootstrap/ng-bootstrap';

import { LoginComponent } from './login/login.component';
import { LogoutComponent } from './logout/logout.component';
import { PasswordchangeComponent } from './passwordchange/passwordchange.component';
import { PasswordresetComponent } from './passwordreset/passwordreset.component';
import { RegisterComponent } from './register/register.component';
import { UserRoutingModule } from './user-routing.module';
import { ProfileComponent } from './profile/profile.component';
import { UserRepository } from '../lib/user/repository';

@NgModule({
  imports: [
    CommonModule,
    ReactiveFormsModule,
    UserRoutingModule,
    NgbAlertModule,
    FontAwesomeModule
  ],
  declarations: [LoginComponent, LogoutComponent, RegisterComponent, PasswordresetComponent, PasswordchangeComponent, ProfileComponent],
  providers: [UserRepository]
})
export class UserModule {
  constructor(library: FaIconLibrary) {
    library.addIcons(faLevelUpAlt, faKey);
  }
}
