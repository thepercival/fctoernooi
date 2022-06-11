import { Component, Input, OnInit } from '@angular/core';
import { AbstractControl, FormControl, FormGroup, Validators } from '@angular/forms';
import { AgainstGame, Field, Place, PlanningConfig, PlanningEditMode, Structure, StructureNameService, TogetherGame } from 'ngx-sport';
import { DateFormatter } from '../../lib/dateFormatter';
import { TranslateService } from '../../lib/translate';

@Component({
  selector: 'app-tournament-basegame-edit',
  templateUrl: './editbase.component.html',
  styleUrls: ['./editbase.component.scss']
})
export class GameBaseEditComponent implements OnInit {
  @Input() form!: FormGroup;
  @Input() game!: AgainstGame | TogetherGame;
  @Input() structureNameService!: StructureNameService;
  @Input() structure!: Structure;
  // @Output() afterEdit = new EventEmitter<void>();
  // public firstScoreConfig!: ScoreConfig;

  constructor(
    private translate: TranslateService,
    public dateFormatter: DateFormatter) {
  }

  ngOnInit() {
    this.form.addControl('field', new FormControl(
      { value: this.game.getField(), disabled: !this.manualEditMode() },
      Validators.compose([
        Validators.required
      ])
    ));
    this.form.addControl('referee', new FormControl(
      { value: this.game.getReferee(), disabled: !this.manualEditMode() }
    ));
    this.form.addControl('refereePlace', new FormControl(
      { value: this.game.getRefereePlace(), disabled: !this.manualEditMode() }
    ));
    this.form.addControl('date', new FormControl(''));
    this.form.addControl('time', new FormControl(''));

    this.setDate(this.form.controls.date, this.form.controls.time, this.game.getStartDateTime());

    // const startDateTime = this.getDate(this.form.controls.date, this.form.controls.time);

    // this.firstScoreConfig = this.gamePlace.getGame().getScoreConfig();
    // this.form.addControl('scores', new FormArray([]));
    // const scoreControls = this.getScoreControls();
    // this.gamePlace.getScores().forEach((score: TogetherScore) => {
    //   scoreControls.push(new FormControl(score.getScore()));
    // });
    // if (scoreControls.length === 0) {
    //   scoreControls.push(new FormControl(0));
    // }
    // if (this.firstScoreConfig !== this.firstScoreConfig.getCalculate()) {
    //   this.form.addControl('calculate', new FormControl(0));
    // }
  }

  setDate(dateFormControl: AbstractControl, timeFormControl: AbstractControl, date: Date) {
    dateFormControl.setValue({ year: date.getFullYear(), month: date.getMonth() + 1, day: date.getDate() });
    timeFormControl.setValue({ hour: date.getHours(), minute: date.getMinutes() });
  }

  getPlanningConfig(): PlanningConfig {
    return this.game.getRound().getNumber().getValidPlanningConfig();
  }

  manualEditMode(): boolean {
    return this.getPlanningConfig().getEditMode() === PlanningEditMode.Manual;
  }


  getFieldDescription(): string {
    return this.translate.getFieldNameSingular(this.game.getCompetitionSport().getSport());
  }

  areRefereesEnabled(): boolean {
    return !this.areRefereePlacesEnabled() && this.game.getCompetition().getReferees().length > 0;
  }

  areRefereePlacesEnabled(): boolean {
    return this.getPlanningConfig().selfRefereeEnabled();
  }

  getRefereePlaces(): Place[] {
    return this.game.getRound().getPlaces().filter((place: Place): boolean => {
      return !this.game.isParticipating(place);
    });
  }

  getFieldName(field: Field | undefined): string {
    if (field === undefined) {
      return '?';
    }
    const competition = this.game.getCompetitionSport().getCompetition();
    let fieldName = field.getName();
    if (competition.hasMultipleSports()) {
      fieldName += ' - ' + field.getCompetitionSport().getSport().getName();
    }
    return fieldName ?? '';
  }
}
