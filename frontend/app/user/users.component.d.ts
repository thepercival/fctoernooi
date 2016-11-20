/**
 * Created by cdunnink on 17-11-2016.
 */
import { OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { UserService } from './service';
import { User } from './user';
export declare class UsersComponent implements OnInit {
    private router;
    private userService;
    selectedUser: User;
    users: User[];
    constructor(router: Router, userService: UserService);
    getUsers(): void;
    onSelect(user: User): void;
    ngOnInit(): void;
}
