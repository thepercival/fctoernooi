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
var service_inmemory_1 = require("./service.inmemory");
var competitionseason_1 = require("../voetbal/competitionseason");
var global_events_manager_1 = require("./../global-events-manager");
var CompetitionSeasonIndexComponent = (function () {
    function CompetitionSeasonIndexComponent(cbjectService, objectInMemoryService, route, location, globalEventsManger) {
        this.cbjectService = cbjectService;
        this.objectInMemoryService = objectInMemoryService;
        this.route = route;
        this.location = location;
        this.globalEventsManger = globalEventsManger;
    }
    CompetitionSeasonIndexComponent.prototype.ngOnInit = function () {
        var _this = this;
        this.route.params.forEach(function (params) {
            var service = (params['id']) > 0 ? _this.cbjectService : _this.objectInMemoryService;
            service.getObject(params['id'])
                .subscribe(
            /* happy path */ function (cs) {
                _this.competitionseason = cs;
                if (_this.competitionseason == undefined)
                    return;
                if (_this.competitionseason.rounds.length == 0) {
                    _this.competitionseason.addRound(_this.competitionseason.participants.length, false);
                }
                console.log(_this.competitionseason);
            }, 
            /* error path */ function (e) { }, 
            /* onComplete */ function () { });
        });
        this.globalEventsManger.showCompetitionSeasonDetailsInNavBar.emit(true);
    };
    CompetitionSeasonIndexComponent.prototype.ngOnDestroy = function () {
        this.globalEventsManger.showCompetitionSeasonDetailsInNavBar.emit(false);
    };
    CompetitionSeasonIndexComponent.prototype.save = function () {
        /*this.cbjectService.update(this.object)
            .forEach(() => this.goBack());*/
    };
    CompetitionSeasonIndexComponent.prototype.goBack = function () {
        this.location.back();
    };
    __decorate([
        core_1.Input(),
        __metadata("design:type", competitionseason_1.CompetitionSeason)
    ], CompetitionSeasonIndexComponent.prototype, "competitionseason", void 0);
    CompetitionSeasonIndexComponent = __decorate([
        core_1.Component({
            moduleId: module.id,
            selector: 'toernooi-index',
            templateUrl: 'index.component.html',
            styleUrls: ['index.component.css']
        }),
        __metadata("design:paramtypes", [service_1.CompetitionSeasonService,
            service_inmemory_1.CompetitionSeasonInMemoryService,
            router_1.ActivatedRoute,
            common_1.Location,
            global_events_manager_1.GlobalEventsManager])
    ], CompetitionSeasonIndexComponent);
    return CompetitionSeasonIndexComponent;
}());
exports.CompetitionSeasonIndexComponent = CompetitionSeasonIndexComponent;
