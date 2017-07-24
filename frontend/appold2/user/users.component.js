"use strict";
/**
 * Created by cdunnink on 17-11-2016.
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
var router_1 = require("@angular/router");
var service_1 = require("./service");
var UsersComponent = (function () {
    function UsersComponent(router, userService) {
        this.router = router;
        this.userService = userService;
        this.selectedUser = null;
    }
    // methods
    UsersComponent.prototype.getUsers = function () {
        var _this = this;
        this.userService.getUsers().forEach(function (users) { return _this.users = users; });
    };
    UsersComponent.prototype.onSelect = function (user) {
        this.selectedUser = user;
        //console.log( this.selectedUser );
    };
    // interfaces
    UsersComponent.prototype.ngOnInit = function () {
        //try {
        this.getUsers();
        //}
        //catch ( error ) {
        //  console.log( error );
        //}
        //console.log( this.users );
        //console.log( 123 );
    };
    UsersComponent = __decorate([
        core_1.Component({
            moduleId: module.id,
            selector: 'users',
            templateUrl: 'users.component.html',
            styleUrls: ['users.component.css']
        }),
        __metadata("design:paramtypes", [router_1.Router,
            service_1.UserService])
    ], UsersComponent);
    return UsersComponent;
}());
exports.UsersComponent = UsersComponent;
