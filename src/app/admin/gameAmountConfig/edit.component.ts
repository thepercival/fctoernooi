import { Component, Input, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';
import { GameMode, VoetbalRange } from 'ngx-sport';

@Component({
  selector: 'app-tournament-gameamountconfigs-edit',
  templateUrl: './edit.component.html',
  styleUrls: ['./edit.component.css']
})
export class GameAmountConfigEditComponent implements OnInit {
  @Input() gameMode: GameMode;
  @Input() formControls: FormControl[] = [];
  @Input() gameAmountRange: VoetbalRange;

  ramge: number[];

  ngOnInit() {
    this.initRange();
  }

  getGamesDescription(): string {
    return this.gameMode === GameMode.Against ? 'aantal onderlinge duels' : 'aantal wedstrijden';
  }

  private initRange() {
    this.ramge = [];
    for (let i = this.gameAmountRange.min; i <= this.gameAmountRange.max; i++) {
      this.ramge.push(i);
    }
  }
}
