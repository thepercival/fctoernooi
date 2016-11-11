import { Component } from '@angular/core';

export class CompetitionSeason {
    id: number;
    name: string;
    seasonname: string;
}

const COMPETITIONSEASONS: CompetitionSeason[] = [
    { id: 11, name: 'EK', seasonname: '2012/2013' },
    { id: 12, name: 'WK', seasonname: '2013/2014' },
    { id: 13, name: 'WK', seasonname: '2012/2013' }
];

@Component({
    selector: 'fctoernooi-app',
    template: '<h1>{{title}}</h1>'+
    '<hr/>'+
    '<table class="table">'+
    '<thead>'+
    '<tr>'+
    '<th>naam</th>'+
    '<th>seizoen</th>'+
    '<th><button class="btn btn-default btn-cs-add"><i class="fa fa-plus fa-fw"></i></button></th>'+
    '</tr>'+
    '</thead>'+
    '<tbody>'+
    '<tr *ngFor="let competitionseason of competitionseasons" class="competitionseason">'+
    '<td>{{competitionseason.name}}</td><td>{{competitionseason.seasonname}}</td>'+
    '<td><div ngbDropdown [up]="true" class="d-inline-block">'+
    '<button class="btn btn-outline-default csDropdownBtn" id="dropdownMenu{{competitionseason.id}}" ngbDropdownToggle><i class="fa fa-ellipsis-v fa-fw"></i></button>'+
    '<div class="dropdown-menu dropdown-menu-right" aria-labelledby="dropdownMenu">'+
    '<button class="dropdown-item" (click)="onSelect(competitionseason)"><i class="fa fa-edit fa-fw"></i> wijzigen</button>'+
    '<button class="dropdown-item"><i class="fa fa-tv fa-fw"></i> tv-schermm</button>'+
    '<button class="dropdown-item"><i class="fa fa-remove fa-fw"></i> vewijderen</button>'+
    '</div>'+
    '</div></td>'+
    '</tr>'+
    '</tbody>'+
    '</table>'+
    '<div *ngIf="selectedCompetitionSeason">'+
    '<h2>toernooi</h2>' +
    '<div><label>id: </label>{{selectedCompetitionSeason.id}}</div>'+
    '<div>'+
    '<label>naam: </label>'+
    '<input type="text" class="" [(ngModel)]="selectedCompetitionSeason.name" placeholder="naam">'+
    '</div>'+
    '<div>'+
    '<label>naam: </label>'+
    '<input type="text" class="" [(ngModel)]="selectedCompetitionSeason.seasonname" placeholder="2012/2013">'+
    '</div>'+
    '</div>' +
    '',
    styles: [`
  .selected {
    background-color: #CFD8DC !important;    
  }
  .dropdown-toggle::after {
    margin-left: 0;
  }  
  .csDropdownBtn::after{
    border-left: 0;
    border-right: 0;  
  }
  .btn{
    padding: 4px;
  }  
`]
})
export class AppComponent {
    title = 'FCToernooi2';
    competitionseasons = COMPETITIONSEASONS;
    competitionseason: CompetitionSeason = null;
    selectedCompetitionSeason: CompetitionSeason;

    onSelect(competitionseason: CompetitionSeason): void {
        this.selectedCompetitionSeason = competitionseason;
    }
}
