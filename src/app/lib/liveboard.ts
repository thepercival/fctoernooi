import { Structure } from 'ngx-sport';
import { EndRankingScreenCreator } from './liveboard/screenCreator/endRanking';
import { PouleRankingScreensCreator } from './liveboard/screenCreator/pouleRanking';
import { ResultsScreenCreator } from './liveboard/screenCreator/results';
import { ScheduleScreenCreator } from './liveboard/screenCreator/schedule';
import { SponsorScreensCreator } from './liveboard/screenCreator/sponsors';

import {
    LiveboardScreen,
    PoulesRankingScreen,
    ScheduleScreen
} from './liveboard/screens';
import { Tournament } from './tournament';

export class Liveboard {
    private resultsScreenCreator: ResultsScreenCreator;
    private scheduleScreenCreator: ScheduleScreenCreator;
    private sponsorScreensCreator: SponsorScreensCreator;
    private endRankingScreenCreator: EndRankingScreenCreator;
    private pouleRankingScreensCreator: PouleRankingScreensCreator;

    static readonly MaxScreenLines: number = 8;

    constructor(
    ) {
        this.resultsScreenCreator = new ResultsScreenCreator(Liveboard.MaxScreenLines);
        this.scheduleScreenCreator = new ScheduleScreenCreator(Liveboard.MaxScreenLines);
        this.sponsorScreensCreator = new SponsorScreensCreator();
        this.endRankingScreenCreator = new EndRankingScreenCreator(Liveboard.MaxScreenLines);
        this.pouleRankingScreensCreator = new PouleRankingScreensCreator(Liveboard.MaxScreenLines);
    }

    // if more than one rank-screen, show schedulescreens in between
    getScreens(tournament: Tournament, structure: Structure, screenfilter: string | undefined): LiveboardScreen[] {
        let screens: LiveboardScreen[] = [];

        if (screenfilter === undefined) {
            const resultsScreen = this.resultsScreenCreator.getScreen(structure.getLastRoundNumber());
            if (!resultsScreen.isEmpty()) {
                screens.push(resultsScreen);
            }
            const scheduleScreens: ScheduleScreen[] = this.scheduleScreenCreator.getScreens(structure.getFirstRoundNumber());
            scheduleScreens.forEach((screenIt: ScheduleScreen) => screens.push(screenIt));
            const pouleRankingsScreens: PoulesRankingScreen[] = this.pouleRankingScreensCreator.getScreens(structure.getFirstRoundNumber());
            screens = screens.concat(pouleRankingsScreens)
            if (pouleRankingsScreens.length > 0) {
                screens = screens.concat(scheduleScreens);
            }
            screens = screens.concat(this.endRankingScreenCreator.getScreens(structure));
        }
        if (screenfilter === undefined || screenfilter === 'sponsors') {
            screens = screens.concat(this.sponsorScreensCreator.getScreens(tournament.getSponsors()));
        }

        return screens;
    }
}
