import { Component, Input, OnChanges, OnInit, SimpleChanges, TemplateRef } from '@angular/core';
import { AbstractControl, FormArray, FormControl, FormGroup } from '@angular/forms';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { GameMode, JsonGameAmountConfig, VoetbalRange } from 'ngx-sport';

@Component({
  selector: 'app-tournament-gameamountconfigs-edit',
  templateUrl: './edit.component.html',
  styleUrls: ['./edit.component.css']
})
export class GameAmountConfigEditComponent implements OnInit, OnChanges {
  @Input() gameMode!: GameMode;
  @Input() gameAmountControls!: GameAmountConfigControl[];
  @Input() gameAmountRange!: VoetbalRange;
  @Input() form!: FormGroup;

  range: number[] = [];


  constructor(
    private modalService: NgbModal
  ) {
  }

  ngOnInit() {

  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes.gameAmountRange !== undefined && changes.gameAmountRange.currentValue !== changes.gameAmountRange.previousValue) {
      this.setRange();
      this.checkGameAmountControls();
    }
  }

  checkGameAmountControls() {
    this.gameAmountControls.forEach((gameAmountControl: GameAmountConfigControl) => {
      if (gameAmountControl.control === undefined) {
        return;
      }
      const value = gameAmountControl.control.value;
      if (value === undefined || value > this.gameAmountRange.max || value < this.gameAmountRange.min) {
        gameAmountControl.control.setValue(this.gameAmountRange.min);
      }
    });
  }

  private setRange() {
    this.range = [];
    for (let i = this.gameAmountRange.min; i <= this.gameAmountRange.max; i++) {
      this.range.push(i);
    }
  }

  getGamesDescription(): string {
    return this.gameMode === GameMode.Against ? 'aantal onderlinge duels' : 'aantal wedstrijden';
  }

  openModal(modalContent: TemplateRef<any>) {
    const activeModal = this.modalService.open(modalContent);
    activeModal.result.then(() => {
    }, (reason) => {
    });
  }
}

export interface GameAmountConfigControl {
  json: JsonGameAmountConfig;
  control: AbstractControl;
}
