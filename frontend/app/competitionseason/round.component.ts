/**
 * Created by cdunnink on 7-12-2016.
 */

import { Component, Input } from '@angular/core';
import { Round } from '../voetbal/round';

@Component({
    moduleId: module.id,
    selector: 'toernooi-ronde',
    templateUrl: 'round.component.html',
    styleUrls: [ 'round.component.css' ]
})

export class CompetitionSeasonRoundComponent {
    @Input()
    round: Round;

    nrOfParticipantsToQualify: number = 0;

    constructor(

    ) {}




}

