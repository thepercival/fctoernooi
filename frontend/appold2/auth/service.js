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
var http_1 = require("@angular/http");
var Rx_1 = require("rxjs/Rx");
require("rxjs/add/operator/map");
var core_1 = require("@angular/core");
var app_config_1 = require("../app.config");
var router_1 = require("@angular/router");
var AuthenticationService = (function () {
    function AuthenticationService(config, http, router) {
        var _this = this;
        this.config = config;
        this.http = http;
        this.router = router;
        this.headers = new http_1.Headers({ 'Content-Type': 'application/json' });
        this.url = this.config.getConfig('apiurl') + 'auth/';
        // set token if saved in local storage
        var user = JSON.parse(localStorage.getItem('user'));
        this.token = user && user.token;
        this.userid = user && user.id;
        // this.initLoggedOnUser();
        if (this.token && this.userid && !this.user) {
            console.log("auth.user starting initialization for userid: " + this.userid + "...");
            this.getLoggedInUser(this.userid)
                .subscribe(
            /* happy path */ function (user) { return _this.user = user; }, 
            /* error path */ function (e) {
                console.log('token expired');
                _this.logout();
                _this.router.navigate(['/']);
            }, 
            /* onComplete */ function () { console.log('user created from backend'); });
            console.log("auth.user initialized");
        }
    }
    // not through userservice because of recusrsive dependency
    AuthenticationService.prototype.getLoggedInUser = function (id) {
        var headers = new http_1.Headers({ 'Authorization': 'Bearer ' + this.token, 'Content-Type': 'application/json' });
        var options = new http_1.RequestOptions({ headers: headers });
        var url = this.url + 'users' + "/" + id;
        return this.http.get(url, options)
            .map(function (res) { return res.json(); })
            .catch(this.handleError);
    };
    AuthenticationService.prototype.register = function (newUser) {
        return this.http
            .post(this.url + 'register', JSON.stringify(newUser), { headers: this.headers })
            .map(function (res) { return res.json(); })
            .catch(this.handleError);
    };
    AuthenticationService.prototype.activate = function (email, activationkey) {
        return this.http.post(this.url + 'activate', { email: email, activationkey: activationkey })
            .map(function (response) { return response.text(); })
            .catch(this.handleError);
    };
    AuthenticationService.prototype.login = function (emailaddress, password) {
        var _this = this;
        return this.http.post(this.url + 'login', { emailaddress: emailaddress, password: password })
            .map(function (response) {
            var json = response.json();
            // login successful if there's a jwt token in the response
            if (json && json.token && json.user) {
                // set token property
                _this.token = json.token;
                _this.userid = json.user.id;
                // store username and jwt token in local storage to keep user logged in between page refreshes
                localStorage.setItem('user', JSON.stringify({ id: json.user.id, token: json.token }));
                _this.user = json.user;
                // console.log( this.user );
                // return true to indicate successful login
                return true;
            }
            else {
                // return false to indicate failed login
                return false;
            }
        })
            .catch(this.handleError);
        // .catch((error:any) => Observable.throw( error.statusText || 'Server error' ) );
        /*.catch((err:any) => {
            //console.log( err.statusText );
            Observable.throw( err.statusText )
        });*/
    };
    AuthenticationService.prototype.passwordReset = function (email) {
        return this.http.post(this.url + 'passwordreset', { email: email })
            .map(function (response) {
            var retVal = response.text();
            // console.log( retVal );
            return retVal;
        })
            .catch(this.handleError);
    };
    AuthenticationService.prototype.passwordChange = function (email, password, key) {
        return this.http.post(this.url + 'passwordchange', { email: email, password: password, key: key })
            .map(function (response) {
            var retVal = response.text();
            // console.log( retVal );
            return retVal;
        })
            .catch(this.handleError);
    };
    AuthenticationService.prototype.logout = function () {
        // clear token remove user from local storage to log user out
        this.token = null;
        this.user = null;
        this.userid = null;
        localStorage.removeItem('user');
    };
    // this could also be a private method of the component class
    AuthenticationService.prototype.handleError = function (error) {
        console.error(error.statusText);
        // throw an application level error
        return Rx_1.Observable.throw(error.statusText);
    };
    AuthenticationService = __decorate([
        core_1.Injectable(),
        __metadata("design:paramtypes", [app_config_1.AppConfig, http_1.Http, router_1.Router])
    ], AuthenticationService);
    return AuthenticationService;
}());
exports.AuthenticationService = AuthenticationService;
