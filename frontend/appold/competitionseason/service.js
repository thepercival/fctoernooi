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
var http_1 = require("@angular/http");
var Rx_1 = require("rxjs/Rx");
var service_1 = require("../auth/service");
require("rxjs/add/operator/map");
require("rxjs/add/operator/catch");
var CompetitionSeasonService = (function () {
    function CompetitionSeasonService(http, authService) {
        this.http = http;
        this.authService = authService;
        this.headers = new http_1.Headers({ 'Content-Type': 'application/json' });
        this.competitionseasonsUrl = 'http://localhost:2999/competitionseasons'; // localhost:2999/competitionseasons
    }
    // interface
    CompetitionSeasonService.prototype.getObjects = function () {
        return this.http.get(this.competitionseasonsUrl, { headers: this.headers })
            .map(function (res) { return res.json(); })
            .catch(function (error) { return Rx_1.Observable.throw(error.message || 'Server error'); });
    };
    CompetitionSeasonService.prototype.getObject = function (id) {
        // var x = this.getCompetitionSeasons().forEach(competitionseasons => competitionseasons.find(competitionseason => competitionseason.id === id));
        var url = this.competitionseasonsUrl + "/" + id;
        return this.http.get(url)
            .map(function (res) { return res.json(); })
            .catch(function (error) { return Rx_1.Observable.throw(error.message || 'Server error'); });
    };
    CompetitionSeasonService.prototype.createObject = function (object) {
        var name = object.name;
        var seasonname = object.seasonname;
        var nrofparticipants = object.nrofparticipants;
        var userid = this.authService.userid;
        return this.http
            .post(this.competitionseasonsUrl, JSON.stringify({ name: name, seasonname: seasonname, structure: '{}', userid: userid }), { headers: this.headers })
            .map(function (res) { return res.json(); })
            .catch(function (error) { return Rx_1.Observable.throw(error.message || 'Server error'); });
    };
    CompetitionSeasonService.prototype.updateObject = function (object) {
        var url = this.competitionseasonsUrl + "/" + object.id;
        return this.http
            .put(url, JSON.stringify(object), { headers: this.headers })
            .map(function (res) { return res.json(); })
            .catch(function (error) { return Rx_1.Observable.throw(error.message || 'Server error'); });
    };
    CompetitionSeasonService.prototype.deleteObject = function (id) {
        var url = this.competitionseasonsUrl + "/" + id;
        return this.http
            .delete(url, { headers: this.headers })
            .map(function (res) { return res.json(); })
            .catch(function (error) { return Rx_1.Observable.throw(error.message || 'Server error'); });
    };
    CompetitionSeasonService = __decorate([
        core_1.Injectable(),
        __metadata("design:paramtypes", [http_1.Http, service_1.AuthenticationService])
    ], CompetitionSeasonService);
    return CompetitionSeasonService;
}());
exports.CompetitionSeasonService = CompetitionSeasonService;
