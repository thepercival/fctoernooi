import { NgModule }             from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { DashboardComponent }   from './dashboard.component';
import { CompetitionSeasonsComponent }      from './competitionseasons.component';
import { CompetitionSeasonDetailComponent }  from './competitionseason-detail.component';
const routes: Routes = [
    { path: '', redirectTo: '/dashboard', pathMatch: 'full' },
    { path: 'dashboard',  component: DashboardComponent },
    { path: 'detail/:id', component: CompetitionSeasonDetailComponent },
    { path: 'competitionseasons',     component: CompetitionSeasonsComponent }
];
@NgModule({
    imports: [ RouterModule.forRoot(routes) ],
    exports: [ RouterModule ]
})
export class AppRoutingModule {}
