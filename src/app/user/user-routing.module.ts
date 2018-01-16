import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { LoginComponent } from './login/login.component';
import { LogoutComponent } from './logout/logout.component';
import { PasswordchangeComponent } from './passwordchange/passwordchange.component';
import { PasswordresetComponent } from './passwordreset/passwordreset.component';
import { RegisterComponent } from './register/register.component';

// import { ActivateComponent }  from './user/activate.component';
const routes: Routes = [
  { path: 'register', component: RegisterComponent },
  // { path: 'activate', component: ActivateComponent },
  { path: 'login', component: LoginComponent },
  { path: 'passwordreset', component: PasswordresetComponent },
  { path: 'passwordchange', component: PasswordchangeComponent },
  { path: 'logout', component: LogoutComponent },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class UserRoutingModule { }
