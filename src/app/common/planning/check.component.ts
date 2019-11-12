import { Component, Input, OnInit } from '@angular/core';
import { Structure, SportCustom } from 'ngx-sport';

@Component({
    selector: 'app-planning-check',
    templateUrl: './check.component.html',
    styleUrls: ['./check.component.scss']
})
export class PlanningCheckComponent implements OnInit {
    @Input() structure: Structure;

    constructor() {

        // als er een betere planning is gevonden, dan deze uitvoeren 
        // voor het uitvoeren moet de bovenliggende controller in processing mode en
        // en vervolgens de structure opnieuw laden!!
        // twee output methods zijn dan nodig

    }

    ngOnInit() {
        // loop door de roundnumbers en kijk als er eventueel 
        // naar betere planningen gekeken moet worden
    }
}
