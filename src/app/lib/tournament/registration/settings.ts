import { Identifiable } from 'ngx-sport';

export class TournamentRegistrationSettings extends Identifiable {

    constructor(
        private enabled: boolean,
        private end: Date,
        private mailAlert: boolean,
        private remark: string) {
            super();
    }

    isEnabled(): boolean {
        return this.enabled;
    }

    getEnd(): Date {
        return this.end;
    }

    hasMailAlert(): boolean {
        return this.mailAlert;
    }

    getRemark(): string {
        return this.remark;
    }
}
