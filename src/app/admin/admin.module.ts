import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';

import { UserRepository } from '../lib/user/repository';
import { AdminRoutingModule } from './admin-routing.module';
import { HomeComponent } from './home/home.component';
import { UsersComponent } from './users/users.component';

@NgModule({
  imports: [
    CommonModule,
    AdminRoutingModule
  ],
  declarations: [HomeComponent, UsersComponent],
  providers: [UserRepository]
})
export class AdminModule { }
