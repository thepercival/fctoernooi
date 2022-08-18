import { Component, Input, OnInit, TemplateRef } from '@angular/core';
import { AbstractControl, UntypedFormGroup } from '@angular/forms';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { JsonGameAmountConfig, VoetbalRange } from 'ngx-sport';

@Component({
  selector: 'app-tournament-gameamountconfigs-edit',
  templateUrl: './edit.component.html',
  styleUrls: ['./edit.component.css']
})
export class GameAmountConfigEditComponent implements OnInit {
  @Input() gameAmountControls!: GameAmountConfigControl[];
  @Input() label!: string;
  @Input() form!: UntypedFormGroup;

  range: number[] = [];


  constructor(
    private modalService: NgbModal
  ) {
  }

  ngOnInit() {
    this.gameAmountControls.forEach((gameAmountControl: GameAmountConfigControl) => {
      if (gameAmountControl.control === undefined) {
        return;
      }
      const value = gameAmountControl.control.value;
      if (value === undefined || value > gameAmountControl.range.max || value < gameAmountControl.range.min) {
        gameAmountControl.control.setValue(gameAmountControl.range.min);
      }
    });
  }

  getRange(range: VoetbalRange): number[] {
    const rangeAsArray = [];
    for (let i = range.min; i <= range.max; i++) {
      rangeAsArray.push(i);
    }
    return rangeAsArray;
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
  range: VoetbalRange;
  control: AbstractControl;
}
