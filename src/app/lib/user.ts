export class User {
    static readonly MIN_LENGTH_EMAIL = 6;
    static readonly MAX_LENGTH_EMAIL = 100;
    static readonly MIN_LENGTH_PASSWORD = 3;
    static readonly MAX_LENGTH_PASSWORD = 50;

    protected emailaddress: string = '';
    protected validated: boolean = false;
    protected nrOfCredits: number = 0;
    protected validateIn: number = 0;

    constructor(
        protected id: number | string) {
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

    getValidated(): boolean {
        return this.validated;
    }

    setValidated(validated: boolean): void {
        this.validated = validated;
    }

    getNrOfCredits(): number {
        return this.nrOfCredits;
    }

    setnrOfCredits(nrOfCredits: number): void {
        this.nrOfCredits = nrOfCredits;
    }

    getValidateIn(): number {
        return this.validateIn;
    }

    setValidateIn(validateIn: number): void {
        this.validateIn = validateIn;
    }
}
