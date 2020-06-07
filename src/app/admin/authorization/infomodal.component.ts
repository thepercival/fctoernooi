import { Component, Input, OnInit } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { Role } from '../../lib/role';

@Component({
    selector: 'app-ngbd-modal-auth-explanation',
    templateUrl: './infomodal.component.html',
    styleUrls: ['./infomodal.component.scss']
})
export class AuthorizationExplanationModalComponent implements OnInit {
    @Input() header: string;
    @Input() showAdd: boolean;

    roleDefinitions: RoleDefinition[];

    constructor(public activeModal: NgbActiveModal) {
    }

    ngOnInit() {
        this.roleDefinitions = [
            { name: Role.getName(Role.ADMIN), description: 'kan alles behalve wat de andere rollen kunnen' },
            { name: Role.getName(Role.ROLEADMIN), description: 'kan de gebruikers-rollen aanpassen, er moet minimaal 1 rolbeheerder zijn' },
            { name: Role.getName(Role.GAMERESULTADMIN), description: 'kan de scores van alle wedstrijden aanpassen' },
            { name: Role.getName(Role.REFEREE), description: 'kan de scores van eigen wedstrijden aanpassen, je deelt deze rol uit door bij de scheidsrechter het emailadres in te vullen' },
        ]
    }
}

interface RoleDefinition {
    name: string;
    description: string;
}
