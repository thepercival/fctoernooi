"use strict";
/**
 * Created by cdunnink on 7-12-2016.
 */
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
var poule_1 = require("../voetbal/poule");
var CompetitionSeasonPouleComponent = (function () {
    function CompetitionSeasonPouleComponent() {
    }
    CompetitionSeasonPouleComponent.prototype.addPoulePlace = function () {
        var poulePlace = this.poule.addPlace();
    };
    CompetitionSeasonPouleComponent.prototype.isPoulePlaceRemovable = function () {
        return true;
    };
    CompetitionSeasonPouleComponent.prototype.removePoulePlace = function () {
        /*this.cbjectService.update(this.object)
         .forEach(() => this.goBack());*/
    };
    __decorate([
        core_1.Input(),
        __metadata("design:type", poule_1.Poule)
    ], CompetitionSeasonPouleComponent.prototype, "poule", void 0);
    CompetitionSeasonPouleComponent = __decorate([
        core_1.Component({
            moduleId: module.id,
            selector: 'toernooi-poule',
            templateUrl: 'poule.component.html',
            styleUrls: ['poule.component.css']
        }),
        __metadata("design:paramtypes", [])
    ], CompetitionSeasonPouleComponent);
    return CompetitionSeasonPouleComponent;
}());
exports.CompetitionSeasonPouleComponent = CompetitionSeasonPouleComponent;
