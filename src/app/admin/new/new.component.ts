import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

import { IAlert } from '../../shared/common/alert';
import { TournamentRepository } from '../../lib/tournament/repository';
import { StructureRepository } from '../../lib/ngx-sport/structure/repository';
import { PlanningRepository } from '../../lib/ngx-sport/planning/repository';
import { JsonTournament } from '../../lib/tournament/json';
import { DefaultService } from '../../lib/ngx-sport/defaultService';
import { Structure, StructureEditor } from 'ngx-sport';
import { SportWithFields } from '../sport/createSportWithFields.component';
import { CompetitionSportRepository } from '../../lib/ngx-sport/competitionSport/repository';


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
    private competitionSportRepository: CompetitionSportRepository,
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
    this.currentStep = NewTournamentStep.createSportWithFields;
  }

  create(sportWithFields: SportWithFields): boolean {
    this.processing = true;
    this.currentStep = NewTournamentStep.editProperties;
    this.setAlert('info', 'het toernooi wordt aangemaakt');

    const jsonCompetitionSport = this.competitionSportRepository.sportWithFieldsToJson(sportWithFields);
    this.jsonTournament.competition.sports = [jsonCompetitionSport];

    this.tournamentRepository.createObject(this.jsonTournament)
      .subscribe(
        /* happy path */ tournament => {
          const jsonPlanningConfig = this.defaultService.getJsonPlanningConfig([sportWithFields.variant]);
          const structure: Structure = this.structureEditor.create(
            tournament.getCompetition(),
            jsonPlanningConfig,
            this.defaultService.getPouleStructure([sportWithFields.variant]));
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



  get stepEditProperties(): NewTournamentStep { return NewTournamentStep.editProperties; }
  get stepCreateSportWithFields(): NewTournamentStep { return NewTournamentStep.createSportWithFields; }
}

enum NewTournamentStep {
  editProperties = 0, createSportWithFields
}