import { Component } from '@angular/core';

export class CompetitionSeason {
    id: number;
    name: string;
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
    '<table class="u-full-width">'+
    '<thead>'+
    '<tr>'+
    '<th>Naam</th>'+
    '<th>Seizoen</th>'+
    '</tr>'+
    '</thead>'+
    '<tbody>'+
    '<tr *ngFor="let competitionseason of competitionseasons" class="competitionseason" (click)="onSelect(competitionseason)">'+
    '<td>{{competitionseason.name}}</td><td>{{competitionseason.seasonname}}</td>'+
    '</tr>'+
    '</tbody>'+
    '</table>'+
    '<h2>toernooi</h2>' +
    ''+
    '<div *ngIf="selectedCompetitionSeason">'+
    '<div><label>id: </label>{{selectedCompetitionSeason.id}}</div>'+
    '<div>'+
    '<label>naam: </label>'+
    '<input type="text" class="u-full-width" [(ngModel)]="selectedCompetitionSeason.name" placeholder="naam">'+
    '</div>'+
    '<div>'+
    '<label>naam: </label>'+
    '<input type="text" class="u-full-width" [(ngModel)]="selectedCompetitionSeason.seasonname" placeholder="2012/2013">'+
    '</div>'+
    '</div>' +
    '',
    styles: [`
  .selected {
    background-color: #CFD8DC !important;    
  }
  .competitionseasons {
    margin: 0 0 2em 0;
    list-style-type: none;
    padding: 0;
    width: 15em;
  }
  tr.competitionseason {
    cursor: pointer;
  }
  .competitionseasons li {
    cursor: pointer;
    position: relative;
    left: 0;
    background-color: #EEE;
    margin: .5em;
    padding: .3em 0;
    height: 1.6em;
    border-radius: 4px;
  }
  .competitionseasons li.selected:hover {
    background-color: #BBD8DC !important;    
  }
  .competitionseasons li:hover {
    color: #607D8B;
    background-color: #DDD;
    left: .1em;
  }
  .competitionseasons .text {
    position: relative;
    top: -3px;
  }
  .competitionseasons .badge {
    display: inline-block;
    font-size: small;
    padding: 0.8em 0.7em 0 0.7em;
    background-color: #607D8B;
    line-height: 1em;
    position: relative;
    left: -1px;
    top: -4px;
    height: 1.8em;
    margin-right: .8em;
    border-radius: 4px 0 0 4px;
  }
`]

})
export class AppComponent {
    title = 'FCToernooi';
    competitionseasons = COMPETITIONSEASONS;
    competitionseason: CompetitionSeason = { 'id' : 1, 'name' : 'wk 2018' };
    selectedCompetitionSeason: CompetitionSeason;

    onSelect(competitionseason: CompetitionSeason): void {
        this.selectedCompetitionSeason = competitionseason;
    }
}
