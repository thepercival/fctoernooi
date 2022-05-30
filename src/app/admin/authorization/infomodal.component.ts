import { Component, Input, OnInit } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { getRoleName, Role } from '../../lib/role';

@Component({
    selector: 'app-ngbd-modal-auth-explanation',
    templateUrl: './infomodal.component.html',
    styleUrls: ['./infomodal.component.scss']
})
export class AuthorizationExplanationModalComponent implements OnInit {
    @Input() header!: string;
    @Input() showAdd: boolean = false;

    roleDefinitions: RoleDefinition[] = [];

    constructor(public activeModal: NgbActiveModal) {
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
