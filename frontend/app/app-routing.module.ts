import { RouterModule, Routes } from '@angular/router';
import { NgModule }             from '@angular/core';
import { HomeComponent }   from './home/component';
import { RegisterComponent }  from './user/register.component';
import { ActivateComponent }  from './user/activate.component';
import { LoginComponent }  from './user/login.component';
import { LogoutComponent }  from './user/logout.component';
import { PasswordResetComponent, PasswordChangeComponent }  from './user/password.component';
import { UsersComponent }  from './user/users.component';
import { AdminComponent }  from './admin/component';
import { AuthGuard }  from './auth/guard';
const routes: Routes = [
    { path: 'home',  component: HomeComponent },
    { path: 'register', component: RegisterComponent },
    { path: 'activate', component: ActivateComponent },
    { path: 'login', component: LoginComponent },
    { path: 'logout', component: LogoutComponent },
    { path: 'passwordreset', component: PasswordResetComponent },
    { path: 'passwordchange', component: PasswordChangeComponent },
    { path: 'users', component: UsersComponent, canActivate: [AuthGuard] },
    { path: 'admin', component: AdminComponent, canActivate: [AuthGuard] },
    { path: '', redirectTo: '/home', pathMatch: 'full' },
    // otherwise redirect to home
    { path: '**', redirectTo: '' }
];
@NgModule({
    imports: [ RouterModule.forRoot(routes) ],
    exports: [ RouterModule ]
})
export class AppRoutingModule {}
