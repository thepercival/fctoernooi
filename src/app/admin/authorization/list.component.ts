import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

import { TournamentRepository } from '../../lib/tournament/repository';
import { TournamentComponent } from '../../shared/tournament/component';
import { StructureRepository } from '../../lib/ngx-sport/structure/repository';
import { TournamentUserRepository } from '../../lib/tournament/user/repository';
import { Role } from '../../lib/role';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { TournamentInvitationRepository } from '../../lib/tournament/invitation/repository';
import { TournamentInvitation } from '../../lib/tournament/invitation';
import { TournamentUser } from '../../lib/tournament/user';
import { TournamentAuthorization } from '../../lib/tournament/authorization';
import { AuthorizationExplanationModalComponent } from './infomodal.component';

@Component({
    selector: 'app-tournament-authorization-list',
    templateUrl: './list.component.html',
    styleUrls: ['./list.component.scss']
})
export class AuthorizationListComponent extends TournamentComponent implements OnInit {
    public invitations: TournamentInvitation[] = [];
    public roleProcessing: TournamentAuthorizationRole;
    public removeWithRefereeRole: boolean;

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

    getAssignableRoles(authorization: TournamentAuthorization): TournamentAuthorizationRole[] {
        return [
            { authorization, role: Role.ADMIN },
            { authorization, role: Role.GAMERESULTADMIN },
            { authorization, role: Role.ROLEADMIN }
        ];
    }

    getValidTournamentUsers(): TournamentUser[] {
        return this.tournament.getUsers().filter(tournamentUser => !this.hasUnassignableRoles(tournamentUser.getRoles()));
    }

    getNrOfRoles(role: number): number {
        return this.tournament.getUsers().filter(tournamentUser => {
            return tournamentUser.hasRoles(role);
        }).length
    }

    canToggleRole(tournamentUser: TournamentUser, role: number) {
        return !(role === Role.ROLEADMIN && tournamentUser.hasRoles(role) && this.getNrOfRoles(Role.ROLEADMIN) < 2);
    }

    get RoleReferee(): number { return Role.REFEREE; }

    hasUnassignableRoles(roles: number): boolean {
        return roles === Role.REFEREE || roles === 0;
    }

    toggleRole(authorizationRole: TournamentAuthorizationRole, modalContent) {
        const role = authorizationRole.role;
        const authorization = authorizationRole.authorization;
        const roleDelta = (authorization.hasRoles(role) ? -role : role);
        const roleNew = authorization.getRoles() + roleDelta;
        if (this.hasUnassignableRoles(roleNew)) {
            this.openModalRemove(modalContent, authorization, roleNew === Role.REFEREE);
        } else {
            this.roleProcessing = authorizationRole;
            this.editRole(authorization, roleDelta);
        }
    }

    editRole(authorization: TournamentAuthorization, newRole: number) {
        authorization.setRoles(authorization.getRoles() + newRole);
        if (authorization instanceof TournamentUser) {
            this.tournamentUserRepository.editObject(<TournamentUser>authorization)
                .subscribe(
                /* happy path */ res => {
                        this.roleProcessing = undefined;
                    },
                /* error path */ e => { this.setAlert('danger', e); this.roleProcessing = undefined; }
                );
        } else {
            this.invitationRepository.editObject(<TournamentInvitation>authorization)
                .subscribe(
            /* happy path */ res => {
                        this.roleProcessing = undefined;
                    },
            /* error path */ e => { this.setAlert('danger', e); this.roleProcessing = undefined; }
                );
        }
    }

    remove(authorization: TournamentAuthorization) {
        if (authorization.getRoles() === Role.REFEREE)
            this.processing = true;
        if (authorization instanceof TournamentUser) {
            this.tournamentUserRepository.removeObject(<TournamentUser>authorization)
                .subscribe(
                /* happy path */ res => {
                        this.processing = false;

                    },
                /* error path */ e => { this.setAlert('danger', e); this.processing = false; }
                );
        } else {
            const invitation = <TournamentInvitation>authorization;
            this.invitationRepository.removeObject(invitation)
                .subscribe(
                /* happy path */ res => {
                        const idx = this.invitations.indexOf(invitation);
                        if (idx >= 0) {
                            this.invitations.splice(idx, 1);
                        }
                        this.processing = false;
                    },
                /* error path */ e => { this.setAlert('danger', e); this.processing = false; }
                );
        }
    }

    canBeRemoved(tournamentUser: TournamentUser) {
        return !tournamentUser.hasRoles(Role.ROLEADMIN) || this.getNrOfRoles(Role.ROLEADMIN) > 1;
    }

    rolesAreEqual(roleA: TournamentAuthorizationRole, roleB: TournamentAuthorizationRole): boolean {
        return roleA && roleB && roleA.authorization === roleB.authorization && roleA.role === roleB.role;
    }

    openHelpModal() {
        const activeModal = this.modalService.open(AuthorizationExplanationModalComponent);
        activeModal.componentInstance.header = 'uitleg rollen';
        activeModal.result.then((result) => {
            if (result === 'linkToReferees') {
                this.router.navigate(['/admin/referees', this.tournament.getId()]);
            }
        }, (reason) => {
        });
    }

    openModalRemove(modalContent, authorization: TournamentAuthorization, removeWithRefereeRole?: boolean) {
        this.removeWithRefereeRole = removeWithRefereeRole;
        const activeModal = this.modalService.open(modalContent);
        activeModal.result.then((result) => {
            if (result === 'remove') {
                if (removeWithRefereeRole) {
                    authorization.setRoles(0);
                    this.editRole(authorization, Role.REFEREE);
                } else {
                    this.remove(authorization);
                }

            }
        }, (reason) => {
        });
    }
}

export interface TournamentAuthorizationRole {
    authorization: TournamentAuthorization;
    role: number;
}