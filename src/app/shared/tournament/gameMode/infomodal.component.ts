import { Component, OnInit } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { GameMode, NameService } from 'ngx-sport';

@Component({
    selector: 'app-ngbd-modal-gamemodeinfo',
    templateUrl: './infomodal.component.html',
    styleUrls: ['./infomodal.component.scss']
})
export class GameModeInfoModalComponent implements OnInit {
    public gameModeDefinitions: GameModeOption[];
    private nameService: NameService;

    constructor(public activeModal: NgbActiveModal) {
        this.nameService = new NameService();
    }

    ngOnInit() {
        this.gameModeDefinitions = [
            {
                value: GameMode.Against,
                examples: 'tennis of voetbal',
                scoreConfig: 'in te stellen op wedstrijdpunten(standaard) of scores',
                gameAmount: 'de grootte van de poule en het aantal onderlinge duels(in te stellen)'

            },
            {
                value: GameMode.Together,
                examples: 'sjoelen of wielrennen',
                scoreConfig: 'scores worden opgeteld',
                gameAmount: 'in te stellen'
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