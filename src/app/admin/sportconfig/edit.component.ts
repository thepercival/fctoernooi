import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import {
    Sport,
    SportConfig,
    SportConfigService,
    SportCustom,
    SportScoreConfigService,
    JsonField,
    SportMapper,
} from 'ngx-sport';
import { forkJoin } from 'rxjs';
import { CSSService } from '../../shared/common/cssservice';
import { MyNavigation } from '../../shared/common/navigation';
import { TournamentRepository } from '../../lib/tournament/repository';
import { SportConfigRepository } from '../../lib/ngx-sport/sport/config/repository';
import { StructureRepository } from '../../lib/ngx-sport/structure/repository';
import { FieldRepository } from '../../lib/ngx-sport/field/repository';
import { TournamentComponent } from '../../shared/tournament/component';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { PlanningRepository } from '../../lib/ngx-sport/planning/repository';
import { TranslateService } from '../../lib/translate';
import { SportConfigTabOrder } from '../../shared/tournament/sportconfigtaborder';

@Component({
    selector: 'app-tournament-sportconfig-edit',
    templateUrl: './edit.component.html',
    styleUrls: ['./edit.component.css']
})
export class SportConfigEditComponent extends TournamentComponent implements OnInit {
    sportConfig: SportConfig;
    activeTab: number;
    hasBegun: boolean;

    constructor(
        public cssService: CSSService,
        route: ActivatedRoute,
        router: Router,
        tournamentRepository: TournamentRepository,
        structureRepository: StructureRepository,
        public sportConfigService: SportConfigService,
        private myNavigation: MyNavigation,
        fb: FormBuilder,
        private modalService: NgbModal
    ) {
        super(route, router, tournamentRepository, structureRepository);
    }

    ngOnInit() {
        this.route.params.subscribe(params => {
            if (params.sportConfigId !== undefined) {
                this.activeTab = +params.tabId;
                super.myNgOnInit(() => this.postInit(+params.sportConfigId), false);
            }
        });
    }

    private getSportConfigById(id: number): SportConfig {
        if (id === undefined || id === 0) {
            return undefined;
        }
        return this.competition.getSportConfigs().find(sportConfig => id === sportConfig.getId());
    }

    private postInit(id: number) {
        this.hasBegun = this.structure.getRootRound().hasBegun();
        if (this.hasBegun) {
            this.setAlert('warning', 'er zijn al wedstrijden gespeeld, je kunt niet meer wijzigen');
        }
        this.sportConfig = this.getSportConfigById(id);
        if (this.sportConfig === undefined) {
            this.processing = false;
            return;
        }
        this.processing = false;
    }

    get SportConfigTabFields(): number { return SportConfigTabOrder.Fields; }
    get SportConfigTabScore(): number { return SportConfigTabOrder.Score; }
    get SportConfigTabPoints(): number { return SportConfigTabOrder.Points; }

    // onGetSport(sport?: Sport) {
    //     if (sport === undefined) {
    //         return this.navigateBack();
    //     }
    //     this.sportConfig = this.sportConfigService.createDefault(sport, this.competition, this.structure);
    //     this.initForm();
    // }


    // add(): boolean {
    //     this.processing = true;
    //     this.setAlert('info', 'de sport wordt gewijzigd');

    //     this.sportConfig.setWinPoints(this.form.value['winPoints']);
    //     this.sportConfig.setDrawPoints(this.form.value['drawPoints']);
    //     this.sportConfig.setWinPointsExt(this.form.value['winPointsExt']);
    //     this.sportConfig.setDrawPointsExt(this.form.value['drawPointsExt']);
    //     this.sportConfig.setLosePointsExt(this.form.value['losePointsExt']);

    //     this.sportConfigRepository.createObject(this.sportConfig, this.tournament)
    //         .subscribe(
    //             /* happy path */ sportConfigRes => {
    //                 const fieldReposAdds = [];
    //                 for (let priority = 1; priority <= this.form.value['nrOfFields']; priority++) {
    //                     const jsonField: JsonField = { priority, name: String(priority) };
    //                     fieldReposAdds.push(this.fieldRepository.createObject(jsonField, this.sportConfig, this.tournament));
    //                 }

    //                 forkJoin(fieldReposAdds).subscribe(results => {
    //                     this.planningRepository.create(this.structure, this.tournament, 1).subscribe(
    //                 /* happy path */ roundNumberOut => {
    //                             this.linkToSportConfig(); /* niet navigate back van kan van sport komen */
    //                             this.processing = false;
    //                         },
    //                 /* error path */ e => { this.setAlert('danger', e); this.processing = false; },
    //                 /* onComplete */() => this.processing = false
    //                     );
    //                 },
    //                     err => {
    //                         this.processing = false;
    //                         this.setAlert('danger', 'de wedstrijd is niet opgeslagen: ' + err);
    //                     }
    //                 );
    //             },
    //     /* error path */ e => { this.setAlert('danger', e); this.processing = false; },
    //     /* onComplete */() => { this.processing = false; }
    //         );
    //     return false;
    // }

    navigateBack() {
        this.myNavigation.back();
    }

    /*linkToSportConfig() {
        if (!this.competition.hasMultipleSportConfigs()) {
            this.router.navigate(['/admin/sportconfig'
                , this.tournament.getId(), this.competition.getFirstSportConfig().getId()]);
        } else {
            this.router.navigate(['/admin/sportconfigs', this.tournament.getId()]);
        }
    }*/

    // openMultiSportsModal(content) {
    //     this.modalService.open(content).result.then((result) => {
    //         if (result === 'continue') {
    //             this.router.navigate(['/admin/sportconfigs', this.tournament.getId()]);
    //         }
    //     }, (reason) => { });
    // }

    getFieldsDescription(): string {
        const translate = new TranslateService();
        return translate.getFieldNamePlural(this.sportConfig.getSport());
    }
}


