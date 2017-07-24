"use strict";
/**
 * Created by cdunnink on 7-12-2016.
 */
Object.defineProperty(exports, "__esModule", { value: true });
var Participant = (function () {
    function Participant(name) {
        this.name = name;
    }
    Participant.prototype.getName = function () {
        return this.name;
    };
    Participant.prototype.setName = function (name) {
        this.name = name;
    };
    return Participant;
}());
exports.Participant = Participant;
