import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

import { TournamentRepository } from '../../lib/tournament/repository';
import { TournamentComponent } from '../../shared/tournament/component';
import { StructureRepository } from '../../lib/ngx-sport/structure/repository';
import { Role } from '../../lib/role';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { User } from '../../lib/user';
import { TournamentInvitationRepository } from '../../lib/tournament/invitation/repository';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { MyNavigation } from '../../shared/common/navigation';
import { JsonTournamentInvitation } from '../../lib/tournament/invitation/mapper';

@Component({
    selector: 'app-tournament-authorization-add',
    templateUrl: './add.component.html',
    styleUrls: ['./add.component.scss']
})
export class AuthorizationAddComponent extends TournamentComponent implements OnInit {
    form: FormGroup;
    roleItems: RoleItem[] = [];

    validations: AdminAuthValidations = {
        minlengthemailaddress: User.MIN_LENGTH_EMAIL,
        maxlengthemailaddress: User.MAX_LENGTH_EMAIL
    };

    constructor(
        route: ActivatedRoute,
        router: Router,
        tournamentRepository: TournamentRepository,
        structureRepository: StructureRepository,
        private invitationRepository: TournamentInvitationRepository,
        private myNavigation: MyNavigation,
        fb: FormBuilder,
        private modalService: NgbModal,
    ) {
        super(route, router, tournamentRepository, structureRepository);
        const config = {
            emailaddress: ['', Validators.compose([
                Validators.required,
                Validators.minLength(this.validations.minlengthemailaddress),
                Validators.maxLength(this.validations.maxlengthemailaddress)
            ])]
        };
        this.roleItems = this.createRoleItems();
        this.roleItems.forEach(roleItem => config['role' + roleItem.value] = roleItem.selected);
        config['sendinvitation'] = true;
        this.form = fb.group(config);
    }

    createRoleItems(): RoleItem[] {
        return [
            { value: Role.ADMIN, selected: false },
            { value: Role.GAMERESULTADMIN, selected: false },
            { value: Role.ROLEADMIN, selected: false }
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
        this.setAlert('info', 'de deelnemer wordt opgeslagen');
        this.add();
        return false;
    }

    add() {
        this.processing = true;
        let roles = 0;
        this.roleItems.forEach(roleItem => roles += roleItem.selected ? roleItem.value : 0);
        const json: JsonTournamentInvitation = {
            emailaddress: this.form.value['emailaddress'],
            roles
        };
        this.invitationRepository.createObject(json, this.tournament).subscribe(
            /* happy path */ invitationRes => {
                this.navigateBack();
            },
            /* error path */ e => {
                this.setAlert('danger', 'de rol kon niet worden aangemaakt: ' + e);
                this.processing = false;
            },
            /* onComplete */() => this.processing = false
        );
    }

    openHelpModal(modalContent) {
        const activeModal = this.modalService.open(modalContent);
        activeModal.result.then((result) => {
            if (result === 'linkToReferees') {
                this.router.navigate(['/admin/referees', this.tournament.getId()]);
            }
        }, (reason) => {
        });
    }

    getRoleDescription(role: number): string {
        return Role.getDescription(role);
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

export interface RoleItem {
    value: number;
    selected: boolean;
}