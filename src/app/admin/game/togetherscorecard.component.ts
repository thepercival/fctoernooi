import { Component, Input, OnInit, output } from '@angular/core';
import { AbstractControl, FormArray, FormControl, FormGroup } from '@angular/forms';
import { ScoreConfig, ScoreDirection, StructureNameService, TogetherGamePlace, TogetherScore } from 'ngx-sport';
import { TranslateScoreService } from '../../lib/translate/score';

@Component({
  selector: 'app-tournament-togetherscorecard',
  templateUrl: './togetherscorecard.component.html',
  styleUrls: ['./togetherscorecard.component.css']
})
export class ScoreTogetherCardComponent implements OnInit {
  @Input() form!: FormGroup;
  @Input() gamePlace!: TogetherGamePlace;
  @Input() structureNameService!: StructureNameService;
  
  onAfterEdit = output<void>();
  public firstScoreConfig!: ScoreConfig;

  constructor(private translate: TranslateScoreService) {
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
    return this.translate.getScoreNameSingular(calculateScore);
  }

  getInputScoreDescription() {
    let description = '';
    if (this.firstScoreConfig.getDirection() === ScoreDirection.Upwards && this.firstScoreConfig.getMaximum() > 0) {
      description = 'eerste bij ' + this.firstScoreConfig.getMaximum() + ' ';
    }
    return description + this.translate.getScoreNamePlural(this.firstScoreConfig);
  }

  postUpdate() {
    this.onAfterEdit.emit();
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
    if (scoreConfig.getDirection() !== ScoreDirection.Upwards || scoreConfig.getMaximum() === 0) {
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
    if (scoreConfig.getDirection() === ScoreDirection.Upwards && scoreConfig.getMaximum() > 0) {
      description = 'eerste bij ' + scoreConfig.getMaximum() + ' ';
    }
    return description + this.translate.getScoreNamePlural(scoreConfig);
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
