import { Component, OnInit, Input, EventEmitter, Output } from '@angular/core';
import { getRoleName, Role } from '../../lib/role';
import { TournamentAuthorizationRole } from './list.component';

@Component({
    selector: 'app-tournament-authorization-role',
    templateUrl: './roleitem.component.html',
    styleUrls: ['./roleitem.component.scss']
})
export class RoleItemComponent implements OnInit {
    @Input() role!: TournamentAuthorizationRole;
    @Input() processing: boolean = false;
    @Input() disabled: boolean = false;
    @Output() toggleRole = new EventEmitter<TournamentAuthorizationRole>();
    description!: string;

    constructor(

    ) {
    }

    ngOnInit() {
        this.description = getRoleName(this.role.role);
    }

    toggle() {
        this.toggleRole.emit(this.role);
    }
}