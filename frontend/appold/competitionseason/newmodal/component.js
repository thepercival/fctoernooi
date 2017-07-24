"use strict";
/**
 * Created by coen on 23-11-16.
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
var ng_bootstrap_1 = require("@ng-bootstrap/ng-bootstrap");
var router_1 = require("@angular/router");
var service_1 = require("../service");
var service_inmemory_1 = require("../service.inmemory");
var moment = require("moment/moment");
var NgbdModalContent = (function () {
    function NgbdModalContent(activeModal, router, competitionSeasonService, competitionSeasonInMemoryService) {
        this.activeModal = activeModal;
        this.router = router;
        this.competitionSeasonService = competitionSeasonService;
        this.competitionSeasonInMemoryService = competitionSeasonInMemoryService;
        this.model = {};
        this.loading = false;
        this.error = '';
    }
    NgbdModalContent.prototype.ngOnInit = function () {
        if (this.demo) {
            this.model.name = 'demo toernooi';
            this.model.seasonname = moment().format('YYYY');
        }
    };
    NgbdModalContent.prototype.add = function () {
        var _this = this;
        this.model.name = this.model.name.trim();
        if (!this.model.name) {
            return;
        }
        this.model.seasonname = this.model.seasonname.trim();
        if (!this.model.seasonname) {
            return;
        }
        var service = this.demo ? this.competitionSeasonInMemoryService : this.competitionSeasonService;
        var jsonCompetitionSeason = { name: this.model.name, seasonname: this.model.seasonname, nrofparticipants: this.model.nrofparticipants };
        service.createObject(jsonCompetitionSeason)
            .subscribe(
        /* happy path */ function (cs) {
            _this.activeModal.close();
            _this.router.navigate(['/toernooi-index', cs.id]); // met id
        }, 
        /* error path */ function (e) { _this.error = e; _this.loading = false; }, 
        /* onComplete */ function () { return _this.loading = false; });
        //service.createObject( competitionSeason )
        //  .forEach(competitionseason => console.log( competitionseason ) );
        return true;
    };
    __decorate([
        core_1.Input(),
        __metadata("design:type", Object)
    ], NgbdModalContent.prototype, "demo", void 0);
    NgbdModalContent = __decorate([
        core_1.Component({
            moduleId: module.id,
            selector: 'ngbd-modal-content',
            templateUrl: 'component.html'
        }),
        __metadata("design:paramtypes", [ng_bootstrap_1.NgbActiveModal,
            router_1.Router,
            service_1.CompetitionSeasonService,
            service_inmemory_1.CompetitionSeasonInMemoryService])
    ], NgbdModalContent);
    return NgbdModalContent;
}());
exports.NgbdModalContent = NgbdModalContent;
