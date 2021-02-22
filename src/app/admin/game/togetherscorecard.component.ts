import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { AbstractControl, FormArray, FormControl, FormGroup } from '@angular/forms';
import { NameService, ScoreConfig, TogetherScore } from 'ngx-sport';
import { TogetherGamePlace } from 'ngx-sport/src/game/place/together';
import { TranslateService } from '../../lib/translate';

@Component({
  selector: 'app-tournament-togetherscorecard',
  templateUrl: './togetherscorecard.component.html',
  styleUrls: ['./togetherscorecard.component.css']
})
export class ScoreTogetherCardComponent implements OnInit {
  @Input() form!: FormGroup;
  @Input() gamePlace!: TogetherGamePlace;
  @Input() nameService!: NameService;
  @Output() afterEdit = new EventEmitter<void>();
  public firstScoreConfig!: ScoreConfig;

  constructor() {
  }

  ngOnInit() {
    this.firstScoreConfig = this.gamePlace.getGame().getScoreConfig();
    this.form.addControl('scores', new FormArray([]));
    const scoreControls = this.getScoreControls();
    this.gamePlace.getScores().forEach((score: TogetherScore) => {
      scoreControls.push(new FormControl(score.getScore()));
    });
    if (scoreControls.length === 0) {
      scoreControls.push(new FormControl(0));
    }
    if (this.firstScoreConfig !== this.firstScoreConfig.getCalculate()) {
      this.form.addControl('calculate', new FormControl(0));
    }
  }

  getScoreControls(): FormArray {
    return <FormArray>this.form.controls.scores;
  }

  getCalculateScoreUnitName(): string {
    const calculateScore = this.firstScoreConfig.getCalculate();
    const translateService = new TranslateService();
    return translateService.getScoreNameSingular(calculateScore);
  }

  getInputScoreDescription() {
    let description = '';
    if (this.firstScoreConfig.getDirection() === ScoreConfig.UPWARDS && this.firstScoreConfig.getMaximum() > 0) {
      description = 'eerste bij ' + this.firstScoreConfig.getMaximum() + ' ';
    }
    const translate = new TranslateService();
    return description + translate.getScoreNamePlural(this.firstScoreConfig);
  }

  postUpdate() {
    this.afterEdit.emit();
  }

  // getInputScores(): TogetherScore[] {
  //   // get values from controls
  //   return [];
  // }

  isScoreValid(score: number): boolean {
    return score >= 0;
  }

  getValidateClass(formControl: AbstractControl, scoreConfig: ScoreConfig): string {
    const score = formControl.value;
    if (!this.isScoreValid(formControl.value)) {
      return 'is-invalid';
    }
    if (scoreConfig.getDirection() !== ScoreConfig.UPWARDS || scoreConfig.getMaximum() === 0) {
      return 'is-valid';
    }
    if (score === scoreConfig.getMaximum()) {
      return 'is-valid';
    }
    return 'is-warning';
  }

  getCalculateScoreDescription() {
    const scoreConfig = this.firstScoreConfig.getCalculate();
    let description = '';
    if (scoreConfig.getDirection() === ScoreConfig.UPWARDS && scoreConfig.getMaximum() > 0) {
      description = 'eerste bij ' + scoreConfig.getMaximum() + ' ';
    }
    const translate = new TranslateService();
    return description + translate.getScoreNamePlural(scoreConfig);
  }

  allScoresValid(): boolean {
    // walk through formgroup this.form.controls.gamePlace.controls
    return false;
  }

  // allScoresAreInvalid(): boolean {
  //   return this.scoreControls.every((scoreControl: AgainstScoreFormControl) => !scoreControl.isScoreValid());

  // }



  addScoreControl() {
    this.getScoreControls().push(new FormControl(0));
    // this.postScoreControlUpdate();
  }

  removeScoreControl() {
    this.getScoreControls().removeAt(this.getScoreControls().length - 1);
    // this.updateCalculateScoreControl();
  }

}
