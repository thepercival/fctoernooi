export class Role {
    static readonly ADMIN = 1;
    static readonly ROLEADMIN = 2;
    static readonly GAMERESULTADMIN = 4;
    static readonly REFEREE = 8;
    static readonly ALL = 15;

    static getName(role: number): string {
        if (role === Role.ADMIN) {
            return 'algemeen-beheerder';
        } else if (role === Role.GAMERESULTADMIN) {
            return 'uitslagen-invoerder';
        } else if (role === Role.ROLEADMIN) {
            return 'rollen-beheerder';
        } else if (role === Role.REFEREE) {
            return 'scheidsrechter';
        }
        return 'onbekend';
    }
}
