import { Component, OnInit, output, input, WritableSignal } from '@angular/core';
import { getRoleName } from '../../lib/role';
import { TournamentAuthorizationRole } from './list.component';
import { FaIconComponent } from "@fortawesome/angular-fontawesome";
import { faSpinner } from '@fortawesome/free-solid-svg-icons';

@Component({
    selector: 'app-tournament-authorization-role',
    templateUrl: './roleitem.component.html',
    styleUrls: ['./roleitem.component.scss'],
    standalone: true,
    imports: [FaIconComponent],
})
export class RoleItemComponent implements OnInit {
    faSpinner = faSpinner;
    role = input.required<TournamentAuthorizationRole>();
    public readonly processing = input.required<boolean>();
    disabled = input.required<boolean>();
    
    onRoleChange = output<TournamentAuthorizationRole>();
    description!: string;

    constructor(

    ) {
    }

    ngOnInit() {
        this.description = getRoleName(this.role().role);
    }

    toggle() {
        if (this.disabled()) {
            return;
        }
        this.onRoleChange.emit(this.role());
    }
}