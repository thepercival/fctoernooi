import { AfterViewChecked, Component, ElementRef, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';
import { FormControl } from '@angular/forms';
import { GameMode, JsonGameAmountConfig, NameService, Place } from 'ngx-sport';
import { TournamentCompetitor } from '../../lib/competitor';

@Component({
  selector: 'app-tournament-gameamountconfigs-edit',
  templateUrl: './edit.component.html',
  styleUrls: ['./edit.component.css']
})
export class GameAmountConfigEditComponent implements OnInit {
  @Input() gameMode: GameMode;
  @Input() formControls: FormControl[] = [];
  @Input() validations: GameAmountConfigValidations;
  @Input() hasBegun: boolean;

  headtoheadRange: number[];

  ngOnInit() {
    this.initRange();
  }

  getGamesDescription(): string {
    return this.gameMode === GameMode.Against ? 'aantal onderlinge duels' : 'aantal wedstrijden';
  }

  private initRange() {
    this.headtoheadRange = [];
    for (let i = this.validations.minNrOfHeadtohead; i <= this.validations.maxNrOfHeadtohead; i++) {
      this.headtoheadRange.push(i);
    }
  }
}
