"use strict";
/**
 * Created by cdunnink on 9-12-2016.
 */
Object.defineProperty(exports, "__esModule", { value: true });
var QualifyRule = (function () {
    function QualifyRule(fromRound, toRound) {
        // config: any;
        this.fromPoulePlaces = [];
        this.toPoulePlaces = [];
        this.fromRound = fromRound;
        this.toRound = toRound;
    }
    return QualifyRule;
}());
exports.QualifyRule = QualifyRule;
