import { Injectable } from '@angular/core';
import { JsonIdentifiable } from 'ngx-sport';

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
            user = new User(json.id);
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
            emailaddress: user.getEmailaddress()
        };
    }
}

export interface JsonUser extends JsonIdentifiable {
    emailaddress?: string;
}

interface UserMap {
    [key: string]: User;
}
