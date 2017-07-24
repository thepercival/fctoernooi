"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
var core_1 = require("@angular/core");
var competitionseason_1 = require("../voetbal/competitionseason");
var Rx = require("rxjs/Rx");
var participant_1 = require("../voetbal/participant");
var CompetitionSeasonInMemoryService = (function () {
    function CompetitionSeasonInMemoryService() {
        this.objects = [];
    }
    CompetitionSeasonInMemoryService.prototype.createDb = function () {
        if (this.demoCompetitionSeason != null)
            this.objects.push(this.demoCompetitionSeason);
        return this.objects;
    };
    // interface
    CompetitionSeasonInMemoryService.prototype.getObjects = function () {
        var _this = this;
        return Rx.Observable.create(function (observer) {
            return _this.objects;
        });
    };
    CompetitionSeasonInMemoryService.prototype.getObject = function (id) {
        var _this = this;
        return Rx.Observable.create(function (observer) {
            observer.next(_this.demoCompetitionSeason);
        });
    };
    CompetitionSeasonInMemoryService.prototype.createObject = function (object) {
        var _this = this;
        return Rx.Observable.create(function (observer) {
            _this.demoCompetitionSeason = new competitionseason_1.CompetitionSeason();
            _this.demoCompetitionSeason.id = 0;
            _this.demoCompetitionSeason.name = object.name;
            _this.demoCompetitionSeason.seasonname = object.seasonname;
            for (var n = 1; n <= object.nrofparticipants; n++) {
                _this.demoCompetitionSeason.participants.push(new participant_1.Participant("deelnemer " + n));
            }
            _this.objects.push(_this.demoCompetitionSeason);
            observer.next(_this.demoCompetitionSeason);
        });
    };
    CompetitionSeasonInMemoryService.prototype.updateObject = function (object) {
        var _this = this;
        return Rx.Observable.create(function (observer) {
            if (_this.demoCompetitionSeason == null)
                _this.demoCompetitionSeason = new competitionseason_1.CompetitionSeason();
            _this.demoCompetitionSeason.name = object.name;
            _this.demoCompetitionSeason.seasonname = object.seasonname;
            observer.next(_this.demoCompetitionSeason);
            /*return () => this.demoCompetitionSeason*/
        });
    };
    CompetitionSeasonInMemoryService.prototype.deleteObject = function (id) {
        return Rx.Observable.create(function (observer) {
            observer.next(null);
            /*return () => null*/
        });
    };
    CompetitionSeasonInMemoryService = __decorate([
        core_1.Injectable()
    ], CompetitionSeasonInMemoryService);
    return CompetitionSeasonInMemoryService;
}());
exports.CompetitionSeasonInMemoryService = CompetitionSeasonInMemoryService;
