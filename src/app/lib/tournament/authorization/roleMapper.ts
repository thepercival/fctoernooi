import { Injectable } from '@angular/core';
import { Role } from '../../role';


@Injectable({
    providedIn: 'root'
})
export class RoleMapper {
    constructor() { }

    mapRolesToNumber(roles: Role[]): number {
        let result = 0;
        for (const role of roles) {
            result += role;
        }
        return result;
    }

    mapNumberToRoles(rolesNumber: number): Role[] {
        const roles = [];
        for (const role in Role) {            
            const roleValue = Role[role as keyof typeof Role];
            if ((rolesNumber & roleValue) === roleValue) {
                roles.push(roleValue);
            }            
        }
        return roles;
    }

    getAllRolesAsNumber(): number {
        let roles = 0;
        for (const role in Role) {            
            const roleValue = Role[role as keyof typeof Role];
            roles |= roleValue;
        }
        return roles;
    }
}
