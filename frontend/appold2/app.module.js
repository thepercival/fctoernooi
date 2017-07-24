"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
var core_1 = require("@angular/core");
require("./rxjs-extensions");
var core_2 = require("@angular/core");
var app_config_1 = require("./app.config");
var platform_browser_1 = require("@angular/platform-browser");
var forms_1 = require("@angular/forms");
var ng_bootstrap_1 = require("@ng-bootstrap/ng-bootstrap");
var http_1 = require("@angular/http");
var app_routing_module_1 = require("./app-routing.module");
var component_1 = require("./navbar/component");
var app_component_1 = require("./app.component");
var focus_module_1 = require("./_directives/focus.module");
var component_2 = require("./home/component");
var service_1 = require("./auth/service");
var guard_1 = require("./auth/guard");
var service_2 = require("./user/service");
var register_component_1 = require("./user/register.component");
var activate_component_1 = require("./user/activate.component");
var logout_component_1 = require("./user/logout.component");
var login_component_1 = require("./user/login.component");
var users_component_1 = require("./user/users.component");
var password_component_1 = require("./user/password.component");
var global_events_manager_1 = require("./global-events-manager");
var component_3 = require("./admin/component");
var AppModule = (function () {
    function AppModule() {
    }
    AppModule = __decorate([
        core_1.NgModule({
            imports: [
                platform_browser_1.BrowserModule,
                forms_1.FormsModule,
                http_1.HttpModule,
                ng_bootstrap_1.NgbModule.forRoot(),
                app_routing_module_1.AppRoutingModule,
                focus_module_1.FocusModule.forRoot()
            ],
            declarations: [
                app_component_1.AppComponent,
                component_1.NavbarComponent,
                component_2.HomeComponent,
                component_3.AdminComponent,
                register_component_1.RegisterComponent, activate_component_1.ActivateComponent, login_component_1.LoginComponent, logout_component_1.LogoutComponent, password_component_1.PasswordResetComponent, password_component_1.PasswordChangeComponent, users_component_1.UsersComponent
            ],
            entryComponents: [],
            providers: [
                guard_1.AuthGuard,
                service_1.AuthenticationService,
                service_2.UserService,
                global_events_manager_1.GlobalEventsManager,
                app_config_1.AppConfig,
                { provide: core_2.APP_INITIALIZER, useFactory: function (config) { return function () { return config.load(); }; }, deps: [app_config_1.AppConfig], multi: true }
            ],
            bootstrap: [
                app_component_1.AppComponent
            ]
        })
    ], AppModule);
    return AppModule;
}());
exports.AppModule = AppModule;
