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
var service_1 = require("../auth/service");
var PasswordResetComponent = (function () {
    function PasswordResetComponent(router, authService) {
        this.router = router;
        this.authService = authService;
        this.model = {};
        this.loading = false;
        this.error = '';
        this.succeeded = false;
    }
    PasswordResetComponent.prototype.passwordReset = function () {
        var _this = this;
        this.loading = true;
        // let backend send email
        this.authService.passwordReset(this.model.email)
            .subscribe(
        /* happy path */ function (res) {
            // res should be 1
            _this.succeeded = true;
        }, 
        /* error path */ function (e) { _this.error = e; _this.loading = false; }, 
        /* onComplete */ function () { return _this.loading = false; });
    };
    PasswordResetComponent = __decorate([
        core_1.Component({
            moduleId: module.id,
            selector: 'passwordreset',
            templateUrl: 'passwordreset.component.html',
            styleUrls: ['password.component.css']
        }),
        __metadata("design:paramtypes", [router_1.Router, service_1.AuthenticationService])
    ], PasswordResetComponent);
    return PasswordResetComponent;
}());
exports.PasswordResetComponent = PasswordResetComponent;
var PasswordChangeComponent = (function () {
    function PasswordChangeComponent(activatedRoute, router, authService) {
        this.activatedRoute = activatedRoute;
        this.router = router;
        this.authService = authService;
        this.model = {};
        this.loading = false;
        this.error = '';
        this.succeeded = false;
    }
    PasswordChangeComponent.prototype.ngOnInit = function () {
        var _this = this;
        this.authService.logout();
        // subscribe to router event, params or queryParams
        this.subscription = this.activatedRoute.queryParams.subscribe(function (param) {
            _this.email = param['email'];
            _this.key = param['key'];
        });
    };
    PasswordChangeComponent.prototype.ngOnDestroy = function () {
        // prevent memory leak by unsubscribing
        this.subscription.unsubscribe();
    };
    PasswordChangeComponent.prototype.passwordChange = function () {
        var _this = this;
        this.loading = true;
        // let backend send email
        this.authService.passwordChange(this.email, this.model.password, this.key)
            .subscribe(
        /* happy path */ function (res) {
            _this.succeeded = true;
        }, 
        /* error path */ function (e) { _this.error = 'je wachtwoord is niet gewijzigd:' + e; _this.loading = false; }, 
        /* onComplete */ function () { return _this.loading = false; });
    };
    PasswordChangeComponent = __decorate([
        core_1.Component({
            moduleId: module.id,
            selector: 'passwordchange',
            templateUrl: 'passwordchange.component.html',
            styleUrls: ['password.component.css']
        }),
        __metadata("design:paramtypes", [router_1.ActivatedRoute, router_1.Router, service_1.AuthenticationService])
    ], PasswordChangeComponent);
    return PasswordChangeComponent;
}());
exports.PasswordChangeComponent = PasswordChangeComponent;
