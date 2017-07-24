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
Object.defineProperty(exports, "__esModule", { value: true });
var core_1 = require("@angular/core");
var router_1 = require("@angular/router");
var common_1 = require("@angular/common");
var service_1 = require("./service");
var competitionseason_1 = require("../voetbal/competitionseason");
var CompetitionSeasonStructureComponent = (function () {
    function CompetitionSeasonStructureComponent(cbjectService, route, location) {
        this.cbjectService = cbjectService;
        this.route = route;
        this.location = location;
    }
    CompetitionSeasonStructureComponent.prototype.ngOnInit = function () {
        /*this.route.params.forEach((params: Params) => {
            let id = +params['id'];
            this.cbjectService.getCompetitionSeason(id)
                .forEach(object => this.object = object);
        });*/
    };
    CompetitionSeasonStructureComponent.prototype.save = function () {
        /*this.cbjectService.update(this.object)
            .forEach(() => this.goBack());*/
    };
    CompetitionSeasonStructureComponent.prototype.goBack = function () {
        this.location.back();
    };
    __decorate([
        core_1.Input(),
        __metadata("design:type", competitionseason_1.CompetitionSeason)
    ], CompetitionSeasonStructureComponent.prototype, "object", void 0);
    CompetitionSeasonStructureComponent = __decorate([
        core_1.Component({
            moduleId: module.id,
            selector: 'toernooi-structuur',
            templateUrl: 'structure.component.html',
            styleUrls: ['structure.component.css']
        }),
        __metadata("design:paramtypes", [service_1.CompetitionSeasonService,
            router_1.ActivatedRoute,
            common_1.Location])
    ], CompetitionSeasonStructureComponent);
    return CompetitionSeasonStructureComponent;
}());
exports.CompetitionSeasonStructureComponent = CompetitionSeasonStructureComponent;
