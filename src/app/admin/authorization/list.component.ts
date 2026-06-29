import { Component, OnInit, TemplateRef, ChangeDetectionStrategy } from '@angular/core';
import { ActivatedRoute, NavigationExtras, Router, RouterLink } from '@angular/router';

import { TournamentRepository } from '../../lib/tournament/repository';
import { TournamentComponent } from '../../shared/tournament/component';
import { StructureRepository } from '../../lib/ngx-sport/structure/repository';
import { TournamentUserRepository } from '../../lib/tournament/user/repository';
import { Role } from '../../lib/role';
import { NgbAlert } from '@ng-bootstrap/ng-bootstrap';
import { TournamentInvitationRepository } from '../../lib/tournament/invitation/repository';
import { TournamentInvitation } from '../../lib/tournament/invitation';
import { TournamentUser } from '../../lib/tournament/user';
import { TournamentAuthorization } from '../../lib/tournament/authorization';
import { AuthorizationExplanationModalComponent } from './infomodal.component';
import { IAlertType } from '../../shared/common/alert';
import { GlobalEventsManager } from '../../shared/common/eventmanager';
import { AuthService } from '../../lib/auth/auth.service';
import { TournamentNavBarComponent } from "../../shared/tournament/tournamentNavBar/tournamentNavBar.component";
import { RoleItemComponent } from "./roleitem.component";
import { FaIconComponent } from "@fortawesome/angular-fontawesome";
import { faPlusCircle, faSpinner } from '@fortawesome/free-solid-svg-icons';

@Component({
    selector: 'app-tournament-authorization-list',
    templateUrl: './list.component.html',
    styleUrls: ['./list.component.scss'],
    changeDetection: ChangeDetectionStrategy.Eager,
    imports: [TournamentNavBarComponent, RoleItemComponent, FaIconComponent, NgbAlert, RouterLink],
})
export class AuthorizationListComponent extends TournamentComponent implements OnInit {
    public invitations: TournamentInvitation[] = [];
    faSpinner = faSpinner;
    faPlusCircle = faPlusCircle;
    public roleToProcess: TournamentAuthorizationRole | undefined;
    public removeWithRefereeRole: boolean | undefined;
    public validUserItems!: UserItem[];

    constructor(
        route: ActivatedRoute,
        router: Router,
        tournamentRepository: TournamentRepository,
        sructureRepository: StructureRepository,
        globalEventsManager: GlobalEventsManager,
        private tournamentUserRepository: TournamentUserRepository,
        private invitationRepository: TournamentInvitationRepository,
        private authService: AuthService
    ) {
        super(route, router, tournamentRepository, sructureRepository, globalEventsManager);
    }

    ngOnInit() {
        super.myNgOnInit(() => this.initAuthorizations());
    }

    initAuthorizations() {
        this.validUserItems = this.tournament.getUsers()
            .filter((tournamentUser: TournamentUser) => !this.hasUnassignableRoles(tournamentUser.getRoles()))
            .map((tournamentUser: TournamentUser): UserItem => { return { tournamentUser, emailaddress: undefined } });

        this.invitationRepository.getObjects(this.tournament)
            .subscribe({
                next: (invitations: TournamentInvitation[]) => {
                    this.invitations = invitations

                    this.processing.set(false);
                },
                error: (e) => {
                    this.alert.set({ type: IAlertType.Danger, message: e }); this.processing.set(false);
                }
            });

        this.validUserItems.forEach((userItem: UserItem) => {
            this.tournamentUserRepository.getEmailaddress(userItem.tournamentUser)
                .subscribe((emailaddress: string) => userItem.emailaddress = emailaddress);
        });
    }

    getAssignableRoles(authorization: TournamentAuthorization): TournamentAuthorizationRole[] {
        return [
            { authorization, role: Role.Admin },
            { authorization, role: Role.GameResultAdmin },
            { authorization, role: Role.RoleAdmin }
        ];
    }

    getNrOfRoles(role: number): number {
        return this.tournament.getUsers().filter(tournamentUser => {
            return tournamentUser.hasRoles(role);
        }).length
    }

    canToggleRole(tournamentUser: TournamentUser, role: number) {
        return !(role === Role.RoleAdmin && tournamentUser.hasRoles(role) && this.getNrOfRoles(Role.RoleAdmin) < 2);
    }

    get RoleReferee(): number { return Role.Referee; }

    hasUnassignableRoles(roles: number): boolean {
        return roles === Role.Referee || roles === 0;
    }

    toggleRole(authorizationRole: TournamentAuthorizationRole, modalContent: TemplateRef<any>) {
        const role = authorizationRole.role;
        const authorization = authorizationRole.authorization;
        const roleDelta = (authorization.hasRoles(role) ? -role : role);
        const roleNew = authorization.getRoles() + roleDelta;
        if (this.hasUnassignableRoles(roleNew)) {
            this.openModalRemove(modalContent, authorization, roleNew === Role.Referee);
        } else {
            this.roleToProcess = authorizationRole;
            this.editRole(authorization, roleDelta);
        }
    }

    editRole(authorization: TournamentAuthorization, newRole: number) {
        authorization.setRoles(authorization.getRoles() + newRole);
        if (authorization instanceof TournamentUser) {
            this.tournamentUserRepository.editObject(<TournamentUser>authorization)
                .subscribe({
                    next: (tournamentUser: TournamentUser) => {
                        this.roleToProcess = undefined;
                    },
                    error: (e) => {
                        this.alert.set({ type: IAlertType.Danger, message: e });
                        this.roleToProcess = undefined;
                    }
                });
        } else {
            this.invitationRepository.editObject(<TournamentInvitation>authorization)
                .subscribe({
                    next: (invitation: TournamentInvitation) => {
                        this.roleToProcess = undefined;
                    },
                    error: (e) => {
                        this.alert.set({ type: IAlertType.Danger, message: e });
                        this.roleToProcess = undefined;
                    }
                });
        }
    }

    remove(authorization: TournamentAuthorization) {
        if (authorization.getRoles() === Role.Referee)
            this.processing.set(true);
        if (authorization instanceof TournamentUser) {
            this.tournamentUserRepository.removeObject(<TournamentUser>authorization)
                .subscribe({
                    next: () => {
                        this.removeTournamentUserFromList(authorization);                        
                        if (authorization.getUserId().getId() === this.authService.getLoggedInUserId()?.getId()) {
                            const navigationExtras: NavigationExtras = {
                                queryParams: { type: 'success', message: 'je rollen zijn verwijderd' }
                              };
                              this.router.navigate(['/'], navigationExtras);
                        }
                        this.processing.set(false)
                    },
                    error: (e) => {
                        this.alert.set({ type: IAlertType.Danger, message: e }); this.processing.set(false);
                    }
                });
        } else {
            const invitation = <TournamentInvitation>authorization;
            this.invitationRepository.removeObject(invitation)
                .subscribe({
                    next: () => {
                        const idx = this.invitations.indexOf(invitation);
                        if (idx >= 0) {
                            this.invitations.splice(idx, 1);
                        }
                        this.processing.set(false);
                    },
                    error: (e) => {
                        this.alert.set({ type: IAlertType.Danger, message: e }); this.processing.set(false);
                    }
                });
        }
    }

    canBeRemoved(tournamentUser: TournamentUser) {
        return !tournamentUser.hasRoles(Role.RoleAdmin) || this.getNrOfRoles(Role.RoleAdmin) > 1;
    }

    rolesAreEqual(roleA: TournamentAuthorizationRole, roleB: TournamentAuthorizationRole | undefined): boolean {
        return roleB !== undefined && roleA.authorization === roleB.authorization && roleA.role === roleB.role;
    }

    openHelpModal() {
        const activeModal = this.modalService.open(AuthorizationExplanationModalComponent, { windowClass: 'info-modal' });
        activeModal.componentInstance.header = 'uitleg rollen';
        activeModal.componentInstance.showAdd = false;
        activeModal.result.then((result) => {
            if (result === 'linkToReferees') {
                this.router.navigate(['/admin/referees', this.tournament.getId()]);
            }
        }, (reason) => {
        });
    }

    openModalRemove(modalContent: TemplateRef<any>, authorization: TournamentAuthorization, removeWithRefereeRole?: boolean) {
        this.removeWithRefereeRole = removeWithRefereeRole;
        const activeModal = this.modalService.open(modalContent);
        activeModal.result.then((result) => {
            if (result === 'remove') {
                if (removeWithRefereeRole) {
                    authorization.setRoles(0);
                    this.editRole(authorization, Role.Referee);
                } else {
                    this.remove(authorization);
                }

            }
        }, (reason) => {
        });
    }

    removeTournamentUserFromList(tournamentUser: TournamentUser) {
        const userItem = this.validUserItems.find(userItem => userItem.tournamentUser === tournamentUser);
        if (userItem) {
            const idx = this.validUserItems.indexOf(userItem);
            if (idx >= 0) {
                this.validUserItems.splice(idx, 1);
            }
        }
    }
}

export interface UserItem {
    tournamentUser: TournamentUser;
    emailaddress: string | undefined;
}

export interface TournamentAuthorizationRole {
    authorization: TournamentAuthorization;
    role: number;
}