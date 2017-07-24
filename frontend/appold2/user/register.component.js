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
var service_1 = require("./service");
var user_1 = require("./user");
var service_2 = require("../auth/service");
// import { CompetitionSeasonService } from './competition-season.service';
var RegisterComponent = (function () {
    function RegisterComponent(router, userService, authService) {
        this.router = router;
        this.userService = userService;
        this.authService = authService;
        this.model = {};
        this.loading = false;
        this.error = '';
    }
    RegisterComponent.prototype.register = function () {
        var _this = this;
        this.loading = true;
        var user = new user_1.User();
        user.name = this.model.name;
        user.password = this.model.password;
        user.emailaddress = this.model.email;
        this.authService.register(user)
            .subscribe(
        /* happy path */ function (p) {
            _this.authService.login(user.emailaddress, user.password)
                .subscribe(
            /* happy path */ function (p) { return _this.router.navigate(['/']); }, 
            /* error path */ function (e) {
                _this.error = decodeURIComponent(e);
                _this.loading = false;
            }, 
            /* onComplete */ function () { return _this.loading = false; });
        }, 
        /* error path */ function (e) {
            _this.error = decodeURIComponent(e);
            _this.loading = false;
        }, 
        /* onComplete */ function () { return _this.loading = false; });
    };
    RegisterComponent = __decorate([
        core_1.Component({
            moduleId: module.id,
            selector: 'register',
            templateUrl: 'register.component.html',
            styleUrls: ['register.component.css']
        }),
        __metadata("design:paramtypes", [router_1.Router, service_1.UserService, service_2.AuthenticationService])
    ], RegisterComponent);
    return RegisterComponent;
}());
exports.RegisterComponent = RegisterComponent;
