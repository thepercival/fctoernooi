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
import { NameService, CompetitorMap } from 'ngx-sport';
import { IAlertType } from '../../shared/common/alert';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { FormBuilder } from '@angular/forms';
import { ScreenConfigRepository } from '../../lib/liveboard/screenConfig/repository';
import { ScreenConfig } from '../../lib/liveboard/screenConfig/json';
import { ScreenConfigLocalBackEnd } from '../../lib/liveboard/screenConfig/localBackend';
import { ScreenConfigName } from '../../lib/liveboard/screenConfig/name';
import { ScreenConfigsModalComponent } from './screenconfigsmodal.component';
import { forkJoin, Observable, of } from 'rxjs';
import { SponsorMapper } from '../../lib/sponsor/mapper';

@Component({
    selector: 'app-tournament-liveboard',
    templateUrl: './liveboard.component.html',
    styleUrls: ['./liveboard.component.scss']
})
export class LiveboardComponent extends TournamentComponent implements OnInit, OnDestroy {
    public activeScreen: SponsorScreen | ResultsScreen | ScheduleScreen | EndRankingScreen | PoulesRankingScreen | undefined;
    private screens: (SponsorScreen | ResultsScreen | ScheduleScreen | EndRankingScreen | PoulesRankingScreen)[] = [];
    public screenConfigs: ScreenConfig[] | undefined;
    public toggleProgress = false;
    public nameService!: NameService;
    public competitorMap!: CompetitorMap;

    constructor(
        route: ActivatedRoute,
        router: Router,
        tournamentRepository: TournamentRepository,
        structureRepository: StructureRepository,
        private screenConfigRepository: ScreenConfigRepository,
        private screenConfigLocalBackEnd: ScreenConfigLocalBackEnd,
        private globalEventsManager: GlobalEventsManager,
        public cssService: CSSService,
        private myNavigation: MyNavigation,
        private modalService: NgbModal,
        private sponsorMapper: SponsorMapper
    ) {
        super(route, router, tournamentRepository, structureRepository);
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
            this.getScreenConfigs(screenConfigName)
                .subscribe({
                    next: (screenConfigs: ScreenConfig[]) => {
                        if (screenConfigs.length > 1 && this.screenConfigLocalBackEnd.firstTime(this.tournament)) {
                            this.screenConfigLocalBackEnd.save(this.tournament);
                            this.openConfigModal(screenConfigs);
                        } else {
                            console.log('processScreens');
                            this.processScreens(screenConfigs);
                        }
                    },
                    error: (e) => {
                        this.setAlert(IAlertType.Danger, e); this.processing = false;
                    }
                });
        });
    }

    protected getScreenConfigs(screenConfigName: ScreenConfigName | undefined): Observable<ScreenConfig[]> {
        if (screenConfigName === undefined) {
            return this.screenConfigRepository.getObjects(this.tournament);
        }
        return of([this.sponsorMapper.getDefaultScreenConfig()]);
    }

    processScreens(screenConfigs: ScreenConfig[]) {
        this.competitorMap = new CompetitorMap(this.tournament.getCompetitors());
        const link: LiveboardLink = { showIcon: false, tournamentId: this.tournament.getId(), link: 'wim' };
        this.globalEventsManager.toggleLiveboardIconInNavBar.emit(link);
        this.nameService = new NameService(this.competitorMap);
        const liveBoard = new Liveboard(screenConfigs);
        this.screens = liveBoard.getScreens(this.tournament, this.structure);
        this.screenConfigs = screenConfigs;
        console.log(this.screens);
        if (this.screens.length > 0) {
            this.executeScheduledTask(screenConfigs);
        } else {
            this.setAlert(IAlertType.Danger, 'voor dit toernooi zijn er geen schermen beschikbaar, pas eventueel de tijden aan');
        }
        this.processing = false;
    }

    executeScheduledTask(screenConfigs: ScreenConfig[]) {
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
        const activeModal = this.modalService.open(ScreenConfigsModalComponent, { backdrop: 'static' });
        activeModal.componentInstance.screenConfigs = screenConfigs;
        activeModal.result.then((screenConfigs: ScreenConfig[]) => {
            // save to server and reload
            this.save(screenConfigs);


        }, (reason) => { });
    }

    save(screenConfigs: ScreenConfig[]): boolean {
        this.processing = true;
        this.setAlert(IAlertType.Info, 'de sponsor wordt opgeslagen');

        const reposUpdates: Observable<ScreenConfig>[] = screenConfigs.map((screenConfig: ScreenConfig) => {
            if (screenConfig.id > 0) {
                return this.screenConfigRepository.editObject(screenConfig, this.tournament);
            }
            return this.screenConfigRepository.createObject(screenConfig, this.tournament);
        });
        forkJoin(reposUpdates).subscribe({
            next: (results) => {
                this.processScreens(screenConfigs);
            },
            complete: () => this.processing = false
        });
        return false;
    }



    navigateBack() {
        this.router.navigateByUrl(this.myNavigation.getPreviousUrl(''));
    }
}