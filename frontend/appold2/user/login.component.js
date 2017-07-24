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
var LoginComponent = (function () {
    function LoginComponent(activatedRoute, router, authenticationService) {
        this.activatedRoute = activatedRoute;
        this.router = router;
        this.authenticationService = authenticationService;
        this.model = {};
        this.loading = false;
        this.error = '';
        this.activationmessage = null;
    }
    LoginComponent.prototype.ngOnInit = function () {
        var _this = this;
        this.subscription = this.activatedRoute.queryParams.subscribe(function (param) {
            _this.activationmessage = param['message'];
        });
    };
    LoginComponent.prototype.login = function () {
        var _this = this;
        this.loading = true;
        this.activationmessage = null;
        this.authenticationService.login(this.model.emailaddress, this.model.password)
            .subscribe(
        /* happy path */ function (p) { return _this.router.navigate(['/admin']); }, 
        /* error path */ function (e) { _this.error = e; _this.loading = false; }, 
        /* onComplete */ function () { return _this.loading = false; });
    };
    LoginComponent = __decorate([
        core_1.Component({
            moduleId: module.id,
            selector: 'login',
            templateUrl: 'login.component.html',
            styleUrls: ['login.component.css']
        }),
        __metadata("design:paramtypes", [router_1.ActivatedRoute, router_1.Router, service_1.AuthenticationService])
    ], LoginComponent);
    return LoginComponent;
}());
exports.LoginComponent = LoginComponent;
