import { Category, Identifiable, StartLocation } from 'ngx-sport';
import { RegistrationState } from './registration/state';

export class TournamentRegistration extends Identifiable {

    private startLocation: StartLocation | undefined;
    
    constructor(
        private state: RegistrationState, 
        private name: string,
        private emailaddress: string,
        private telephone: string,
        private category: Category,
        private info: string) {
        super();
    }

    getState(): RegistrationState {
        return this.state;
    }

    getName(): string {
        return this.name;
    }

    setName(name: string): void {
        this.name = name;
    }

    getEmailaddress(): string {
        return this.emailaddress;
    }

    setEmailaddress(emailaddress: string): void {
        this.emailaddress = emailaddress;
    }

    getTelephone(): string {
        return this.telephone;
    }

    setTelephone(telephone: string): void {
        this.telephone = telephone;
    }

    getCategory(): Category {
        return this.category;
    }

    getInfo(): string {
        return this.info;
    }

    setInfo(info: string): void {
        this.info = info;
    }

    getStartLocation(): StartLocation | undefined {
        return this.startLocation;
    }

    setStartLocation(startLocation: StartLocation|undefined): void {
        this.startLocation = startLocation;
    }
}
