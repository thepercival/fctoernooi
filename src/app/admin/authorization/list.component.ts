import { Component, OnInit, TemplateRef, signal, WritableSignal, inject } from '@angular/core';
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
import { AUTHORIZATION_EXPLANATION_MODAL_INPUTS } from '../../shared/modal-input-interfaces/authorization-explanation-modal-inputs.interface';
import { createModalInjector } from '../../shared/modal-input-interfaces/create-modal-injector';
import { finalize } from 'rxjs';

@Component({
    selector: 'app-tournament-authorization-list',
    templateUrl: './list.component.html',
    styleUrls: ['./list.component.scss'],
    imports: [TournamentNavBarComponent, RoleItemComponent, FaIconComponent, NgbAlert, RouterLink],
})
export class AuthorizationListComponent extends TournamentComponent implements OnInit {
    private tournamentUserRepository = inject(TournamentUserRepository);
    private invitationRepository = inject(TournamentInvitationRepository);
    private authService = inject(AuthService);

    public readonly invitations: WritableSignal<TournamentInvitation[]> = signal([]);
    faSpinner = faSpinner;
    faPlusCircle = faPlusCircle;
    public removeWithRefereeRole: boolean | undefined;
    public readonly validUserItems: WritableSignal<UserItem[]> = signal([]);
    public readonly processingAuthorizations: WritableSignal<Set<TournamentAuthorization>> = signal(new Set<TournamentAuthorization>());
    constructor() {
        const route = inject(ActivatedRoute);
        const router = inject(Router);
        const tournamentRepository = inject(TournamentRepository);
        const sructureRepository = inject(StructureRepository);
        const globalEventsManager = inject(GlobalEventsManager);

        super(route, router, tournamentRepository, sructureRepository, globalEventsManager);
    }

    ngOnInit() {
        super.myNgOnInit(() => this.initAuthorizations());
    }

    initAuthorizations() {
        const userItems = this.tournament.getUsers()
            .filter((tournamentUser: TournamentUser) => !this.hasUnassignableRoles(tournamentUser.getRoles()))
            .map((tournamentUser: TournamentUser): UserItem => {
                return {
                    tournamentUser,
                    emailaddress: undefined,
                    loadingEmail: true
                }
            });
        this.validUserItems.set(userItems);

        this.invitationRepository.getObjects(this.tournament)
            .subscribe({
                next: (invitations: TournamentInvitation[]) => {
                    this.invitations.set(invitations)

                    this.processing.set(false);
                },
                error: (e) => {
                    this.alert.set({ type: IAlertType.Danger, message: e }); this.processing.set(false);
                }
            });

        userItems.forEach((userItem: UserItem) => {
            this.tournamentUserRepository.getEmailaddress(userItem.tournamentUser)
                .subscribe({
                    next: (emailaddress: string) => {
                        this.updateUserItem(userItem.tournamentUser, {
                            emailaddress,
                            loadingEmail: false
                        });
                    },
                    error: () => {
                        this.updateUserItem(userItem.tournamentUser, {
                            emailaddress: '',
                            loadingEmail: false
                        });
                    }
                });
        });
    }

    isAuthorizationProcessing(authorization: TournamentAuthorization): boolean {
        return this.processingAuthorizations().has(authorization);
    }

    private setAuthorizationProcessing(authorization: TournamentAuthorization, processing: boolean): void {
        this.processingAuthorizations.update((authorizations: Set<TournamentAuthorization>) => {
            const updated = new Set(authorizations);
            if (processing) {
                updated.add(authorization);
            } else {
                updated.delete(authorization);
            }
            return updated;
        });
    }

    private updateUserItem(user: TournamentUser, update: Partial<UserItem>): void {
        const userId = user.getUserId().getId();
        this.validUserItems.update((items: UserItem[]) => {
            return items.map((item: UserItem) => {
                if (item.tournamentUser.getUserId().getId() !== userId) {
                    return item;
                }
                return { ...item, ...update };
            });
        });
    }

    getAssignableRoles(authorization: TournamentAuthorization): TournamentAuthorizationRole[] {
        return [
            { authorization, role: Role.Admin },
            { authorization, role: Role.GameResultAdmin },
            { authorization, role: Role.RoleAdmin }
        ];
    }

    getNrOfUsersForRole(role: Role): number {
        return this.tournament.getUsers().filter(tournamentUser => {
            return tournamentUser.hasRole(role);
        }).length
    }

    canToggleRole(tournamentUser: TournamentUser, role: Role): boolean {
        return !(role === Role.RoleAdmin && tournamentUser.hasRole(role) && this.getNrOfUsersForRole(Role.RoleAdmin) < 2);
    }

    get RoleReferee(): Role { return Role.Referee; }

    hasUnassignableRoles(roles: Role[]): boolean {
        return roles.includes(Role.Referee) || roles.length === 0;
    }

    toggleRole(authorizationRole: TournamentAuthorizationRole, modalContent: TemplateRef<any>) {
        const roleToggled = authorizationRole.role;
        const authorization = authorizationRole.authorization;
        console.log('cdk', roleToggled, authorization);
        
        if( authorization.hasRole(roleToggled) ) { // remove
            console.log('removerole');
            if (this.hasUnassignableRoles(authorizationRole.authorization.getRoles())) {
                this.openModalRemove(modalContent, authorization, roleToggled === Role.Referee);
            } else {
                this.removeRole(authorization, roleToggled);
            }
        } else { // add
            console.log('addrole');
            this.addRole(authorization, roleToggled);
        }
    }

    addRole(authorization: TournamentAuthorization, newRole: Role) {
        if (authorization instanceof TournamentUser) {
            const cleanup = () => {
                this.setAuthorizationProcessing(authorization, false);
            };
            this.setAuthorizationProcessing(authorization, true);
            this.tournamentUserRepository.addRole(<TournamentUser>authorization, newRole)
                .pipe(finalize(cleanup))
                .subscribe({
                    next: (tournamentUser: TournamentUser) => {
                        cleanup();
                    },
                    error: (e) => {
                        this.alert.set({ type: IAlertType.Danger, message: e });
                        cleanup();
                    }
                });
        } else {
            this.invitationRepository.addRole(<TournamentInvitation>authorization, newRole  )
                .subscribe({
                    next: (invitation: TournamentInvitation) => {
                    },
                    error: (e) => {
                        this.alert.set({ type: IAlertType.Danger, message: e });
                    }
                });
        }
    }

    removeRole(authorization: TournamentAuthorization, removeRole: Role) {
        if (authorization instanceof TournamentUser) {
            const cleanup = () => {
                this.setAuthorizationProcessing(authorization, false);
            };
            this.setAuthorizationProcessing(authorization, true);
            this.tournamentUserRepository.removeRole(<TournamentUser>authorization, removeRole)
                .pipe(finalize(cleanup))
                .subscribe({
                    next: (tournamentUser: TournamentUser) => {
                        cleanup();
                    },
                    error: (e) => {
                        this.alert.set({ type: IAlertType.Danger, message: e });
                        cleanup();
                    }
                });
        } else {
            this.invitationRepository.removeRole(<TournamentInvitation>authorization, removeRole)
                .subscribe({
                    next: (invitation: TournamentInvitation) => {
                    },
                    error: (e) => {
                        this.alert.set({ type: IAlertType.Danger, message: e });
                    }
                });
        }
    }

    remove(authorization: TournamentAuthorization) {
        if (authorization instanceof TournamentUser) {
            const cleanup = () => this.setAuthorizationProcessing(authorization, false);
            this.setAuthorizationProcessing(authorization, true);
            this.tournamentUserRepository.removeObject(<TournamentUser>authorization)
                .pipe(finalize(cleanup))
                .subscribe({
                    next: () => {
                        this.removeTournamentUserFromList(authorization);                        
                        if (authorization.getUserId().getId() === this.authService.getLoggedInUserId()?.getId()) {
                            const navigationExtras: NavigationExtras = {
                                queryParams: { type: 'success', message: 'je rollen zijn verwijderd' }
                              };
                              this.router.navigate(['/'], navigationExtras);
                        }
                        cleanup();
                    },
                    error: (e) => {
                        this.alert.set({ type: IAlertType.Danger, message: e });
                        cleanup();
                    }
                });
        } else {
            const invitation = <TournamentInvitation>authorization;
            this.invitationRepository.removeObject(invitation)
                .subscribe({
                    next: () => {
                        this.removeInvitationFromList(invitation);
                    },
                    error: (e) => {
                        this.alert.set({ type: IAlertType.Danger, message: e });
                    }
                });
        }
    }

    canBeRemoved(tournamentUser: TournamentUser) {
        return !tournamentUser.hasRole(Role.RoleAdmin) || this.getNrOfUsersForRole(Role.RoleAdmin) > 1;
    }

    rolesAreEqual(roleA: TournamentAuthorizationRole, roleB: TournamentAuthorizationRole | undefined): boolean {
        return roleB !== undefined && roleA.authorization === roleB.authorization && roleA.role === roleB.role;
    }

    openHelpModal() {
        const modalInjector = createModalInjector(this.injector, AUTHORIZATION_EXPLANATION_MODAL_INPUTS, {
            header: 'uitleg rollen',
            showAdd: false
        });
        const activeModal = this.modalService.open(AuthorizationExplanationModalComponent, { windowClass: 'info-modal', injector: modalInjector });
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
                authorization.emptyRoles();
                if (removeWithRefereeRole) {
                    authorization.addRole(Role.Referee);
                }
                this.remove(authorization);
            }
        }, (reason) => {
        });
    }

    removeTournamentUserFromList(tournamentUser: TournamentUser) {
        this.validUserItems.update((items: UserItem[]) => {
            return items.filter((userItem: UserItem) => userItem.tournamentUser !== tournamentUser);
        });
    }

    removeInvitationFromList(invitation: TournamentInvitation) {
        this.invitations.update((items: TournamentInvitation[]) => {
            return items.filter((invitationIt: TournamentInvitation) => invitationIt !== invitation);
        });
    }
}

export interface UserItem {
    tournamentUser: TournamentUser;
    emailaddress: string | undefined;
    loadingEmail: boolean;
}

export interface TournamentAuthorizationRole {
    authorization: TournamentAuthorization;
    role: Role;
}