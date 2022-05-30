export enum Role {
    Admin = 1, RoleAdmin = 2, GameResultAdmin = 4, Referee = 8, All = 15
}

export function getRoleName(role: Role): string {
    if (role === Role.Admin) {
        return 'algemeen-beheerder';
    } else if (role === Role.RoleAdmin) {
        return 'rollen-beheerder';
    } else if (role === Role.GameResultAdmin) {
        return 'uitslagen-invoerder';
    } else if (role === Role.Referee) {
        return 'scheidsrechter';
    }
    return 'onbekend';
}