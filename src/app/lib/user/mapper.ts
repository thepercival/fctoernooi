import { Injectable } from '@angular/core';
import { JsonIdentifiable } from 'ngx-sport';

import { User, UserId } from '../user';

@Injectable({
    providedIn: 'root'
})
export class UserMapper {
    // protected cache: UserMap = {};
    constructor() { }

    toObject(json: JsonUser): User {
        return new User(new UserId(+json.id), json.emailaddress, json.validated, json.nrOfCredits);
        // let user = this.cache[json.id];
        // if (user === undefined) {
        //     user = new User(json.id);
        //     this.cache[user.getId()] = user;
        // }
        // if (json.emailaddress !== undefined) {
        //     user.setEmailaddress(json.emailaddress)
        // }
        // if (json.validated !== undefined) {
        //     user.setValidated(json.validated)
        // }
        // if (json.nrOfCredits !== undefined) {
        //     user.setnrOfCredits(json.nrOfCredits)
        // }
        // if (json.validateIn !== undefined) {
        //     user.setValidateIn(json.validateIn)
        // }
        // return user;
    }

    // toJson(user: User): JsonUser {
    //     return {
    //         id: user.getId(),
    //         emailaddress: user.getEmailaddress()
    //     };
    // }
}



export interface JsonUser extends JsonIdentifiable {
    validated: boolean;
    nrOfCredits: number;
    validateIn: number;
    emailaddress: string;
}

interface UserMap {
    [key: string]: User;
}
