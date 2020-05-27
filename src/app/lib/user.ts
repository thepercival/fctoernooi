export class User {
    static readonly MIN_LENGTH_EMAIL = 6;
    static readonly MAX_LENGTH_EMAIL = 100;
    static readonly MIN_LENGTH_PASSWORD = 3;
    static readonly MAX_LENGTH_PASSWORD = 50;

    protected id: number;
    protected emailaddress: string;

    constructor(id: number) {
        this.id = id;
    }

    getId(): number {
        return this.id;
    }

    getEmailaddress(): string {
        return this.emailaddress;
    }

    setEmailaddress(emailaddress: string): void {
        this.emailaddress = emailaddress;
    }
}
