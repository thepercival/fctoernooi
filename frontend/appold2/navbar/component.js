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
/**
 * Created by coen on 18-11-16.
 */
var core_1 = require("@angular/core");
var service_1 = require("../auth/service");
var global_events_manager_1 = require("./../global-events-manager");
var NavbarComponent = (function () {
    function NavbarComponent(authenticationService, globalEventsManager) {
        var _this = this;
        this.authenticationService = authenticationService;
        this.globalEventsManager = globalEventsManager;
        this.showCompetitionSeasonDetails = false;
        this.globalEventsManager.showCompetitionSeasonDetailsInNavBar.subscribe(function (mode) {
            _this.showCompetitionSeasonDetails = mode;
            console.log('in navbar show is ' + mode);
        });
    }
    __decorate([
        core_1.Input(),
        __metadata("design:type", String)
    ], NavbarComponent.prototype, "title", void 0);
    NavbarComponent = __decorate([
        core_1.Component({
            moduleId: module.id,
            selector: 'navbar',
            templateUrl: 'component.html',
            styleUrls: ['component.css']
        }),
        __metadata("design:paramtypes", [service_1.AuthenticationService,
            global_events_manager_1.GlobalEventsManager])
    ], NavbarComponent);
    return NavbarComponent;
}());
exports.NavbarComponent = NavbarComponent;
