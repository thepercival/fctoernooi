import { Component, OnInit } from '@angular/core';
import { NavigationExtras, Router } from '@angular/router';

import { IAlert, IAlertType } from '../../shared/common/alert';
import { TournamentRepository } from '../../lib/tournament/repository';
import { StructureRepository } from '../../lib/ngx-sport/structure/repository';
import { PlanningRepository } from '../../lib/ngx-sport/planning/repository';
import { JsonTournament } from '../../lib/tournament/json';
import { DefaultService } from '../../lib/ngx-sport/defaultService';
import { Category, GameMode, PointsCalculation, Structure, StructureEditor } from 'ngx-sport';
import { SportWithFields } from '../sport/createSportWithFields.component';
import { CompetitionSportRepository } from '../../lib/ngx-sport/competitionSport/repository';
import { Tournament } from '../../lib/tournament';
import { UserRepository } from '../../lib/user/repository';
import { AuthService } from '../../lib/auth/auth.service';
import { User } from '../../lib/user';


@Component({
  selector: 'app-tournament-new',
  templateUrl: './new.component.html',
  styleUrls: ['./new.component.scss']
})
export class NewComponent implements OnInit {
  public processing = true;
  public alert: IAlert | undefined;
  protected jsonTournament!: JsonTournament;
  public nrOfCredits: number | undefined;
  public currentStep = NewTournamentStep.editProperties;

  constructor(
    private router: Router,
    private authService: AuthService,
    private userRepository: UserRepository,
    private tournamentRepository: TournamentRepository,
    private structureRepository: StructureRepository,
    private planningRepository: PlanningRepository,
    private structureEditor: StructureEditor,
    private defaultService: DefaultService,
    private competitionSportRepository: CompetitionSportRepository,
  ) {
  }

  ngOnInit() {
    this.processing = true;

    this.userRepository.getLoggedInObject()
      .subscribe({
        next: (loggedInUser: User | undefined) => {
          if (loggedInUser === undefined) {
            const navigationExtras: NavigationExtras = {
              queryParams: { type: IAlertType.Danger, message: 'je bent niet ingelogd' }
            };
            this.router.navigate(['', navigationExtras]);
            return
          }
          if (!loggedInUser.getValidated()) {
            if (loggedInUser.getValidateIn() < 1) {
              this.router.navigate(['/user/validate']);
              return;
            }
          } else {
            this.nrOfCredits = loggedInUser.getNrOfCredits();
            if (this.nrOfCredits === 0) {
              this.router.navigate(['/user/buycredits']);
              return;
            }
          }
          this.processing = false;
        },
        error: (e) => { this.setAlert(IAlertType.Danger, e); this.processing = false; }
      });
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
    this.setAlert(IAlertType.Info, 'het toernooi wordt aangemaakt');

    const gameMode = sportWithFields.variant.getGameMode();
    const pointsCalculation = gameMode === GameMode.Against ? PointsCalculation.AgainstGamePoints : PointsCalculation.Scores;
    const jsonCompetitionSport = this.competitionSportRepository.sportWithFieldsToJson(pointsCalculation, sportWithFields);
    this.jsonTournament.competition.sports = [jsonCompetitionSport];

    this.tournamentRepository.createObject(this.jsonTournament)
      .subscribe({
        next: (tournament: Tournament) => {
          const jsonPlanningConfig = this.defaultService.getJsonPlanningConfig(sportWithFields.variant);
          const structure: Structure = this.structureEditor.create(
            tournament.getCompetition(),
            this.defaultService.getPouleStructure([sportWithFields.variant]), jsonPlanningConfig);
          this.structureRepository.editObject(structure, tournament)
            .subscribe({
              next: (structureOut: Structure) => {
                this.planningRepository.create(structureOut, tournament)
                  .subscribe({
                    next: () => {
                      this.router.navigate(['/admin/structure', tournament.getId()]);
                    },
                    error: (e) => {
                      this.setAlert(IAlertType.Danger, 'de wedstrijden kon niet worden aangemaakt: ' + e);
                      this.processing = false;
                    },
                    complete: () => this.processing = false
                  });
              },
              error: (e) => {
                this.setAlert(IAlertType.Danger, 'de opzet kon niet worden aangemaakt: ' + e);
                this.processing = false;
              },
              complete: () => {

              }
            });
        },
        error: (e) => { this.setAlert(IAlertType.Danger, 'het toernooi kon niet worden aangemaakt: ' + e); this.processing = false; }
      });
    return false;
  }

  protected setAlert(type: IAlertType, message: string) {
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