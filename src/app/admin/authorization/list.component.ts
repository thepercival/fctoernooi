import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

import { TournamentRepository } from '../../lib/tournament/repository';
import { TournamentComponent } from '../../shared/tournament/component';
import { StructureRepository } from '../../lib/ngx-sport/structure/repository';
import { TournamentUserRepository } from '../../lib/tournamentuser/repository';
import { Role } from '../../lib/role';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { TournamentInvitationRepository } from '../../lib/tournament/invitation/repository';
import { TournamentInvitation } from '../../lib/tournament/invitation';
import { TournamentUser } from '../../lib/tournamentuser';
import { RoleItem } from './add.component';
@Component({
    selector: 'app-tournament-authorization-list',
    templateUrl: './list.component.html',
    styleUrls: ['./list.component.scss']
})
export class AuthorizationListComponent extends TournamentComponent implements OnInit {
    public authAdminItems: AuthAdminItem[] = [];

    constructor(
        route: ActivatedRoute,
        router: Router,
        tournamentRepository: TournamentRepository,
        sructureRepository: StructureRepository,
        private tournamentUserRepository: TournamentUserRepository,
        private invitationRepository: TournamentInvitationRepository,
        private modalService: NgbModal,
    ) {
        super(route, router, tournamentRepository, sructureRepository);
    }

    ngOnInit() {
        super.myNgOnInit(() => this.initAuthorizations());
    }

    initAuthorizations() {
        this.authAdminItems = this.tournament.getUsers().map((user) => {
            return this.createAuthItemByUser(user);
        });

        this.invitationRepository.getObjects(this.tournament)
            .subscribe(
            /* happy path */ invitations => {
                    invitations.forEach((invitation) => {
                        this.authAdminItems.push(this.createAuthItemByInvitation(invitation));
                    });
                    this.processing = false;
                },
            /* error path */ e => { this.setAlert('danger', e); this.processing = false; }
            );
    }

    createAuthItemByUser(tournamentUser: TournamentUser): AuthAdminItem {
        return {
            emailaddress: tournamentUser.getUser().getEmailaddress(),
            invitation: false,
            roleItems: this.createRoleItems(tournamentUser.getRoles())
        };
    }

    createAuthItemByInvitation(invitation: TournamentInvitation): AuthAdminItem {
        return {
            emailaddress: invitation.getEmailaddress(),
            invitation: true,
            roleItems: this.createRoleItems(invitation.getRoles())
        };
    }

    createRoleItems(roles: number): RoleItem[] {
        return [
            {
                value: Role.ADMIN,
                selected: (roles & Role.ADMIN) === Role.ADMIN
            },
            {
                value: Role.GAMERESULTADMIN,
                selected: (roles & Role.GAMERESULTADMIN) === Role.GAMERESULTADMIN
            },
            {
                value: Role.ROLEADMIN,
                selected: (roles & Role.ROLEADMIN) === Role.ROLEADMIN
            }
        ];
    }

    getRoleDescription(role: number): string {
        return Role.getDescription(role);
    }

    getNrOfRoles(role: number): number {
        return this.authAdminItems.filter(authAdminItem => {
            return !authAdminItem.invitation && this.hasRole(authAdminItem, role);
        }).length
    }

    hasRole(authAdminItem: AuthAdminItem, role: number): boolean {
        return authAdminItem.roleItems.some(roleItem => roleItem.value === role);
    }

    toggleRole(roleItem: RoleItem) {
        this.resetAlert();
        if (roleItem.value === Role.ROLEADMIN && roleItem.selected && this.getNrOfRoles(Role.ROLEADMIN) < 2) {
            this.setAlert('warning', 'er moet minimaal 1 "' + this.getRoleDescription(Role.ROLEADMIN) + '" zijn');
            return;
        }
        roleItem.selected = !roleItem.selected
    }

    removeAuthAdmin(authAdminItem: AuthAdminItem) {
        const idx = this.authAdminItems.indexOf(authAdminItem);
        if (idx >= 0) {
            this.authAdminItems.splice(idx, 1);
        }
    }

    canAuthAdminBeRemoved(authAdminItem: AuthAdminItem) {
        return authAdminItem.invitation || !this.hasRole(authAdminItem, Role.ROLEADMIN) || this.getNrOfRoles(Role.ROLEADMIN) > 1;
    }
}

export interface AuthAdminItem {
    emailaddress: string;
    invitation: boolean;
    roleItems: RoleItem[];
}