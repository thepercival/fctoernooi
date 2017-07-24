"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
var router_1 = require("@angular/router");
var core_1 = require("@angular/core");
var component_1 = require("./home/component");
var register_component_1 = require("./user/register.component");
var activate_component_1 = require("./user/activate.component");
var login_component_1 = require("./user/login.component");
var logout_component_1 = require("./user/logout.component");
var password_component_1 = require("./user/password.component");
var users_component_1 = require("./user/users.component");
var component_2 = require("./admin/component");
var guard_1 = require("./auth/guard");
var routes = [
    { path: 'home', component: component_1.HomeComponent },
    { path: 'register', component: register_component_1.RegisterComponent },
    { path: 'activate', component: activate_component_1.ActivateComponent },
    { path: 'login', component: login_component_1.LoginComponent },
    { path: 'logout', component: logout_component_1.LogoutComponent },
    { path: 'passwordreset', component: password_component_1.PasswordResetComponent },
    { path: 'passwordchange', component: password_component_1.PasswordChangeComponent },
    { path: 'users', component: users_component_1.UsersComponent, canActivate: [guard_1.AuthGuard] },
    { path: 'admin', component: component_2.AdminComponent, canActivate: [guard_1.AuthGuard] },
    { path: '', redirectTo: '/home', pathMatch: 'full' },
    // otherwise redirect to home
    { path: '**', redirectTo: '' }
];
var AppRoutingModule = (function () {
    function AppRoutingModule() {
    }
    AppRoutingModule = __decorate([
        core_1.NgModule({
            imports: [router_1.RouterModule.forRoot(routes)],
            exports: [router_1.RouterModule]
        })
    ], AppRoutingModule);
    return AppRoutingModule;
}());
exports.AppRoutingModule = AppRoutingModule;
