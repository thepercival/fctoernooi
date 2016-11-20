import { NgModule }             from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { HomeComponent }   from './home/component';
import { CompetitionSeasonMainComponent }  from './competitionseason/main.component';
import { LoginComponent }  from './user/login.component';
import { LogoutComponent }  from './user/logout.component';
import { UsersComponent }  from './user/users.component';
import { AuthGuard }  from './auth/guard';
const routes: Routes = [
    { path: 'home',  component: HomeComponent },
    { path: 'main/:id', component: CompetitionSeasonMainComponent },
    { path: 'login', component: LoginComponent },
    { path: 'logout', component: LogoutComponent },
    { path: 'users', component: UsersComponent, canActivate: [AuthGuard] },
    { path: '', redirectTo: '/home', pathMatch: 'full' },
    // otherwise redirect to home
    { path: '**', redirectTo: '' }
];
@NgModule({
    imports: [ RouterModule.forRoot(routes) ],
    exports: [ RouterModule ]
})
export class AppRoutingModule {}
