import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { RegisterComponent }  from './register/register.component';
// import { ActivateComponent }  from './user/activate.component';
import { LoginComponent } from './login/login.component';
import { PasswordresetComponent } from './passwordreset/passwordreset.component';
import { PasswordchangeComponent } from './passwordchange/passwordchange.component';
import { LogoutComponent } from './logout/logout.component';

const routes: Routes = [
  { path: 'register', component: RegisterComponent },
  // { path: 'activate', component: ActivateComponent },
  { path: 'login',  component: LoginComponent },
  { path: 'passwordreset', component: PasswordresetComponent },
  { path: 'passwordchange', component: PasswordchangeComponent },
  { path: 'logout', component: LogoutComponent },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class UserRoutingModule { }
