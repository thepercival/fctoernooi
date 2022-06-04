import { Category, CategoryMap, RoundNumber, Structure } from 'ngx-sport';
import { ScreenConfig } from './liveboard/screenConfig/json';
import { ScreenConfigName } from './liveboard/screenConfig/name';
import { EndRankingScreenCreator } from './liveboard/screenCreator/endRanking';
import { PouleRankingScreensCreator } from './liveboard/screenCreator/pouleRanking';
import { ResultsScreenCreator } from './liveboard/screenCreator/results';
import { ScheduleScreenCreator } from './liveboard/screenCreator/schedule';
import { SponsorScreensCreator } from './liveboard/screenCreator/sponsors';

import {
    EndRankingScreen,
    PoulesRankingScreen,
    ResultsScreen,
    ScheduleScreen,
    SponsorScreen
} from './liveboard/screens';
import { Tournament } from './tournament';

export class Liveboard {
    static readonly MaxScreenLines: number = 8;

    constructor(private screenConfigs: ScreenConfig[]) {

    }

    // if more than one rank-screen, show schedulescreens in between
    getScreens(tournament: Tournament, firstRoundNumber: RoundNumber, categories: Category[]): (SponsorScreen | ResultsScreen | ScheduleScreen | EndRankingScreen | PoulesRankingScreen)[] {
        let screens: (SponsorScreen | ResultsScreen | ScheduleScreen | EndRankingScreen | PoulesRankingScreen)[] = [];

        const resultsScreens = this.getResultsScreens(firstRoundNumber, categories);
        resultsScreens.forEach((screenIt: ResultsScreen) => screens.push(screenIt));

        const scheduleScreens: ScheduleScreen[] = this.getScheduleScreens(firstRoundNumber, categories);
        scheduleScreens.forEach((screenIt: ScheduleScreen) => screens.push(screenIt));

        const pouleRankingsScreens: PoulesRankingScreen[] = this.getPouleRankingScreens(firstRoundNumber, categories);
        pouleRankingsScreens.forEach((screenIt: PoulesRankingScreen) => screens.push(screenIt));
        if (pouleRankingsScreens.length > 0 && scheduleScreens.length > 0) {
            screens = screens.concat(scheduleScreens);
        }

        const endRankingScreens: EndRankingScreen[] = this.getEndRankingScreens(categories);
        endRankingScreens.forEach((screenIt: EndRankingScreen) => screens.push(screenIt));

        const sponsorScreens: SponsorScreen[] = this.getSponsorScreens(tournament);
        sponsorScreens.forEach((screenIt: SponsorScreen) => screens.push(screenIt));

        return screens;
    }

    protected getResultsScreens(firstRoundNumber: RoundNumber, categories: Category[]): ResultsScreen[] {
        const screenConfig = this.getScreenConfig(ScreenConfigName.Results);
        if (screenConfig === undefined || !screenConfig.enabled) {
            return [];
        }
        const resultsScreenCreator = new ResultsScreenCreator(screenConfig, Liveboard.MaxScreenLines);
        return resultsScreenCreator.getScreens(firstRoundNumber, categories);
    }

    protected getScheduleScreens(firstRoundNumber: RoundNumber, categories: Category[]): ScheduleScreen[] {
        const screenConfig = this.getScreenConfig(ScreenConfigName.Schedule);
        if (screenConfig === undefined || !screenConfig.enabled) {
            return [];
        }
        const scheduleScreenCreator = new ScheduleScreenCreator(screenConfig, Liveboard.MaxScreenLines);
        return scheduleScreenCreator.getScreens(firstRoundNumber, categories);
    }

    protected getPouleRankingScreens(firstRoundNumber: RoundNumber, categories: Category[]): PoulesRankingScreen[] {
        const screenConfig = this.getScreenConfig(ScreenConfigName.PoulesRanking);
        if (screenConfig === undefined || !screenConfig.enabled) {
            return [];
        }
        const pouleRankingScreensCreator = new PouleRankingScreensCreator(screenConfig, Liveboard.MaxScreenLines);
        return pouleRankingScreensCreator.getScreens(firstRoundNumber, categories);
    }

    protected getEndRankingScreens(categories: Category[]): EndRankingScreen[] {
        const screenConfig = this.getScreenConfig(ScreenConfigName.EndRanking);
        if (screenConfig === undefined || !screenConfig.enabled) {
            return [];
        }
        const endRankingScreenCreator = new EndRankingScreenCreator(screenConfig, Liveboard.MaxScreenLines);
        return endRankingScreenCreator.getScreens(categories);
    }

    protected getSponsorScreens(tournament: Tournament): SponsorScreen[] {
        const screenConfig = this.getScreenConfig(ScreenConfigName.Sponsors);
        if (screenConfig === undefined || !screenConfig.enabled) {
            return [];
        }
        const sponsorScreensCreator = new SponsorScreensCreator(screenConfig);
        return sponsorScreensCreator.getScreens(tournament.getSponsors());
    }

    private getScreenConfig(screenConfigName: ScreenConfigName): ScreenConfig | undefined {
        return this.screenConfigs.find((screenConfig: ScreenConfig): boolean => screenConfig.name === screenConfigName);
    }

}
