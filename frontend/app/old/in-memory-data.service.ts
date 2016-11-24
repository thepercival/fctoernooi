import { InMemoryDbService } from 'angular-in-memory-web-api';

export class InMemoryDataService implements InMemoryDbService {
    createDb() {
        let competitionseasons = [
            { id: 11, name: 'EK', seasonname: '2012/2013', structure:'{}' },
            { id: 12, name: 'WK', seasonname: '2013/2014', structure:'{}' },
            { id: 13, name: 'DK', seasonname: '2012/2013', structure:'{}' },
            { id: 14, name: 'AK', seasonname: '2010/2011', structure:'{}' },
            { id: 15, name: 'AW', seasonname: '2010/2011', structure:'{}' },
            { id: 16, name: 'QW', seasonname: '2010/2011', structure:'{}' }
        ];
        return {competitionseasons};
    }
}
