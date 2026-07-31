import { Component, Input, OnInit, ChangeDetectionStrategy, inject } from '@angular/core';
import { NgbActiveModal, NgbAlert } from '@ng-bootstrap/ng-bootstrap';
import { getRoleName, Role } from '../../lib/role';
import { facReferee } from '../../shared/customicons';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';

@Component({
    selector: 'app-ngbd-modal-auth-explanation',
    templateUrl: './infomodal.component.html',
    styleUrls: ['./infomodal.component.scss'],
    standalone: true,
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [NgbAlert, FontAwesomeModule],
})
export class AuthorizationExplanationModalComponent implements OnInit {
    activeModal = inject(NgbActiveModal);

    @Input() header!: string;
    @Input() showAdd: boolean = false;

    roleDefinitions: RoleDefinition[] = [];

    facReferee = facReferee;
    constructor() {
    }

    ngOnInit() {
        this.roleDefinitions = [
            { name: getRoleName(Role.Admin), description: 'kan alles behalve wat de andere rollen kunnen' },
            { name: getRoleName(Role.RoleAdmin), description: 'kan de gebruikers-rollen aanpassen, er moet minimaal 1 rolbeheerder zijn' },
            { name: getRoleName(Role.GameResultAdmin), description: 'kan de scores van alle wedstrijden aanpassen' },
            { name: getRoleName(Role.Referee), description: 'kan de scores van eigen wedstrijden aanpassen, je deelt deze rol uit door bij de scheidsrechter het emailadres in te vullen' },
        ]
    }
}

interface RoleDefinition {
    name: string;
    description: string;
}
