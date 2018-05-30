import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { PoulePlace, StructureNameService, StructureRepository, Team } from 'ngx-sport';

import { IAlert } from '../../../app.definitions';
import { TournamentComponent } from '../component';
import { TournamentRepository } from '../repository';

@Component({
    selector: 'app-tournament-filter',
    templateUrl: './filter.component.html',
    styleUrls: ['./filter.component.scss']
})
export class TournamentFilterComponent extends TournamentComponent implements OnInit {
    poulePlaces: PoulePlace[];
    alert: IAlert;
    poulePlaceToSwap: PoulePlace;
    processing = true;

    constructor(
        route: ActivatedRoute,
        router: Router,
        tournamentRepository: TournamentRepository,
        sructureRepository: StructureRepository,
        public nameService: StructureNameService
    ) {
        super(route, router, tournamentRepository, sructureRepository);
        this.resetAlert();
    }

    ngOnInit() {
        super.myNgOnInit(() => this.initPoulePlaces());
    }

    initPoulePlaces() {
        const round = this.structureService.getFirstRound();
        this.poulePlaces = round.getPoulePlaces();
        if (this.hasTeams() === false) {
            this.setAlert('info', 'er zijn nog geen deelnemers ingevuld, je kunt daarom nog geen filter instellen');
        }
        this.processing = false;
    }

    hasTeams() {
        return this.poulePlaces.some(poulePlace => poulePlace.getTeam() !== undefined);
    }

    inFavoriteTeamIds(team: Team): boolean {
        const favTeams = this.getFavTeamsFromLocalStorage();
        const favTeamIds: number[] = favTeams[this.tournament.getId()];
        if (favTeamIds === undefined) {
            return false;
        }
        return favTeamIds.find(favTeamId => favTeamId === team.getId()) !== undefined;
    }

    toggleFavoriteTeams(team: Team) {
        this.setAlert('info', 'het filter is bijgewerkt');
        const favTeams = this.getFavTeamsFromLocalStorage();
        if (favTeams[this.tournament.getId()] === undefined) {
            favTeams[this.tournament.getId()] = [];
        }
        const favTeamIds: number[] = favTeams[this.tournament.getId()];
        const index = favTeamIds.indexOf(team.getId());
        if (index < 0) {
            favTeamIds.push(team.getId());
        } else {
            favTeamIds.splice(index, 1);
        }
        localStorage.setItem('favoriteteams', JSON.stringify(favTeams));
    }

    protected getFavTeamsFromLocalStorage(): any {
        const favTeams = localStorage.getItem('favoriteteams');
        if (favTeams === null) {
            return {};
        }
        return JSON.parse(favTeams);
    }

    /*protected getFavTeamIdFromLocalStorage() {
        const favTeams = localStorage.getItem('favoriteteams');
        if (favTeams === null) {
            return [];
        }
        return JSON.parse(favTeams);
    }*/

    protected setAlert(type: string, message: string) {
        this.alert = { 'type': type, 'message': message };
    }

    protected resetAlert(): void {
        this.alert = undefined;
    }
}
