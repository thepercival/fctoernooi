import { Identifiable } from "ngx-sport";

export class User extends Identifiable {
    static readonly MIN_LENGTH_EMAIL = 6;
    static readonly MAX_LENGTH_EMAIL = 100;
    static readonly MIN_LENGTH_PASSWORD = 3;
    static readonly MAX_LENGTH_PASSWORD = 50;

    protected emailaddress: string = '';

    constructor(id: number | string) {
        super();
        this.setId(id);
    }

    getEmailaddress(): string {
        return this.emailaddress;
    }

    setEmailaddress(emailaddress: string): void {
        this.emailaddress = emailaddress;
    }
}
