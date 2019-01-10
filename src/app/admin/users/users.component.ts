import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

import { User } from '../../lib/user';
import { UserRepository } from '../../lib/user/repository';

@Component({
  selector: 'app-users',
  templateUrl: './users.component.html',
  styleUrls: ['./users.component.css']
})
export class UsersComponent implements OnInit {

  selectedUser: User;
  users: User[];

  constructor(
    private router: Router,
    private userRepos: UserRepository) { }

  // methods
  getUsers(): void {
    this.userRepos.getObjects().forEach(users => this.users = users);
  }

  onSelect(user: User): void {
    this.selectedUser = user;
  }

  // interfaces
  ngOnInit(): void {
    this.getUsers();
  }

}
