
export class UserId {
    constructor(protected id: number) {
    }

    getId(): number {
        return this.id;
    }
}


export class User {
    static readonly MIN_LENGTH_EMAIL = 6;
    static readonly MAX_LENGTH_EMAIL = 100;
    static readonly MIN_LENGTH_PASSWORD = 3;
    static readonly MAX_LENGTH_PASSWORD = 50;

    constructor(
        protected userId: UserId,
        protected emailaddress: string = '',
        protected validated: boolean = false,
        protected nrOfCredits: number = 0,
        protected validateIn: number = 0,
    ) {
    }

    getId(): string | number {
        return this.userId.getId();
    }

    getEmailaddress(): string {
        return this.emailaddress;
    }

    getValidated(): boolean {
        return this.validated;
    }
    getNrOfCredits(): number {
        return this.nrOfCredits;
    }

    getValidateIn(): number {
        return this.validateIn;
    }
}

