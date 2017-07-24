"use strict";
/**
 * Created by cdunnink on 7-12-2016.
 */
Object.defineProperty(exports, "__esModule", { value: true });
var pouleplace_1 = require("./pouleplace");
var Poule = (function () {
    function Poule(round) {
        this.places = [];
        this.round = round;
        this.number = round.poules.length + 1;
    }
    Poule.prototype.addPlace = function () {
        var pouleplace = new pouleplace_1.PoulePlace(this);
        this.places.push(pouleplace);
        return pouleplace;
    };
    ;
    Poule.prototype.removePlace = function () {
        // check if place is not in a qualifyrule
    };
    ;
    return Poule;
}());
exports.Poule = Poule;
