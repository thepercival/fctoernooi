"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var core_1 = require('@angular/core');
var CompetitionSeason = (function () {
    function CompetitionSeason() {
    }
    return CompetitionSeason;
}());
exports.CompetitionSeason = CompetitionSeason;
var COMPETITIONSEASONS = [
    { id: 11, name: 'EK', seasonname: '2012/2013' },
    { id: 12, name: 'WK', seasonname: '2013/2014' },
    { id: 13, name: 'WK', seasonname: '2012/2013' }
];
var AppComponent = (function () {
    function AppComponent() {
        this.title = 'FCToernooi';
        this.competitionseasons = COMPETITIONSEASONS;
        this.competitionseason = { 'id': 1, 'name': 'wk 2018' };
    }
    AppComponent.prototype.onSelect = function (competitionseason) {
        this.selectedCompetitionSeason = competitionseason;
    };
    AppComponent = __decorate([
        core_1.Component({
            selector: 'fctoernooi-app',
            template: '<h1>{{title}}</h1>' +
                '<hr/>' +
                '<table class="u-full-width">' +
                '<thead>' +
                '<tr>' +
                '<th>Naam</th>' +
                '<th>Seizoen</th>' +
                '</tr>' +
                '</thead>' +
                '<tbody>' +
                '<tr *ngFor="let competitionseason of competitionseasons" class="competitionseason" (click)="onSelect(competitionseason)">' +
                '<td>{{competitionseason.name}}</td><td>{{competitionseason.seasonname}}</td>' +
                '</tr>' +
                '</tbody>' +
                '</table>' +
                '<h2>toernooi</h2>' +
                '' +
                '<div *ngIf="selectedCompetitionSeason">' +
                '<div><label>id: </label>{{selectedCompetitionSeason.id}}</div>' +
                '<div>' +
                '<label>naam: </label>' +
                '<input type="text" class="u-full-width" [(ngModel)]="selectedCompetitionSeason.name" placeholder="naam">' +
                '</div>' +
                '<div>' +
                '<label>naam: </label>' +
                '<input type="text" class="u-full-width" [(ngModel)]="selectedCompetitionSeason.seasonname" placeholder="2012/2013">' +
                '</div>' +
                '</div>' +
                '',
            styles: ["\n  .selected {\n    background-color: #CFD8DC !important;    \n  }\n  .competitionseasons {\n    margin: 0 0 2em 0;\n    list-style-type: none;\n    padding: 0;\n    width: 15em;\n  }\n  tr.competitionseason {\n    cursor: pointer;\n  }\n  .competitionseasons li {\n    cursor: pointer;\n    position: relative;\n    left: 0;\n    background-color: #EEE;\n    margin: .5em;\n    padding: .3em 0;\n    height: 1.6em;\n    border-radius: 4px;\n  }\n  .competitionseasons li.selected:hover {\n    background-color: #BBD8DC !important;    \n  }\n  .competitionseasons li:hover {\n    color: #607D8B;\n    background-color: #DDD;\n    left: .1em;\n  }\n  .competitionseasons .text {\n    position: relative;\n    top: -3px;\n  }\n  .competitionseasons .badge {\n    display: inline-block;\n    font-size: small;\n    padding: 0.8em 0.7em 0 0.7em;\n    background-color: #607D8B;\n    line-height: 1em;\n    position: relative;\n    left: -1px;\n    top: -4px;\n    height: 1.8em;\n    margin-right: .8em;\n    border-radius: 4px 0 0 4px;\n  }\n"]
        }), 
        __metadata('design:paramtypes', [])
    ], AppComponent);
    return AppComponent;
}());
exports.AppComponent = AppComponent;
//# sourceMappingURL=app.component.js.map