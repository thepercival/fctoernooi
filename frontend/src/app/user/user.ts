export class User {
    protected id: number;
    protected name: string;
    protected emailaddress: string;

    // constructor
    constructor( emailaddress: string ) {
        this.setEmailaddress(emailaddress);
    }

    getId(): number {
        return this.id;
    }

    setId(id: number): void {
        this.id = id;
    }

    getEmailaddress(): string {
        return this.emailaddress;
    }

    setEmailaddress(emailaddress: string): void {
        this.emailaddress = emailaddress;
    }

    getName(): string {
        return this.name;
    }

    setName(name: string): void {
        this.name = name;
    }
}
