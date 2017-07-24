import { Component, OnInit } from '@angular/core';

import { Router } from '@angular/router';
import { UserService } from '../../user/user.service';
import { User } from '../../user/user';

@Component({
  selector: 'app-users',
  templateUrl: './users.component.html',
  styleUrls: ['./users.component.css']
})
export class UsersComponent implements OnInit {

  selectedUser: User = null;
  users: User[];

  constructor(
      private router: Router,
      private userService: UserService) { }

  // methods
  getUsers(): void {
    this.userService.getUsers().forEach( users => this.users = users);

  }

  onSelect(user: User): void {
    this.selectedUser = user;
    // console.log( this.selectedUser );
  }

  // interfaces
  ngOnInit(): void {
    // try {

    this.getUsers();

    // }
    // catch ( error ) {
    //  console.log( error );
    // }
    // console.log( this.users );
    // console.log( 123 );
  }

}
