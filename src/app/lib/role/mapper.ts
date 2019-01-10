import { Injectable } from '@angular/core';

import { Role } from '../role';
import { Tournament } from '../tournament';
import { JsonUser, UserMapper } from '../user/mapper';

/**
 * Created by coen on 10-10-17.
 */
@Injectable()
export class RoleMapper {
    constructor(private userMapper: UserMapper) { }

    toObject(json: JsonRole, tournament: Tournament): Role {
        const user = this.userMapper.toObject(json.user);

        const role = new Role(tournament, user, json.value);
        role.setId(json.id);
        return role;
    }

    toJson(role: Role): any {
        return {
            id: role.getId(),
            user: this.userMapper.toJson(role.getUser()),
            value: role.getValue()
        };
    }
}

export interface JsonRole {
    id?: number;
    user: JsonUser;
    value: number;
}
