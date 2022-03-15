import { Injectable } from '@angular/core';

import { User } from '../user';

@Injectable({
    providedIn: 'root'
})
export class UserMapper {
    protected cache: UserMap = {};
    constructor() { }

    toObject(json: JsonUser): User {
        let user = this.cache[json.id];
        if (user === undefined) {
            user = new User(json.id, json.nrOfCredits ?? 0, json.validateIn ?? 0);
            this.cache[user.getId()] = user;
        }
        if (json.emailaddress !== undefined) {
            user.setEmailaddress(json.emailaddress)
        }
        return user;
    }

    toJson(user: User): JsonUser {
        return {
            id: user.getId(),
            nrOfCredits: user.getNrOfCredits(),
            validateIn: user.getValidateIn(),
            emailaddress: user.getEmailaddress()
        };
    }
}

export interface JsonUser {
    id: number | string;
    nrOfCredits?: number;
    validateIn?: number;
    emailaddress?: string;
}

interface UserMap {
    [key: string]: User;
}
