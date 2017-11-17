import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { TournamentRepository } from '../repository';
import { TournamentComponent } from '../component';
import { StructureRepository } from 'voetbaljs/structure/repository';
import { PoulePlace } from 'voetbaljs/pouleplace';
import { Team } from 'voetbaljs/team';

@Component({
  selector: 'app-tournament-competitors',
  templateUrl: './competitors.component.html',
  styleUrls: ['./competitors.component.css']
})
export class TournamentCompetitorsComponent extends TournamentComponent implements OnInit {
  teamsList: Array<ITeamListItem>;
  infoAlert = true;
  validations: any = {
    'minlengthname': Team.MIN_LENGTH_NAME,
    'maxlengthname': Team.MAX_LENGTH_NAME
  };

  constructor(
    route: ActivatedRoute,
    router: Router,
    tournamentRepository: TournamentRepository,
    sructureRepository: StructureRepository
  ) {
    super(route, router, tournamentRepository, sructureRepository);
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

  updatePoulePlaces(index) {
    console.log('updatePoulePlaces', this.teamsList, index);
    const round = this.structureService.getFirstRound();
    const places = round.getPoulePlaces();

    let i = 0;
    places.forEach(function (placeIt) {
      placeIt.setTeam(this.teamsList[i].team);
      this.teamsList[i].pouleplace = placeIt;
      i++;
    }, this);
  }

  saveedit(teamListItem: ITeamListItem) {
    if (!teamListItem.editable && teamListItem.team == null) {
      teamListItem.team = new Team('');
      teamListItem.team.setAssociation(this.structureService.getCompetitionseason().getAssociation());
      teamListItem.pouleplace.setTeam(teamListItem.team);
    }
    teamListItem.editable = !teamListItem.editable;
  }
}

export interface ITeamListItem {
  pouleplace: PoulePlace;
  team: Team;
  editable: boolean;
}
