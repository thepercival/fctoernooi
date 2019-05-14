import { Component, Input } from '@angular/core';
import { Round } from 'ngx-sport';

@Component({
    selector: 'app-tournament-structurequalify',
    templateUrl: './qualify.component.html',
    styleUrls: ['./qualify.component.css']
})
export class TournamentStructureQualifyComponent {

    @Input() round: Round;
    // @Output() roundNumberChanged = new EventEmitter<RoundNumber>();
    // @Input() editable: boolean;
    // public alert: any;
    // private structureService: StructureService;

    constructor(
        //     public nameService: NameService, public cssService: CSSService, private modalService: NgbModal
    ) {
        //   this.resetAlert();
        //  this.structureService = new StructureService({ min: Tournament.MINNROFCOMPETITORS, max: Tournament.MAXNROFCOMPETITORS });
    }

    switchView() {
        // call Output
    }
}
