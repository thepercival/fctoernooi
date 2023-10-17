import { Component, OnInit, Input, TemplateRef } from '@angular/core';

import { Poule, Round, GameState, CompetitionSport, StructureNameService, StartLocation, Competitor, Place, AgainstSide, AgainstGamePlace, AgainstGame, ScoreConfigService, HorizontalMultipleQualifyRule, HorizontalSingleQualifyRule, VerticalMultipleQualifyRule, VerticalSingleQualifyRule } from 'ngx-sport';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { Favorites } from '../../../lib/favorites';
import { CSSService } from '../../common/cssservice';
import { InfoModalComponent } from '../infomodal/infomodal.component';
import { CompetitorRepository } from '../../../lib/ngx-sport/competitor/repository';
import { TournamentCompetitor } from '../../../lib/competitor';

@Component({
    selector: 'app-tournament-ranking-round',
    templateUrl: './round.component.html',
    styleUrls: ['./round.component.scss']
})
export class RankingRoundComponent implements OnInit {
    @Input() round!: Round;
    @Input() structureNameService!: StructureNameService;
    @Input() competitionSports!: CompetitionSport[];
    @Input() favorites: Favorites | undefined;
    @Input() first: boolean = true;
    public collapsed: boolean = true;
    public poules: Poule[] = [];
    // public gameMode!: GameMode;
    public popoverPlace: Place | undefined;

    constructor(
        public cssService: CSSService,
        private competitorRepository: CompetitorRepository,
        private scoreConfigService: ScoreConfigService,
        private modalService: NgbModal
    ) {
    }

    ngOnInit() {
        this.poules = this.round.getPoules();
        // const structureCell = this.round.getStructureCell();
        const state = this.round.getGamesState();
        const stateParent = this.round.getParentQualifyGroup()?.getParentRound().getGamesState();
        const childeren = this.round.getChildren();
        const stateChildren = this.getRoundsGameState(childeren);
        // const childNeedsRanking = this.roundsNeedRanking(childeren);
        if (state === GameState.InProgress) {
            this.collapsed = false;
        } else if (state === GameState.Created && (stateParent === undefined || stateParent === GameState.Finished)) {
            this.collapsed = false;
        } else if (state === GameState.Finished && (stateChildren === undefined || stateChildren === GameState.Created)) {
            this.collapsed = false;
        }
    }

    get Finished(): GameState { return GameState.Finished };
    get Home(): AgainstSide { return AgainstSide.Home };
    get Away(): AgainstSide { return AgainstSide.Away };
    
    getRoundsGameState(rounds: Round[]): GameState {
        if (rounds.every((round: Round) => round.getGamesState() === GameState.Finished)) {
            return GameState.Finished;
        } else if (rounds.some((round: Round) => round.getGamesState() !== GameState.Created)) {
            return GameState.InProgress;
        }
        return GameState.Created;
    }

    /*protected getPreviousPlace(place: Place): Place | undefined {
        let fromQualifyRule: HorizontalSingleQualifyRule | HorizontalMultipleQualifyRule | VerticalSingleQualifyRule | VerticalMultipleQualifyRule | undefined;
        try {
            fromQualifyRule = place.getRound().getParentQualifyGroup()?.getRuleByToPlace(place);
        } catch (e) { }
        if (fromQualifyRule === undefined) {
            return undefined;
        }
        if (fromQualifyRule instanceof HorizontalMultipleQualifyRule 
            || fromQualifyRule instanceof VerticalMultipleQualifyRule) {
            return undefined;
        }
        // HorizontalSingleQualifyRule | VerticalSingleQualifyRule
        return fromQualifyRule.getMappingByToPlace(place)?.;
    }*/
    
    allPlacesHaveCompetitors(poule: Poule): boolean {

        return poule.getPlaces().every((place: Place): boolean => {
            const startLocation = place.getStartLocation();
            if (startLocation === undefined) {
                return false;
            }
            return this.getCompetitor(startLocation) !== undefined;
        });
    }

    isInFavorites(place: Place): boolean {

        const startLocation = place.getStartLocation();
        if (startLocation === undefined) {
            return false;
        }
        return this.favorites?.hasPlace(place) ?? false;
    }

    hasCompetitor(place: Place): boolean {
        const startLocation = place.getStartLocation();
        if (startLocation === undefined) {
            return false;
        }
        return this.getCompetitor(startLocation) !== undefined;
    }

    getPlaceAlignClass(place: Place): string {
        return this.hasCompetitor(place) ? 'text-start' : 'text-center';
    }

    getCompetitorName(place: Place): string {
        const startLocation = place.getStartLocation();
        if (startLocation === undefined) {
            return '';
        }
        const competitor = this.getCompetitor(startLocation);
        if (competitor === undefined) {
            return '';
        }
        return competitor.getName();
    }

    showScore(poule: Poule): boolean {
        return poule.getGamesState() === GameState.InProgress || poule.getGamesState() === GameState.Finished;
    }

    public hasLogo(place: Place): boolean {
        const startLocation = place.getStartLocation();
        if (startLocation === undefined) {
            return false;
        }
        const competitor = this.getCompetitor(startLocation);
        return competitor ? this.competitorRepository.hasLogoExtension(<TournamentCompetitor>competitor) : false;
    }

    public getCompetitorLogoUrl(place: Place): string {
        const startLocation = place.getStartLocation();
        if (startLocation === undefined) {
            return '';
        }
        const competitor = this.getCompetitor(startLocation);
        return competitor ? this.competitorRepository.getLogoUrl(<TournamentCompetitor>competitor, 20) : '';
    } 

    getPlaceName(place: Place): string {
        return this.structureNameService.getPlaceFromName(place, true, false); 
    } 

    getCompetitor(startLocation: StartLocation): Competitor | undefined {
        return this.structureNameService.getStartLocationMap()?.getCompetitor(startLocation);
    }

    openInfoModal(modalContent: TemplateRef<any>) {
        const activeModal = this.modalService.open(InfoModalComponent, { windowClass: 'info-modal' });
        activeModal.componentInstance.header = 'puntentelling';
        activeModal.componentInstance.noHeaderBorder = true;
        activeModal.componentInstance.modalContent = modalContent;
    }

    getAgainstSides(): AgainstSide[] {
        return [AgainstSide.Home, AgainstSide.Away];
    }

    pouleShowKnockout(poule: Poule): boolean {
        if (poule.getPlaces().length !== 2 ) {
            return false;
        }
        const game = this.getPouleSingleAgainstGame(poule);
        return game !== undefined;
    }

    getPouleSingleAgainstGame(poule: Poule): AgainstGame|undefined {
        const games = poule.getGames();
        const game = games.pop();
        return games.length === 0 && game instanceof AgainstGame ? game : undefined;
    }

    getSidePlace(game: AgainstGame, side: AgainstSide): Place {
        const gamePlace = game.getSidePlaces(side).pop();
        if( gamePlace === undefined) {
            throw Error('a place should be got');
        }
        return gamePlace.getPlace();

    }
    
    getSideScore(game: AgainstGame, side: AgainstSide): string {
        if (game.getState() !== GameState.Finished) {
            return '';
        }
        const finalScore = this.scoreConfigService.getFinalAgainstScore(game);
        if (finalScore === undefined) {
            return '';
        }
        return '' + finalScore.get(side);
    }

    getCollapseDegrees(): 90 | 180 | 270 | undefined {
        return this.collapsed ? undefined : 90;
    }

    setPopoverPlace(place: Place) {
        this.popoverPlace = place;
    }
}
