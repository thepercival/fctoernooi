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
var platform_browser_1 = require("@angular/platform-browser");
var forms_1 = require("@angular/forms");
var ng_bootstrap_1 = require("@ng-bootstrap/ng-bootstrap");
var http_1 = require("@angular/http");
var app_routing_module_1 = require("./app-routing.module");
var component_1 = require("./navbar/component");
var app_component_1 = require("./app.component");
var focus_module_1 = require("./_directives/focus.module");
var index_component_1 = require("./competitionseason/index.component");
var structure_component_1 = require("./competitionseason/structure.component");
var round_component_1 = require("./competitionseason/round.component");
var poule_component_1 = require("./competitionseason/poule.component");
var component_2 = require("./home/component");
var service_1 = require("./competitionseason/service");
var service_inmemory_1 = require("./competitionseason/service.inmemory");
var service_2 = require("./auth/service");
var guard_1 = require("./auth/guard");
var service_3 = require("./user/service");
var register_component_1 = require("./user/register.component");
var activate_component_1 = require("./user/activate.component");
var logout_component_1 = require("./user/logout.component");
var login_component_1 = require("./user/login.component");
var users_component_1 = require("./user/users.component");
var component_3 = require("./competitionseason/newmodal/component");
var password_component_1 = require("./user/password.component");
var global_events_manager_1 = require("./global-events-manager");
// import { CompetitionSeasonSearchComponent } from './competition-season-search.component';
// import { InMemoryWebApiModule } from 'angular-in-memory-web-api';
// import { InMemoryDataService }  from './in-memory-data.service';
var AppModule = (function () {
    function AppModule() {
    }
    AppModule = __decorate([
        core_1.NgModule({
            imports: [
                platform_browser_1.BrowserModule,
                forms_1.FormsModule,
                http_1.HttpModule,
                // InMemoryWebApiModule.forRoot(InMemoryDataService),
                ng_bootstrap_1.NgbModule.forRoot(),
                app_routing_module_1.AppRoutingModule,
                focus_module_1.FocusModule.forRoot()
            ],
            declarations: [
                app_component_1.AppComponent,
                component_1.NavbarComponent,
                component_2.HomeComponent,
                index_component_1.CompetitionSeasonIndexComponent, structure_component_1.CompetitionSeasonStructureComponent,
                round_component_1.CompetitionSeasonRoundComponent, poule_component_1.CompetitionSeasonPouleComponent,
                register_component_1.RegisterComponent, activate_component_1.ActivateComponent, login_component_1.LoginComponent, logout_component_1.LogoutComponent, password_component_1.PasswordResetComponent, password_component_1.PasswordChangeComponent, users_component_1.UsersComponent,
                component_3.NgbdModalContent
            ],
            entryComponents: [
                component_3.NgbdModalContent
            ],
            providers: [
                service_1.CompetitionSeasonService, service_inmemory_1.CompetitionSeasonInMemoryService,
                guard_1.AuthGuard,
                service_2.AuthenticationService,
                service_3.UserService,
                global_events_manager_1.GlobalEventsManager
            ],
            bootstrap: [
                app_component_1.AppComponent
            ]
        })
    ], AppModule);
    return AppModule;
}());
exports.AppModule = AppModule;
