import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { FormsModule } from '@angular/forms';
import { UserRoutingModule } from './user-routing.module';
import { LoginComponent } from './login/login.component';
import { LogoutComponent } from './logout/logout.component';
import { RegisterComponent } from './register/register.component';
import { PasswordresetComponent } from './passwordreset/passwordreset.component';
import { PasswordchangeComponent } from './passwordchange/passwordchange.component';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    UserRoutingModule
  ],
  declarations: [LoginComponent, LogoutComponent, RegisterComponent, PasswordresetComponent, PasswordchangeComponent]
})
export class UserModule { }
