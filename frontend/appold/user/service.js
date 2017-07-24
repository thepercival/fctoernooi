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
require("rxjs/add/operator/map");
require("rxjs/add/operator/catch");
var service_1 = require("../auth/service");
var UserService = (function () {
    function UserService(http, authService) {
        this.http = http;
        this.authService = authService;
        this.headers = new http_1.Headers({ 'Content-Type': 'application/json' });
        this.usersUrl = authService.usersUrl;
    }
    UserService.prototype.getUsers = function () {
        var headers = new http_1.Headers({ 'Authorization': 'Bearer ' + this.authService.token, 'Content-Type': 'application/json' });
        // let options = new RequestOptions({ headers: headers });
        var options = new http_1.RequestOptions({ headers: headers });
        return this.http.get(this.usersUrl, options)
            .map(function (res) { return res.json(); })
            .catch(this.handleError);
    };
    /*getUsersSlow(): Observable<User[]> {

        setTimeout( () => {
            this.getUsers()
        });
        var source = new Observable<User[]>(resolve =>
            setTimeout(resolve, 2000)) // delay 2 seconds
            .then(() => );
        source.forEach( x => );
    }*/
    UserService.prototype.ngOnInit = function () {
        // reset login status
        // this.authService.logout();
    };
    UserService.prototype.getUser = function (id) {
        // var x = this.getUsers().forEach(users => users.find(user => user.id === id));
        var url = this.usersUrl + "/" + id;
        return this.http.get(url)
            .map(function (res) { return res.json(); })
            .catch(this.handleError);
    };
    UserService.prototype.create = function (newUser) {
        return this.http
            .post(this.usersUrl, JSON.stringify(newUser), { headers: this.headers })
            .map(function (res) { return res.json(); })
            .catch(this.handleError);
    };
    UserService.prototype.update = function (user) {
        var url = this.usersUrl + "/" + user.id;
        return this.http
            .put(url, JSON.stringify(user), { headers: this.headers })
            .map(function (res) { return res.json(); })
            .catch(this.handleError);
    };
    UserService.prototype.delete = function (id) {
        var url = this.usersUrl + "/" + id;
        return this.http
            .delete(url, { headers: this.headers })
            .map(function (res) { return res.json(); })
            .catch(this.handleError);
    };
    // this could also be a private method of the component class
    UserService.prototype.handleError = function (error) {
        console.error(error.statusText);
        // throw an application level error
        return Rx_1.Observable.throw(error.statusText);
    };
    UserService = __decorate([
        core_1.Injectable(),
        __metadata("design:paramtypes", [http_1.Http,
            service_1.AuthenticationService])
    ], UserService);
    return UserService;
}());
exports.UserService = UserService;
