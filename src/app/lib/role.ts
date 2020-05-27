export class Role {
    static readonly ADMIN = 1;
    static readonly ROLEADMIN = 2;
    static readonly GAMERESULTADMIN = 4;
    static readonly REFEREE = 8;
    static readonly ALL = 15;

    static getDescription(role: number): string {
        if (role === Role.ADMIN) {
            return 'beheerder algemeen';
        } else if (role === Role.GAMERESULTADMIN) {
            return 'beheerder uitslagen';
        } else if (role === Role.ROLEADMIN) {
            return 'beheerder rollen';
        }
        return 'onbekend';
    }
}
