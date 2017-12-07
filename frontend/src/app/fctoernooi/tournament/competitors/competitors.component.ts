import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { TournamentRepository } from '../repository';
import { TournamentComponent } from '../component';
import { StructureRepository } from 'voetbaljs/structure/repository';
import { PoulePlace } from 'voetbaljs/pouleplace';
import { Team } from 'voetbaljs/team';
import { TeamRepository, ITeam } from 'voetbaljs/team/repository';
import { IAlert } from '../../../app.definitions';
import { Association } from 'voetbaljs/association';
import { PoulePlaceRepository } from 'voetbaljs/pouleplace/repository';
import { forkJoin } from 'rxjs/observable/forkJoin';

@Component({
  selector: 'app-tournament-competitors',
  templateUrl: './competitors.component.html',
  styleUrls: ['./competitors.component.css']
})
export class TournamentCompetitorsComponent extends TournamentComponent implements OnInit {
  teamsList: Array<ITeamListItem>;
  infoAlert = true;
  alert: IAlert;
  processing = false;
  disableEditButtons = false;
  private dragStartIndex: number;
  validations: any = {
    'minlengthname': Team.MIN_LENGTH_NAME,
    'maxlengthname': Team.MAX_LENGTH_NAME
  };

  constructor(
    route: ActivatedRoute,
    router: Router,
    tournamentRepository: TournamentRepository,
    sructureRepository: StructureRepository,
    private teamRepository: TeamRepository,
    private poulePlaceRepository: PoulePlaceRepository
  ) {
    super(route, router, tournamentRepository, sructureRepository);
    this.setAlert('info', 'sleep items om indeling aan te passen');
  }

  ngOnInit() {
    super.myNgOnInit(() => this.createTeamsList());
  }

  createTeamsList() {
    const round = this.structureService.getFirstRound();
    const places = round.getPoulePlaces();
    this.teamsList = [];
    places.forEach(function (placeIt) {
      this.teamsList.push({
        pouleplace: placeIt,
        team: placeIt.getTeam(),
        editable: false
      });
    }, this);
  }

  startDragging(i) {
    this.dragStartIndex = i;
  }

  updatePoulePlaces(dragEndIndex) {
    if (this.dragStartIndex === dragEndIndex) {
      return;
    }
    this.processing = true;
    this.setAlert('info', 'volgorde wijzigen');
    const round = this.structureService.getFirstRound();
    const places = round.getPoulePlaces();

    const reposUpdates = [];
    let i = 0;
    places.forEach(function (placeIt) {
      if (placeIt !== this.teamsList[i].pouleplace) {
        placeIt.setTeam(this.teamsList[i].team);
        reposUpdates.push(this.poulePlaceRepository.editObject(placeIt, placeIt.getPoule()));
      }
      this.teamsList[i++].pouleplace = placeIt;
    }, this);

    forkJoin(reposUpdates).subscribe(results => {
      this.setAlert('info', 'volgorde gewijzigd');
      this.processing = false;
    },
      err => {
        this.setAlert('danger', 'volgorde niet gewijzigd: ' + err);
        this.processing = false;
      }
    );
  }

  saveedit(teamListItem: ITeamListItem) {
    if (!teamListItem.editable && teamListItem.team == null) {
      this.addTeam(teamListItem);
      console.log('insert db');
    } else if (teamListItem.editable && teamListItem.team != null) {
      console.log('update db');
      this.updateTeam(teamListItem);
    }
    teamListItem.editable = !teamListItem.editable;
    this.disableEditButtons = teamListItem.editable;
  }

  addTeam(teamListItem: ITeamListItem) {
    this.setAlert('info', 'team toevoegen..');
    this.processing = true;

    const association = this.tournament.getCompetitionseason().getAssociation();

    const teamName = this.createDefaultTeamName(association);

    const jsonTeam: ITeam = {
      name: teamName
    };

    this.teamRepository.createObject(jsonTeam, association)
      .subscribe(
            /* happy path */ teamRes => {
        teamListItem.team = teamRes;
        teamListItem.pouleplace.setTeam(teamRes);
        this.poulePlaceRepository.editObject(teamListItem.pouleplace, teamListItem.pouleplace.getPoule())
          .subscribe(
                  /* happy path */ poulePlaceRes => {
            teamListItem.pouleplace = poulePlaceRes;
            this.setAlert('info', 'team toegevoegd');
          },
                  /* error path */ e => { this.setAlert('danger', e); },
                  /* onComplete */() => this.processing = false
          );
      },
            /* error path */ e => { this.setAlert('danger', e); },
    );
  }

  updateTeam(teamListItem: ITeamListItem) {
    this.setAlert('info', 'team wijzigen..');
    this.processing = true;

    const association = this.tournament.getCompetitionseason().getAssociation();

    this.teamRepository.editObject(teamListItem.team, association)
      .subscribe(
            /* happy path */ teamRes => {
        teamListItem.team = teamRes;
        this.setAlert('info', 'team gewijzigd');
      },
            /* error path */ e => { this.setAlert('danger', e); },
            /* onComplete */() => this.processing = false
      );
  }

  protected setAlert(type: string, message: string) {
    this.alert = { 'type': type, 'message': message };
  }

  protected resetAlert(): void {
    this.alert = null;
  }

  protected createDefaultTeamName(association: Association): string {
    let counter = 1;
    let teamName = 'tm' + counter;
    while (association.getTeamByName(teamName) != null) {
      teamName = 'tm' + (++counter);
    }
    return teamName;
  }

  doesTeamNameExists(name: string, team: Team, association: Association): boolean {
    const teamWithSameName = association.getTeamByName(name);
    return (teamWithSameName != null && teamWithSameName !== team);
  }

  changeTeamName(name: string, teamItem: ITeamListItem) {
    this.resetAlert();
    const association = this.tournament.getCompetitionseason().getAssociation();
    if (!this.doesTeamNameExists(name, teamItem.team, association)) {
      teamItem.team.setName(name);
    } else {
      this.setAlert('danger', 'teamnaam bestaat al');
    }
  }
}

export interface ITeamListItem {
  pouleplace: PoulePlace;
  team: Team;
  editable: boolean;
}
