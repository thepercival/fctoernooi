import { Component, OnInit, inject } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

import { TournamentRepository } from '../../lib/tournament/repository';
import { TournamentComponent } from '../../shared/tournament/component';
import { StructureRepository } from '../../lib/ngx-sport/structure/repository';
import { getRoleName, Role } from '../../lib/role';
import { NgbAlert, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { User } from '../../lib/user';
import { TournamentInvitationRepository } from '../../lib/tournament/invitation/repository';
import { Validators, FormGroup, FormControl, ReactiveFormsModule } from '@angular/forms';
import { MyNavigation } from '../../shared/common/navigation';
import { JsonTournamentInvitation } from '../../lib/tournament/invitation/mapper';
import { AuthorizationExplanationModalComponent } from './infomodal.component';
import { IAlertType } from '../../shared/common/alert';
import { GlobalEventsManager } from '../../shared/common/eventmanager';
import { FavoritesRepository } from '../../lib/favorites/repository';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faSpinner } from '@fortawesome/free-solid-svg-icons';
import { TournamentNavBarComponent } from '../../shared/tournament/tournamentNavBar/tournamentNavBar.component';

@Component({
    selector: 'app-tournament-authorization-add',
    templateUrl: './add.component.html',
    styleUrls: ['./add.component.scss'],
    standalone: true,
    imports: [FontAwesomeModule,NgbAlert, ReactiveFormsModule, TournamentNavBarComponent]
})
export class AuthorizationAddComponent extends TournamentComponent implements OnInit {
    public typedForm: FormGroup;/*<{
        emailaddress: FormControl<string>,
        sendinvitation: FormControl<boolean>
      }>;*/
    roleItems: RoleItem[] = [];
    private modalService = inject(NgbModal);

    validations: AdminAuthValidations = {
        minlengthemailaddress: User.MIN_LENGTH_EMAIL,
        maxlengthemailaddress: User.MAX_LENGTH_EMAIL
    };

    faSpinner = faSpinner;

    constructor(
        route: ActivatedRoute,
        router: Router,
        tournamentRepository: TournamentRepository,
        structureRepository: StructureRepository,
        globalEventsManager: GlobalEventsManager,
        favRepository: FavoritesRepository,
        private invitationRepository: TournamentInvitationRepository,
        private myNavigation: MyNavigation

    ) {
        super(route, router, tournamentRepository, structureRepository, globalEventsManager, favRepository);
        this.typedForm = new FormGroup({
            emailaddress: new FormControl('', { nonNullable: true, validators: 
                [
                    Validators.required,
                    Validators.minLength(this.validations.minlengthemailaddress),
                    Validators.maxLength(this.validations.maxlengthemailaddress)
                ] 
            }),
            sendinvitation: new FormControl(true, { nonNullable: true })
        });
        this.roleItems = this.createRoleItems();
        this.roleItems.forEach((roleItem: RoleItem) => {
            this.typedForm.addControl('role' + roleItem.value, new FormControl<boolean>(roleItem.selected, { nonNullable: true }));
        });
    }

    createRoleItems(): RoleItem[] {
        return [
            { value: Role.Admin, selected: false },
            { value: Role.GameResultAdmin, selected: false },
            { value: Role.RoleAdmin, selected: false }
        ];
    }

    ngOnInit() {
        this.route.params.subscribe(params => {
            super.myNgOnInit(() => this.postInit());
        });
    }

    private postInit() {
        this.processing = false;
    }

    save(): boolean {
        this.processing = true;
        this.setAlert(IAlertType.Info, 'de deelnemer wordt opgeslagen');
        let roles = 0;
        this.roleItems.forEach(roleItem => roles += roleItem.selected ? roleItem.value : 0);
        const json: JsonTournamentInvitation = {
            id: 0,
            emailaddress: this.typedForm.controls.emailaddress.value,
            roles
        };
        this.invitationRepository.createObject(json, this.tournament).subscribe({
            next: () => this.navigateBack(),
            error: (e) => {
                this.setAlert(IAlertType.Danger, 'de rol kon niet worden aangemaakt: ' + e);
                this.processing = false;
            },
            complete: () => this.processing = false
        });
        return false;
    }

    openHelpModal() {
        const activeModal = this.modalService.open(AuthorizationExplanationModalComponent, { windowClass: 'info-modal' });
        activeModal.componentInstance.header = 'uitleg rol toevoegen';
        activeModal.componentInstance.showAdd = true;
        activeModal.result.then((result) => {
            if (result === 'linkToReferees') {
                this.router.navigate(['/admin/referees', this.tournament.getId()]);
            }
        }, (reason) => {
        });
    }

    getRoleName(role: number): string {
        return getRoleName(role);
    }

    hasSomeRoleSelected(): boolean {
        return this.roleItems.some(roleItem => roleItem.selected);
    }

    toggleRoleItem(roleItem: RoleItem) {
        roleItem.selected = !roleItem.selected;
    }

    navigateBack() {
        this.myNavigation.back();
    }
}

export interface AdminAuthValidations {
    minlengthemailaddress: number;
    maxlengthemailaddress: number;
}

interface RoleItem {
    value: number;
    selected: boolean;
}