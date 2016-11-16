import { NgModule }             from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { DashboardComponent }   from './dashboard.component';
import { CompetitionSeasonsComponent }      from './competitionseasons.component';
import { CompetitionSeasonDetailComponent }  from './competitionseason-detail.component';
import { LoginComponent }  from './user/login.component';
import { AuthGuard }  from './auth/guard';
const routes: Routes = [
    { path: 'dashboard',  component: DashboardComponent/*, canActivate: [AuthGuard]*/ },
    { path: 'detail/:id', component: CompetitionSeasonDetailComponent, canActivate: [AuthGuard] },
    { path: 'competitionseasons', component: CompetitionSeasonsComponent/*, canActivate: [AuthGuard]*/ },
    { path: 'login', component: LoginComponent },
    { path: '', redirectTo: '/dashboard', pathMatch: 'full' },
    // otherwise redirect to home
    { path: '**', redirectTo: '' }

];
@NgModule({
    imports: [ RouterModule.forRoot(routes) ],
    exports: [ RouterModule ]
})
export class AppRoutingModule {}
