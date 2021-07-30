export class User {
    static readonly MIN_LENGTH_EMAIL = 6;
    static readonly MAX_LENGTH_EMAIL = 100;
    static readonly MIN_LENGTH_PASSWORD = 3;
    static readonly MAX_LENGTH_PASSWORD = 50;

    protected emailaddress: string = '';

    constructor(protected id: number | string) {
    }

    getId(): string | number {
        return this.id;
    }

    /*setId(id: string | number): void {
        this.id = id;
    }*/

    getEmailaddress(): string {
        return this.emailaddress;
    }

    setEmailaddress(emailaddress: string): void {
        this.emailaddress = emailaddress;
    }
}
