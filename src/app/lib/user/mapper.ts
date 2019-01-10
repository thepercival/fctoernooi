import { Injectable } from '@angular/core';

import { User } from '../user';

@Injectable()
export class UserMapper {
    constructor() { }

    toObject(json: JsonUser): User {
        const user = new User(json.emailaddress);
        user.setId(json.id);
        user.setName(json.name);
        return user;
    }

    toJson(user: User): JsonUser {
        return {
            id: user.getId(),
            emailaddress: user.getEmailaddress(),
            name: user.getName()
        };
    }
}

export interface JsonUser {
    id?: number;
    emailaddress: string;
    name?: string;
}
