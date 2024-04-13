import { Component, EventEmitter, Input, OnInit, Output, TemplateRef } from '@angular/core';
import { AbstractControl, FormGroup } from '@angular/forms';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { CompetitionSport, JsonCompetitionSport, JsonGameAmountConfig, JsonSport, NameService, Sport, VoetbalRange } from 'ngx-sport';

@Component({
  selector: 'app-tournament-gameamountconfigs-edit',
  templateUrl: './edit.component.html',
  styleUrls: ['./edit.component.css']
})
export class GameAmountConfigEditComponent implements OnInit {
  @Input() gameAmountControls!: GameAmountConfigControl[];
  @Input() label!: string;
  @Input() typedForm!: FormGroup;
  @Output() closed = new EventEmitter<void>();

  range: number[] = [];
  public nameService = new NameService();

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
      this.closed.emit();
    }, (reason) => {
      this.closed.emit();
    });
  }

  sportIsUsedMultipleTimes(jsonCompetitionSport: JsonCompetitionSport): boolean {
    return this.gameAmountControls.some((gameAmountControl: GameAmountConfigControl) => {
      return gameAmountControl.jsonCompetitionSport.sport.name === jsonCompetitionSport.sport.name
        && gameAmountControl.json.competitionSportId !== jsonCompetitionSport.id;
    })
  }
}

export interface GameAmountConfigControl {
  json: JsonGameAmountConfig;
  jsonCompetitionSport: JsonCompetitionSport;
  range: VoetbalRange;
  control: AbstractControl;
}
