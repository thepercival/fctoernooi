/**
 * Created by cdunnink on 7-12-2016.
 */


import { Component, Input } from '@angular/core';
import { Poule } from '../voetbal/poule';

@Component({
    moduleId: module.id,
    selector: 'toernooi-poule',
    templateUrl: 'poule.component.html',
    styleUrls: [ 'poule.component.css' ]
})

export class CompetitionSeasonPouleComponent {
    @Input()
    poule: Poule;

    constructor() {
    }


    addPoulePlace(): void {
        let poulePlace = this.poule.addPlace();
    }

    isPoulePlaceRemovable(): boolean {
        return true;
    }

    removePoulePlace(): void {
        /*this.cbjectService.update(this.object)
         .forEach(() => this.goBack());*/
    }
}

