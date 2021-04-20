import { Component, OnInit } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { Router } from '@angular/router';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';

import { IAlert } from '../../shared/common/alert';
import { TournamentRepository } from '../../lib/tournament/repository';
import { TranslateService } from '../../lib/translate';
import { StructureRepository } from '../../lib/ngx-sport/structure/repository';
import { PlanningRepository } from '../../lib/ngx-sport/planning/repository';
import { JsonTournament } from '../../lib/tournament/json';
import { DefaultService } from '../../lib/ngx-sport/defaultService';
import { CompetitionSportMapper, JsonCompetitionSport, JsonField, SportMapper, Structure, StructureEditor } from 'ngx-sport';
import { SportWithFields } from '../sport/createSportWithFields.component';


@Component({
  selector: 'app-tournament-new',
  templateUrl: './new.component.html',
  styleUrls: ['./new.component.scss']
})
export class NewComponent implements OnInit {
  processing = true;
  alert: IAlert | undefined;
  protected jsonTournament!: JsonTournament;
  currentStep = NewTournamentStep.editProperties;

  constructor(
    private router: Router,
    private tournamentRepository: TournamentRepository,
    private structureRepository: StructureRepository,
    private planningRepository: PlanningRepository,
    private structureEditor: StructureEditor,
    private defaultService: DefaultService,
    private competitionSportMapper: CompetitionSportMapper,
    private sportMapper: SportMapper,
    private translate: TranslateService,
    private modalService: NgbModal,
    fb: FormBuilder
  ) {
  }

  ngOnInit() {
    this.processing = false;
  }

  toStepEditProperties() {
    this.currentStep = NewTournamentStep.editProperties;
  }

  toStepCreateSportWithFields(jsonTournament: JsonTournament) {
    this.jsonTournament = jsonTournament;
    console.log(jsonTournament);
    this.currentStep = NewTournamentStep.createSportWithFields;
  }

  create(sportWithFields: SportWithFields): boolean {
    this.processing = true;
    this.currentStep = NewTournamentStep.editProperties;
    this.setAlert('info', 'het toernooi wordt aangemaakt');

    this.jsonTournament.competition.sports = [this.convertToJsonCompetitionSport(sportWithFields)];

    this.tournamentRepository.createObject(this.jsonTournament)
      .subscribe(
        /* happy path */ tournament => {
          const jsonPlanningConfig = this.defaultService.getJsonPlanningConfig([sportWithFields.variant]);
          const structure: Structure = this.structureEditor.create(
            tournament.getCompetition(),
            jsonPlanningConfig,
            this.defaultService.getPouleStructure([sportWithFields]));
          this.structureRepository.editObject(structure, tournament)
            .subscribe(
            /* happy path */(structureOut: Structure) => {
                console.log(structureOut);
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

  convertToJsonCompetitionSport(sportWithFields: SportWithFields): JsonCompetitionSport {

    const fields: JsonField[] = [];
    for (let priority = 1; priority <= sportWithFields.nrOfFields; priority++) {
      fields.push({ id: priority, priority, name: String(priority) });
    }
    let jsonVariant = this.competitionSportMapper.variantToJson(sportWithFields.variant);
    return {
      id: 0,
      sport: this.sportMapper.toJson(sportWithFields.variant.getSport()),
      fields,
      gameMode: jsonVariant.gameMode,
      nrOfHomePlaces: jsonVariant.nrOfHomePlaces,
      nrOfAwayPlaces: jsonVariant.nrOfAwayPlaces,
      nrOfH2H: jsonVariant.nrOfH2H,
      nrOfGamePlaces: jsonVariant.nrOfGamePlaces,
      gameAmount: jsonVariant.gameAmount
    }
  }

  get stepEditProperties(): NewTournamentStep { return NewTournamentStep.editProperties; }
  get stepCreateSportWithFields(): NewTournamentStep { return NewTournamentStep.createSportWithFields; }
}

enum NewTournamentStep {
  editProperties = 0, createSportWithFields
}