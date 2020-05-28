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
import { JsonTournamentInvitation } from '../../lib/tournament/invitation/mapper';
import { JsonTournamentUser } from '../../lib/tournamentuser/mapper';
import { JsonTournament } from '../../lib/tournament/mapper';
@Component({
    selector: 'app-tournament-authorization-list',
    templateUrl: './list.component.html',
    styleUrls: ['./list.component.scss']
})
export class AuthorizationListComponent extends TournamentComponent implements OnInit {
    public invitations: TournamentInvitation[] = [];
    public actionprocessing: boolean = false;

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
        this.invitationRepository.getObjects(this.tournament)
            .subscribe(
            /* happy path */ invitations => {
                    this.invitations = invitations
                    this.processing = false;
                },
            /* error path */ e => { this.setAlert('danger', e); this.processing = false; }
            );
    }

    getRoleItems(roles: number): RoleItem[] {
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
        return this.tournament.getUsers().filter(tournamentUser => {
            return tournamentUser.hasRoles(role);
        }).length
    }

    canToggleRole(roleItem: RoleItem) {
        return !(roleItem.value === Role.ROLEADMIN && roleItem.selected && this.getNrOfRoles(Role.ROLEADMIN) < 2);
    }

    toggleRoleTournamentUser(tournamentUser: TournamentUser, roleItem: RoleItem) {
        this.actionprocessing = true;

        tournamentUser.setRoles(tournamentUser.getRoles() + (roleItem.selected ? roleItem.value : -roleItem.value));
        this.tournamentUserRepository.editObject(tournamentUser)
            .subscribe(
                /* happy path */ res => {
                    roleItem.selected = !roleItem.selected
                    this.actionprocessing = false;
                },
                /* error path */ e => { this.setAlert('danger', e); this.actionprocessing = false; }
            );
    }

    toggleRoleInvitation(invitation: TournamentInvitation, roleItem: RoleItem) {
        this.actionprocessing = true;

        invitation.setRoles(invitation.getRoles() + (roleItem.selected ? roleItem.value : -roleItem.value));
        this.invitationRepository.editObject(invitation)
            .subscribe(
                    /* happy path */ res => {
                    roleItem.selected = !roleItem.selected
                    this.actionprocessing = false;
                },
                    /* error path */ e => { this.setAlert('danger', e); this.actionprocessing = false; }
            );
    }

    removeTournamentUser(tournamentUser: TournamentUser) {
        this.actionprocessing = true;
        this.tournamentUserRepository.removeObject(tournamentUser)
            .subscribe(
                /* happy path */ res => {
                    this.actionprocessing = false;
                },
                /* error path */ e => { this.setAlert('danger', e); this.actionprocessing = false; }
            );

    }

    removeInvitation(invitation: TournamentInvitation) {
        this.actionprocessing = true;
        this.invitationRepository.removeObject(invitation)
            .subscribe(
                /* happy path */ res => {
                    this.actionprocessing = false;
                },
                /* error path */ e => { this.setAlert('danger', e); this.actionprocessing = false; }
            );
    }

    canBeRemoved(tournamentUser: TournamentUser) {
        return !tournamentUser.hasRoles(Role.ROLEADMIN) || this.getNrOfRoles(Role.ROLEADMIN) > 1;
    }
}