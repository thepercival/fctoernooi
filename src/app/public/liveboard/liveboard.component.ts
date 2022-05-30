import { Component, OnDestroy, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

import { CSSService } from '../../shared/common/cssservice';
import { GlobalEventsManager } from '../../shared/common/eventmanager';
import { MyNavigation } from '../../shared/common/navigation';
import { Liveboard } from '../../lib/liveboard';
import { EndRankingScreen, GamesScreen, PoulesRankingScreen, ResultsScreen, ScheduleScreen, SponsorScreen } from '../../lib/liveboard/screens';
import { TournamentRepository } from '../../lib/tournament/repository';
import { TournamentComponent } from '../../shared/tournament/component';
import { StructureRepository } from '../../lib/ngx-sport/structure/repository';
import { LiveboardLink } from '../../lib/liveboard/link';
import { StartLocationMap, StructureNameService } from 'ngx-sport';
import { IAlertType } from '../../shared/common/alert';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ScreenConfigRepository } from '../../lib/liveboard/screenConfig/repository';
import { ScreenConfig } from '../../lib/liveboard/screenConfig/json';
import { ScreenConfigName } from '../../lib/liveboard/screenConfig/name';
import { ScreenConfigsModalComponent } from './screenconfigsmodal.component';
import { Observable, of } from 'rxjs';
import { SponsorMapper } from '../../lib/sponsor/mapper';
import { FavoritesRepository } from '../../lib/favorites/repository';

@Component({
    selector: 'app-tournament-liveboard',
    templateUrl: './liveboard.component.html',
    styleUrls: ['./liveboard.component.scss']
})
export class LiveboardComponent extends TournamentComponent implements OnInit, OnDestroy {
    public activeScreen: SponsorScreen | ResultsScreen | ScheduleScreen | EndRankingScreen | PoulesRankingScreen | undefined;
    private screens: (SponsorScreen | ResultsScreen | ScheduleScreen | EndRankingScreen | PoulesRankingScreen)[] = [];
    public screenConfigs: ScreenConfig[] | undefined;
    public configModalIsOpen = false;
    public toggleProgress = false;
    public structureNameService!: StructureNameService;
    public startLocationMap!: StartLocationMap;

    constructor(
        route: ActivatedRoute,
        router: Router,
        tournamentRepository: TournamentRepository,
        structureRepository: StructureRepository,
        globalEventsManager: GlobalEventsManager,
        modalService: NgbModal,
        favRepository: FavoritesRepository,
        private screenConfigRepository: ScreenConfigRepository,
        public cssService: CSSService,
        private myNavigation: MyNavigation,
        private sponsorMapper: SponsorMapper
    ) {
        super(route, router, tournamentRepository, structureRepository, globalEventsManager, modalService, favRepository);
    }

    ngOnInit() {
        let screenConfigName: undefined | ScreenConfigName;
        this.route.queryParamMap.subscribe(params => {
            const screenConfigNameParam: string | null = params.get('screenconfigname');
            if (screenConfigNameParam !== null) {
                screenConfigName = <ScreenConfigName>screenConfigNameParam;
            }
        });

        super.myNgOnInit(() => {
            if (screenConfigName === undefined && !this.screenConfigRepository.hasObjects(this.tournament)) {
                this.openConfigModal(this.screenConfigRepository.getDefaultObjects());
            } else {
                // processScreens
                this.getScreenConfigs(screenConfigName)
                    .subscribe({
                        next: (screenConfigs: ScreenConfig[]) => {
                            this.processScreens(screenConfigs);
                        },
                        error: (e) => {
                            this.setAlert(IAlertType.Danger, e); this.processing = false;
                        }
                    });
            }
        });
    }

    protected getScreenConfigs(screenConfigName: ScreenConfigName | undefined): Observable<ScreenConfig[]> {
        if (screenConfigName !== undefined) {
            return of([this.sponsorMapper.getDefaultScreenConfig()]);
        }
        return this.screenConfigRepository.getObjects(this.tournament);
    }

    processScreens(screenConfigs: ScreenConfig[]) {
        this.startLocationMap = new StartLocationMap(this.tournament.getCompetitors());
        const link: LiveboardLink = { showIcon: false, tournamentId: this.tournament.getId(), link: 'wim' };
        this.globalEventsManager.toggleLiveboardIconInNavBar.emit(link);
        this.structureNameService = new StructureNameService(this.startLocationMap);
        const liveBoard = new Liveboard(screenConfigs);
        this.screens = liveBoard.getScreens(this.tournament, this.structure);
        // console.log(this.screens);
        this.screenConfigs = screenConfigs;
        if (this.screens.length > 0) {
            this.executeScheduledTask(screenConfigs);
        } else {
            this.setAlert(IAlertType.Danger, 'voor dit toernooi zijn er geen schermen beschikbaar, pas eventueel de tijden aan');
        }
        this.processing = false;
    }

    executeScheduledTask(screenConfigs: ScreenConfig[]) {
        if (this.configModalIsOpen) {
            return;
        }
        this.activeScreen = this.screens.shift();
        // this.processing = false;
        if (this.activeScreen === undefined) {
            this.processing = true;
            this.getDataAndProcessScreens(screenConfigs);
        } else {
            this.toggleProgress = !this.toggleProgress;
        }
    }

    getDataAndProcessScreens(screenConfigs: ScreenConfig[]) {
        this.setData(this.tournament.getId(), () => { this.processScreens(screenConfigs); });
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

    openConfigModal(screenConfigs: ScreenConfig[]): void {
        this.activeScreen = undefined;
        this.configModalIsOpen = true;

        const activeModal = this.modalService.open(ScreenConfigsModalComponent, { backdrop: 'static' });
        activeModal.componentInstance.screenConfigs = screenConfigs;
        activeModal.result.then((screenConfigs: ScreenConfig[]) => {
            this.configModalIsOpen = false;
            this.save(screenConfigs);
        }, (reason) => {
            this.configModalIsOpen = false;
            this.getDataAndProcessScreens(screenConfigs);
        });
    }

    save(screenConfigs: ScreenConfig[]): boolean {
        this.processing = true;

        this.screenConfigRepository.saveObjects(this.tournament, screenConfigs).subscribe({
            next: () => {
                this.getDataAndProcessScreens(screenConfigs);
            },
            complete: () => this.processing = false
        });
        return false;
    }



    navigateBack() {
        this.router.navigateByUrl(this.myNavigation.getPreviousUrl(''));
    }
}