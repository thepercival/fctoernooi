import { InMemoryDbService } from 'angular-in-memory-web-api';
export declare class InMemoryDataService implements InMemoryDbService {
    createDb(): {
        competitionseasons: {
            id: number;
            name: string;
            seasonname: string;
            structure: string;
        }[];
    };
}
