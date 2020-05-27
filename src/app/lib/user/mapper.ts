import { Injectable } from '@angular/core';

import { User } from '../user';

@Injectable()
export class UserMapper {
    protected static users = {};
    constructor() { }

    toObject(json: JsonUser): User {
        let user = UserMapper.users[json.id];
        if (user === undefined) {
            user = new User(json.id);
            UserMapper.users[user.getId()] = user;
        }
        user.setEmailaddress(json.emailaddress)
        return user;
    }

    toJson(user: User): JsonUser {
        return {
            id: user.getId(),
            emailaddress: user.getEmailaddress()
        };
    }
}

export interface JsonUser {
    id: number;
    emailaddress?: string;
}
