"use strict";
/**
 * Created by cdunnink on 7-12-2016.
 */
Object.defineProperty(exports, "__esModule", { value: true });
var PoulePlace = (function () {
    function PoulePlace(poule) {
        this.participant = null;
        this.fromQualifyRule = null;
        this.toQualifyRule = null;
        this.poule = poule;
        this.number = poule.places.length + 1;
    }
    return PoulePlace;
}());
exports.PoulePlace = PoulePlace;
