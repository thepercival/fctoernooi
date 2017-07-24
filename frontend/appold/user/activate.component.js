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
var service_2 = require("../auth/service");
var ActivateComponent = (function () {
    function ActivateComponent(activatedRoute, router, userService, authService) {
        this.activatedRoute = activatedRoute;
        this.router = router;
        this.userService = userService;
        this.authService = authService;
        this.loading = false;
        this.error = '';
    }
    ActivateComponent.prototype.ngOnInit = function () {
        var _this = this;
        this.authService.logout();
        // subscribe to router event, params or queryParams
        this.loading = true;
        this.subscription = this.activatedRoute.queryParams.subscribe(function (param) {
            var email = param['email'];
            var activationKey = param['activationkey'];
            _this.authService.activate(email, activationKey)
                .subscribe(
            /* happy path */ function (retval) {
                var navigationExtras = {
                    queryParams: { 'message': 'je account is geactiveerd, je kunt nu inloggen' }
                };
                _this.router.navigate(['/login'], navigationExtras);
                // console.log( 'gebruiker is geactiveerd' );
                // console.log( retval );
                // should redirect to loging with messagge
            }, 
            /* error path */ function (e) {
                _this.error = 'account is niet geactiveerd:' + e;
            }, 
            /* onComplete */ function () { });
        });
    };
    ActivateComponent.prototype.ngOnDestroy = function () {
        // prevent memory leak by unsubscribing
        this.subscription.unsubscribe();
    };
    ActivateComponent.prototype.activate = function () {
        // this.userService.create( user )
        //   .subscribe(
        //      /* happy path */ p => {
        //           this.authService.login( user.email, user.password)
        //                .subscribe(
        //                       /* happy path */ p => this.router.navigate(['/']),
        //                       /* error path */ e => { this.error = e; this.loading = false; },
        //                       /* onComplete */ () => this.loading = false
        //                  );
        //          },
        //           /* error path */ e => { this.error = e; this.loading = false; },
        //           /* onComplete */ () => this.loading = false
        //   );
    };
    ActivateComponent = __decorate([
        core_1.Component({
            moduleId: module.id,
            selector: 'activate',
            templateUrl: 'activate.component.html',
            styleUrls: ['activate.component.css']
        }),
        __metadata("design:paramtypes", [router_1.ActivatedRoute, router_1.Router, service_1.UserService, service_2.AuthenticationService])
    ], ActivateComponent);
    return ActivateComponent;
}());
exports.ActivateComponent = ActivateComponent;
