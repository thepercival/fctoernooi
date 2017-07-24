"use strict";
/**
 * Created by cdunnink on 30-11-2016.
 */
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
var core_1 = require("@angular/core");
var focus_directive_1 = require("./focus.directive");
var FocusModule = (function () {
    function FocusModule() {
    }
    FocusModule_1 = FocusModule;
    FocusModule.forRoot = function () {
        return {
            ngModule: FocusModule_1
        };
    };
    FocusModule = FocusModule_1 = __decorate([
        core_1.NgModule({
            declarations: [focus_directive_1.FocusDirective],
            exports: [focus_directive_1.FocusDirective]
        })
    ], FocusModule);
    return FocusModule;
    var FocusModule_1;
}());
exports.FocusModule = FocusModule;
