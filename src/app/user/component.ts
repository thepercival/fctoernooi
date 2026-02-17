import { signal, WritableSignal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from '../lib/auth/auth.service';
import { User } from '../lib/user';
import { UserRepository } from '../lib/user/repository';
import { IAlert, IAlertType } from '../shared/common/alert';
import { GlobalEventsManager } from '../shared/common/eventmanager';


export abstract class UserComponent {
    public user: User | undefined;

    public alert: WritableSignal<IAlert|undefined> = signal(undefined);
    public processing: WritableSignal<boolean> = signal(true);

    constructor(
        protected route: ActivatedRoute,
        protected router: Router,
        protected userRepository: UserRepository,
        public authService: AuthService,
        protected globalEventsManager: GlobalEventsManager
    ) {
        this.globalEventsManager.showFooter.emit(true);
    }

    protected setAlert(type: IAlertType, message: string) {
        this.alert.set({ 'type': type, 'message': message });
    }

    protected resetAlert(): void {
        this.alert.set(undefined);
    }
}