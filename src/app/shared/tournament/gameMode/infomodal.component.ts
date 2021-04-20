import { Component } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { GameMode, NameService } from 'ngx-sport';

@Component({
    selector: 'app-ngbd-modal-gamemodeinfo',
    templateUrl: './infomodal.component.html',
    styleUrls: ['./infomodal.component.scss']
})
export class GameModeInfoModalComponent {
    public gameModeDefinitions: GameModeOption[];
    private nameService: NameService;

    constructor(public activeModal: NgbActiveModal) {
        this.nameService = new NameService();
        this.gameModeDefinitions = [
            {
                value: GameMode.Against,
                examples: 'tennis of voetbal',
                scoreConfig: 'wedstrijd-punten, score of beide',
                gameAmount: 'de poule-grootte en aantal onderlinge duels'

            },
            {
                value: GameMode.Single,
                examples: 'sjoelen',
                scoreConfig: 'score',
                gameAmount: 'te kiezen aantal'
            },
            {
                value: GameMode.AllInOneGame,
                examples: 'wielrennen',
                scoreConfig: 'score',
                gameAmount: 'te kiezen aantal'
            }
        ];
    }

    getClass(gameMode: GameMode): string {
        return gameMode === GameMode.Against ? 'against' : 'together';
    }

    getName(gameMode: GameMode): string {
        return this.nameService.getGameModeName(gameMode);
    }

    getAbbreviation(gameMode: GameMode): string {
        return this.getName(gameMode).substr(0, 1).toUpperCase();
    }
}

export interface GameModeOption {
    value: GameMode;
    examples: string;
    scoreConfig: string;
    gameAmount: string;
}