
import { Sponsor } from "../../sponsor";
import { ScreenConfig } from "../screenConfig/json";
import { SponsorScreen } from "../screens";

export class SponsorScreensCreator {
    static readonly MaxNrOfSponsorScreens: number = 4;
    static readonly MaxNrOfSponsorsPerScreen: number = 4;

    constructor(protected screenConfig: ScreenConfig) {
    }

    getScreens(sponsors: Sponsor[]): SponsorScreen[] {
        if (sponsors.length === 0) {
            return [];
        }
        const screens: SponsorScreen[] = [];
        sponsors.forEach(sponsor => {
            let screen = this.getScreen(screens, sponsor.getScreenNr());
            if (screen === undefined && screens.length < SponsorScreensCreator.MaxNrOfSponsorScreens) {
                screen = new SponsorScreen(this.screenConfig, sponsor.getScreenNr());
                screens.push(screen);
            }
            if (screen && screen.getSponsors().length < SponsorScreensCreator.MaxNrOfSponsorsPerScreen) {
                screen.getSponsors().push(sponsor);
            }
        });
        return screens.sort((screen1: SponsorScreen, screen2: SponsorScreen): number => {
            return screen1.getNumber() > screen2.getNumber() ? 1 : -1;
        });
    }

    getScreen(screens: SponsorScreen[], screenNr: number): SponsorScreen | undefined {
        return screens.find((screen: SponsorScreen) => screen.getNumber() === screenNr);
    }

    getMaxNrOfSponsors(): number {
        return SponsorScreensCreator.MaxNrOfSponsorScreens * SponsorScreensCreator.MaxNrOfSponsorsPerScreen;
    }



}