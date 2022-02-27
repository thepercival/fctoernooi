import { Component, OnDestroy, OnInit, TemplateRef } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

import { CSSService } from '../../shared/common/cssservice';
import { GlobalEventsManager } from '../../shared/common/eventmanager';
import { MyNavigation } from '../../shared/common/navigation';
import { Liveboard } from '../../lib/liveboard';
import { EndRankingScreen, GamesScreen, LiveboardScreen, PoulesRankingScreen, ResultsScreen, ScheduleScreen, SponsorScreen } from '../../lib/liveboard/screens';
import { TournamentRepository } from '../../lib/tournament/repository';
import { TournamentComponent } from '../../shared/tournament/component';
import { StructureRepository } from '../../lib/ngx-sport/structure/repository';
import { LiveboardLink } from '../../lib/liveboard/link';
import { NameService, CompetitorMap } from 'ngx-sport';
import { IAlertType } from '../../shared/common/alert';
import { JsonScreenRefreshConfig } from '../../lib/liveboard/screenRefreshConfig';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { ScreenRefreshConfigBackEnd } from '../../lib/liveboard/screenRefreshConfig/backend';

@Component({
    selector: 'app-tournament-liveboard',
    templateUrl: './liveboard.component.html',
    styleUrls: ['./liveboard.component.scss']
})
export class LiveboardComponent extends TournamentComponent implements OnInit, OnDestroy {
    public activeScreen: SponsorScreen | ResultsScreen | ScheduleScreen | EndRankingScreen | PoulesRankingScreen | undefined;
    private screens: (SponsorScreen | ResultsScreen | ScheduleScreen | EndRankingScreen | PoulesRankingScreen)[] = [];
    public refreshConfig: JsonScreenRefreshConfig;
    public toggleProgress = false;
    private screenfilter: string | undefined;
    public nameService!: NameService;
    public refreshForm: FormGroup;
    public competitorMap!: CompetitorMap;

    constructor(
        route: ActivatedRoute,
        router: Router,
        tournamentRepository: TournamentRepository,
        structureRepository: StructureRepository,
        private screenRefreshConfigBackEnd: ScreenRefreshConfigBackEnd,
        private globalEventsManager: GlobalEventsManager,
        public cssService: CSSService,
        private myNavigation: MyNavigation,
        private modalService: NgbModal,
        fb: FormBuilder
    ) {
        super(route, router, tournamentRepository, structureRepository);
        this.refreshConfig = screenRefreshConfigBackEnd.get();
        // voor elke optie een veld maken!!
        this.refreshForm = fb.group({});

        this.getJsonRefreshControlItems().forEach((item: JsonRefreshControlItem) => {
            this.refreshForm.addControl(item.property, new FormControl());
        });
    }

    ngOnInit() {
        this.route.queryParamMap.subscribe(params => {
            const screenFilter: string | null = params.get('screenfilter');
            if (screenFilter !== null) {
                this.screenfilter = screenFilter;
            }
        });
        this.initRefreshControls();

        super.myNgOnInit(() => {
            this.processScreens();
        });
    }

    public initRefreshControlItems(): void {
        // apply on screen
    }

    public getJsonRefreshControlItems(): JsonRefreshControlItem[] {
        return [
            {
                property: 'poulesRanking',
                description: 'poulestanden',
                nrOfSeconds: this.refreshConfig.poulesRanking
            },
            {
                property: 'endRanking',
                description: 'eind rangschikking',
                nrOfSeconds: this.refreshConfig.endRanking
            },
            {
                property: 'schedule',
                description: 'programma',
                nrOfSeconds: this.refreshConfig.schedule
            },
            {
                property: 'results',
                description: 'uitslagen',
                nrOfSeconds: this.refreshConfig.results
            },
            {
                property: 'sponsors',
                description: 'sponsoren',
                nrOfSeconds: this.refreshConfig.sponsors
            }
        ];
    }

    protected initRefreshControls() {

        this.getJsonRefreshControlItems().forEach((item: JsonRefreshControlItem) => {
            const control = this.refreshForm.get(item.property);
            if (control === null) {
                return;
            }
            control.setValue(item.nrOfSeconds);
        });
    }

    getRefreshRange(): number[] {
        return [5, 10, 15, 20, 25, 30];
    }

    saveRefreshConfig(): JsonScreenRefreshConfig {
        const json: JsonScreenRefreshConfig = {
            poulesRanking: this.refreshForm.controls.poulesRanking.value,
            endRanking: this.refreshForm.controls.endRanking.value,
            schedule: this.refreshForm.controls.schedule.value,
            results: this.refreshForm.controls.results.value,
            sponsors: this.refreshForm.controls.sponsors.value
        };
        return json;
    }

    processScreens() {
        this.competitorMap = new CompetitorMap(this.tournament.getCompetitors());
        const link: LiveboardLink = { showIcon: false, tournamentId: this.tournament.getId(), link: 'wim' };
        this.globalEventsManager.toggleLiveboardIconInNavBar.emit(link);
        this.nameService = new NameService(this.competitorMap);
        const liveBoard = new Liveboard();
        this.screens = liveBoard.getScreens(this.tournament, this.structure, this.screenfilter);
        if (this.screens.length > 0) {
            this.executeScheduledTask();
        } else {
            this.setAlert(IAlertType.Danger, 'voor dit toernooi zijn er geen schermen beschikbaar, pas eventueel de tijden aan');
        }
        this.processing = false;
    }

    executeScheduledTask() {
        this.activeScreen = this.screens.shift();
        // this.processing = false;
        if (this.activeScreen === undefined) {
            this.processing = true;
            this.getDataAndProcessScreens();
        } else {
            this.toggleProgress = !this.toggleProgress;
        }
    }

    getDataAndProcessScreens() {
        this.setData(this.tournament.getId(), () => { this.processScreens(); });
    }

    ngOnDestroy() {
        this.globalEventsManager.toggleLiveboardIconInNavBar.emit({});
    }

    isPoulesRankingScreen(): boolean {
        return this.activeScreen instanceof PoulesRankingScreen;
    }

    getPoulesRankingScreen(): PoulesRankingScreen {
        const activeScreen = this.activeScreen;
        if (!(activeScreen instanceof PoulesRankingScreen)) {
            throw new Error('incorrect screen');
        }
        return activeScreen;
    }

    isEndRankingScreen(): boolean {
        return this.activeScreen instanceof EndRankingScreen;
    }

    getEndRankingScreen(): EndRankingScreen {
        const activeScreen = this.activeScreen;
        if (!(activeScreen instanceof EndRankingScreen)) {
            throw new Error('incorrect screen');
        }
        return activeScreen;
    }

    isGamesScreen(): boolean {
        return this.activeScreen instanceof GamesScreen;
    }

    getGamesScreen(): ResultsScreen | ScheduleScreen {
        const activeScreen = this.activeScreen;
        if (!(activeScreen instanceof GamesScreen)) {
            throw new Error('incorrect screen');
        }
        return activeScreen;
    }

    isSponsorScreen(): boolean {
        return this.activeScreen instanceof SponsorScreen;
    }

    getSponsorScreen(): SponsorScreen {
        const activeScreen = this.activeScreen;
        if (!(activeScreen instanceof SponsorScreen)) {
            throw new Error('incorrect screen');
        }
        return activeScreen;
    }

    getOrigin(): string {
        return location.origin;
    }

    public getRefreshAfterSeconds(activeScreen: SponsorScreen | ResultsScreen | ScheduleScreen | EndRankingScreen | PoulesRankingScreen): number {
        if (activeScreen instanceof SponsorScreen) {
            return this.refreshConfig.sponsors;
        } else if (activeScreen instanceof ResultsScreen) {
            return this.refreshConfig.results;
        } else if (activeScreen instanceof ScheduleScreen) {
            return this.refreshConfig.schedule;
        } else if (activeScreen instanceof EndRankingScreen) {
            return this.refreshConfig.endRanking;
        }
        return this.refreshConfig.poulesRanking;
    }

    openRefreshModal(modalContent: TemplateRef<any>): void {
        const activeModal = this.modalService.open(modalContent);
        activeModal.result.then((newConfig: JsonScreenRefreshConfig) => {
            this.screenRefreshConfigBackEnd.edit(newConfig);
            this.refreshConfig = newConfig;
        });
    }

    navigateBack() {
        this.router.navigateByUrl(this.myNavigation.getPreviousUrl(''));
    }
}

interface JsonRefreshControlItem {
    property: string;
    description: string;
    nrOfSeconds: number;
}

