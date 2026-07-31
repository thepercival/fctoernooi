import { ChangeDetectionStrategy, Component, inject, Injector, TemplateRef } from '@angular/core';
import { NgbActiveModal, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { Poule, NameService, CompetitionSport, AgainstGpp, AgainstH2h, StructureNameService } from 'ngx-sport';
import { Favorites } from '../../../lib/favorites';
import { InfoModalComponent } from '../infomodal/infomodal.component';
import { TOURNAMENT_UI_IMPORTS } from '../tournament.ui-imports';
import { RankingPouleComponent } from '../ranking/poule.component';
import { AgainstQualifyInfoComponent } from '../againstQualifyConfig/info.component';
import { RankingRulesComponent } from '../rankingrules/rankingrules.component';
import { POULE_RANKING_MODAL_INPUTS } from '../../modal-input-interfaces/poule-ranking-modal-inputs.interface';
import { INFO_MODAL_INPUTS } from '../../modal-input-interfaces/info-modal-inputs.interface';
import { createModalInjector } from '../../modal-input-interfaces/create-modal-injector';
@Component({
    selector: 'app-ngbd-modal-poule-ranking',
    templateUrl: './rankingmodal.component.html',
    styleUrls: ['./rankingmodal.component.scss'],
    standalone: true,
    imports: [TOURNAMENT_UI_IMPORTS, AgainstQualifyInfoComponent, RankingPouleComponent, RankingRulesComponent],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class PouleRankingModalComponent {
    private readonly modalInputs = inject(POULE_RANKING_MODAL_INPUTS, { optional: true });
    public poule!: Poule;
    public competitionSports!: CompetitionSport[];
    public favorites: Favorites | undefined;
    // public tournament!: Tournament;
    public activeTab = 1;
    public nameService!: NameService;
    public structureNameService!: StructureNameService;
    // public rankingService!: RankingService;
    private modalService = inject(NgbModal);
    public activeModal = inject(NgbActiveModal);

    constructor(
        private injector: Injector
        ) {
        if (this.modalInputs) {
            this.poule = this.modalInputs.poule;
            this.competitionSports = this.modalInputs.competitionSports;
            this.favorites = this.modalInputs.favorites;
            if (this.modalInputs.structureNameService) {
                this.structureNameService = this.modalInputs.structureNameService;
            }
        }
    }

    getHeader(): string {
        const header = this.structureNameService.getPouleName(this.poule, true);
        const singleCompetitionSport = this.getSingleCompetitionSport();
        if (singleCompetitionSport === undefined) {
            return header + ' - stand';
        }
        return header + ' - ' + singleCompetitionSport.getSport().getName();
    }

    openInfoModal(modalContent: TemplateRef<any>) {

        let header = 'rangschikking';
        if (this.competitionSports.length > 1) {
            header += '<small> per sport</small>';
        }
        const modalInjector = createModalInjector(this.injector, INFO_MODAL_INPUTS, {
            header,
            noHeaderBorder: true,
            modalContent
        });
        this.modalService.open(InfoModalComponent, { windowClass: 'info-modal', injector: modalInjector });
    }

    get singleAgainstCompetitionSport(): CompetitionSport | undefined {
        const singleCompetitionSport = this.getSingleCompetitionSport();
        if (singleCompetitionSport === undefined || !this.isAgainst(singleCompetitionSport)) {
            return undefined;
        }
        return singleCompetitionSport;
    }

    // get singleTogetherCompetitionSport(): CompetitionSport | undefined {
    //     const singleCompetitionSport = this.getSingleCompetitionSport();
    //     if (singleCompetitionSport === undefined || !this.isTogether(singleCompetitionSport)) {
    //         return undefined;
    //     }
    //     return singleCompetitionSport;
    // }

    getSingleCompetitionSport(): CompetitionSport | undefined {
        return this.competitionSports.length === 1 ? this.competitionSports[0] : undefined;
    }

    isAgainst(competitionSport: CompetitionSport): boolean {
        return (competitionSport.getVariant() instanceof AgainstH2h) || (competitionSport.getVariant() instanceof AgainstGpp);
    }

    // isTogether(competitionSport: CompetitionSport): boolean {
    //     return (competitionSport?.getVariant() instanceof Single) || (competitionSport.getVariant() instanceof AllInOneGame);
    // }
}
