import { OnInit } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from '../lib/auth/auth.service';
import { User } from '../lib/user';
import { UserRepository } from '../lib/user/repository';
import { IAlert, IAlertType } from '../shared/common/alert';
import { GlobalEventsManager } from '../shared/common/eventmanager';


export abstract class UserComponent {
    public user: User | undefined;

    public alert: IAlert | undefined;
    public processing = true;

    constructor(
        protected route: ActivatedRoute,
        protected router: Router,
        protected userRepository: UserRepository,
        public authService: AuthService,
        protected globalEventsManager: GlobalEventsManager
    ) {
        this.globalEventsManager.showFooter.emit();
    }

    protected setAlert(type: IAlertType, message: string) {
        this.alert = { 'type': type, 'message': message };
    }

    protected resetAlert(): void {
        this.alert = undefined;
    }
}