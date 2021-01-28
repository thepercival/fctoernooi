import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { NgbDateStruct, NgbModal } from '@ng-bootstrap/ng-bootstrap';

import { IAlert } from '../../shared/common/alert';
import { Tournament } from '../../lib/tournament';
import { TournamentRepository } from '../../lib/tournament/repository';
import { TranslateService } from '../../lib/translate';
import { StructureRepository } from '../../lib/ngx-sport/structure/repository';
import { PlanningRepository } from '../../lib/ngx-sport/planning/repository';
import { JsonTournament } from '../../lib/tournament/json';
import { SportDefaultService } from '../../lib/ngx-sport/defaultService';
import { League, Sport, State, Structure, StructureService } from 'ngx-sport';
import { RankingRuleSet } from 'ngx-sport/src/ranking/ruleSet';
import { InfoModalComponent } from '../../shared/tournament/infomodal/infomodal.component';


@Component({
  selector: 'app-tournament-new',
  templateUrl: './new.component.html',
  styleUrls: ['./new.component.scss']
})
export class NewComponent implements OnInit {
  form: FormGroup;
  processing = true;
  alert: IAlert;
  minDateStruct: NgbDateStruct;
  chooseSport = false;
  sport: Sport;
  validations: any = {
    minnroffields: 1,
    maxnroffields: 64,
    minlengthname: League.MIN_LENGTH_NAME,
    maxlengthname: League.MAX_LENGTH_NAME,
    maxlengthsportname: League.MAX_LENGTH_SPORT
  };
  // message: string;

  constructor(
    private router: Router,
    private tournamentRepository: TournamentRepository,
    private structureRepository: StructureRepository,
    private planningRepository: PlanningRepository,
    private sportDefaultService: SportDefaultService,
    private modalService: NgbModal,
    fb: FormBuilder
  ) {
    const date = new Date();
    this.minDateStruct = { year: date.getFullYear(), month: date.getMonth() + 1, day: date.getDate() };

    this.form = fb.group({
      name: ['', Validators.compose([
        Validators.required,
        Validators.minLength(this.validations.minlengthname),
        Validators.maxLength(this.validations.maxlengthname)
      ])],
      sportname: [{ value: '', disabled: true }, Validators.compose([
        Validators.required
      ])],
      nroffields: ['', Validators.compose([
        Validators.required,
        Validators.min(this.validations.minnroffields),
        Validators.max(this.validations.maxnroffields)
      ])],
      date: ['', Validators.compose([
      ])],
      time: ['', Validators.compose([
      ])],
      public: ['', Validators.compose([
      ])]
    });
  }

  ngOnInit() {
    const date = new Date();
    if (date.getHours() < 23) {
      const nrOfMinutesTillQuarter = date.getMinutes() % 15;
      date.setTime(date.getTime() + ((15 + (15 - nrOfMinutesTillQuarter)) * 60 * 1000));
    }
    this.form.controls.date.setValue({ year: date.getFullYear(), month: date.getMonth() + 1, day: date.getDate() });
    this.form.controls.time.setValue({ hour: date.getHours(), minute: date.getMinutes() });
    this.form.controls.nroffields.setValue(1);
    this.form.controls.public.setValue(true);
    this.processing = false;
  }

  onGetSport(sport: Sport) {
    if (sport !== undefined) {
      this.form.controls.sportname.setValue(sport.getName());
      this.sport = sport;
    }
    this.chooseSport = false;
  }

  create(): boolean {

    this.processing = true;
    this.setAlert('info', 'het toernooi wordt aangemaakt');

    const name = this.form.controls.name.value;
    const nrOfFields = this.form.controls.nroffields.value;

    const startDateTime: Date = new Date(
      this.form.controls.date.value.year,
      this.form.controls.date.value.month - 1,
      this.form.controls.date.value.day,
      this.form.controls.time.value.hour,
      this.form.controls.time.value.minute
    );

    const jsonTournament: JsonTournament = {
      id: 0,
      public: this.form.controls.public.value,
      competition: {
        id: 0,
        league: {
          id: 0,
          name: name,
          association: { id: 0, name: 'username' }
        },
        season: {
          id: 0,
          name: 'dummy',
          start: (new Date()).toISOString(),
          end: (new Date()).toISOString(),
        },
        rankingRuleSet: SportDefaultService.RankingRuleSet,
        startDateTime: startDateTime.toISOString(),
        referees: [],
        state: State.Created,
        sports: [this.sportDefaultService.getJsonCompetitionSport(this.sport, nrOfFields)],
      },
      competitors: [],
      lockerRooms: [],
      users: [],
      sponsors: []
    };

    this.tournamentRepository.createObject(jsonTournament)
      .subscribe(
        /* happy path */ tournament => {
          const structureService = new StructureService(Tournament.PlaceRanges);
          const jsonPlanningConfig = this.sportDefaultService.getJsonPlanningConfig(this.sport.getGameMode());
          const structure: Structure = structureService.create(
            tournament.getCompetition(),
            jsonPlanningConfig,
            StructureService.DefaultNrOfPlaces);
          this.structureRepository.editObject(structure, tournament)
            .subscribe(
            /* happy path */(structureOut: Structure) => {
                this.planningRepository.create(structureOut, tournament, 1)
                  .subscribe(
                    /* happy path */ roundNumberOut => {
                      this.router.navigate(['/admin/structure', tournament.getId()]);
                    },
                  /* error path */ e => {
                      this.setAlert('danger', 'de wedstrijdplanning kon niet worden aangemaakt: ' + e);
                      this.processing = false;
                    },
                  /* onComplete */() => { this.processing = false; }
                  );
              },
            /* error path */ e => {
                this.setAlert('danger', 'de opzet kon niet worden aangemaakt: ' + e);
                this.processing = false;
              }
            );
        },
            /* error path */ e => { this.setAlert('danger', 'het toernooi kon niet worden aangemaakt: ' + e); this.processing = false; }
      );
    return false;
  }

  protected setAlert(type: string, message: string) {
    this.alert = { 'type': type, 'message': message };
  }

  protected resetAlert(): void {
    this.alert = undefined;
  }

  getFieldsDescription(): string {
    const translate = new TranslateService();
    return translate.getFieldNamePlural(this.sport);
  }

  openInfoModal(header: string, modalContent) {
    const activeModal = this.modalService.open(InfoModalComponent, { windowClass: 'info-modal' });
    activeModal.componentInstance.header = header;
    activeModal.componentInstance.modalContent = modalContent;
    activeModal.result.then((result) => {
    }, (reason) => {

    });
  }
}
