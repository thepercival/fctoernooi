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
var service_1 = require("../competitionseason/service");
var service_2 = require("../auth/service");
var component_1 = require("../competitionseason/newmodal/component");
var ng_bootstrap_1 = require("@ng-bootstrap/ng-bootstrap");
var HomeComponent = (function () {
    // constructor
    function HomeComponent(competitionSeasonService, authService, modalService) {
        this.competitionSeasonService = competitionSeasonService;
        this.authService = authService;
        this.modalService = modalService;
        // auth service gebruiken
        this.competitionSeasons = [];
        this.selectedCompetitionSeason = null;
    }
    // interfaces
    HomeComponent.prototype.ngOnInit = function () {
        if (this.authService.user)
            this.competitionSeasons = this.authService.user.competitionSeasons;
    };
    // methods
    // getCompetitionSeasons(): void {
    // this.competitionSeasonService.getCompetitionSeasons().forEach( competitionseasons => this.competitionSeasons = competitionseasons);
    //  }
    HomeComponent.prototype.onSelect = function (competitionseason) {
        this.selectedCompetitionSeason = competitionseason;
        // console.log( this.selectedCompetitionSeason );
    };
    HomeComponent.prototype.open = function (demo) {
        var modalRef = this.modalService.open(component_1.NgbdModalContent, { backdrop: 'static' });
        modalRef.componentInstance.demo = demo;
    };
    HomeComponent.prototype.delete = function (competitionseason) {
        var _this = this;
        this.competitionSeasonService
            .deleteObject(competitionseason.id)
            .forEach(function () {
            _this.competitionSeasons = _this.competitionSeasons.filter(function (h) { return h !== competitionseason; });
            if (_this.selectedCompetitionSeason === competitionseason) {
                _this.selectedCompetitionSeason = null;
            }
        });
    };
    HomeComponent = __decorate([
        core_1.Component({
            moduleId: module.id,
            selector: 'home',
            templateUrl: 'component.html',
            styleUrls: ['component.css']
        }),
        __metadata("design:paramtypes", [service_1.CompetitionSeasonService,
            service_2.AuthenticationService,
            ng_bootstrap_1.NgbModal])
    ], HomeComponent);
    return HomeComponent;
}());
exports.HomeComponent = HomeComponent;
