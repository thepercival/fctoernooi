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
var core_1 = require("@angular/core");
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
        this.competitionseason = null;
    }
    AppComponent.prototype.onSelect = function (competitionseason) {
        this.selectedCompetitionSeason = competitionseason;
    };
    return AppComponent;
}());
AppComponent = __decorate([
    core_1.Component({
        selector: 'fctoernooi-app',
        template: '<h1>{{title}}</h1>' +
            '<hr/>' +
            '<table class="table">' +
            '<thead>' +
            '<tr>' +
            '<th>naam</th>' +
            '<th>seizoen</th>' +
            '<th><button class="btn btn-default btn-cs-add"><i class="fa fa-plus fa-fw"></i></button></th>' +
            '</tr>' +
            '</thead>' +
            '<tbody>' +
            '<tr *ngFor="let competitionseason of competitionseasons" class="competitionseason">' +
            '<td>{{competitionseason.name}}</td><td>{{competitionseason.seasonname}}</td>' +
            '<td><div ngbDropdown [up]="true" class="d-inline-block">' +
            '<button class="btn btn-outline-default csDropdownBtn" id="dropdownMenu{{competitionseason.id}}" ngbDropdownToggle><i class="fa fa-ellipsis-v fa-fw"></i></button>' +
            '<div class="dropdown-menu dropdown-menu-right" aria-labelledby="dropdownMenu">' +
            '<button class="dropdown-item" (click)="onSelect(competitionseason)"><i class="fa fa-edit fa-fw"></i> wijzigen</button>' +
            '<button class="dropdown-item"><i class="fa fa-tv fa-fw"></i> tv-schermm</button>' +
            '<button class="dropdown-item"><i class="fa fa-remove fa-fw"></i> vewijderen</button>' +
            '</div>' +
            '</div></td>' +
            '</tr>' +
            '</tbody>' +
            '</table>' +
            '<div *ngIf="selectedCompetitionSeason">' +
            '<h2>toernooi</h2>' +
            '<div><label>id: </label>{{selectedCompetitionSeason.id}}</div>' +
            '<div>' +
            '<label>naam: </label>' +
            '<input type="text" class="" [(ngModel)]="selectedCompetitionSeason.name" placeholder="naam">' +
            '</div>' +
            '<div>' +
            '<label>naam: </label>' +
            '<input type="text" class="" [(ngModel)]="selectedCompetitionSeason.seasonname" placeholder="2012/2013">' +
            '</div>' +
            '</div>' +
            '',
        styles: ["\n  .selected {\n    background-color: #CFD8DC !important;    \n  }\n  .dropdown-toggle::after {\n    margin-left: 0;\n  }  \n  .csDropdownBtn::after{\n    border-left: 0;\n    border-right: 0;  \n  }\n  .btn{\n    padding: 4px;\n  }  \n"]
    }),
    __metadata("design:paramtypes", [])
], AppComponent);
exports.AppComponent = AppComponent;
//# sourceMappingURL=app.component.js.map