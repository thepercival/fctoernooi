import { Component, EventEmitter, Input, Output } from '@angular/core';
import { Round } from 'voetbaljs/round';
import { StructureService } from 'voetbaljs/structure/service';


@Component({
  selector: 'app-selectable-rounds',
  templateUrl: './selectable.rounds.component.html',
  styleUrls: ['./selectable.rounds.component.css']
})
export class TournamentPlanningSelectableRoundsComponent {
  @Input() round: Round;
  @Input() structureService: StructureService;
  @Input() selectedRound: Round;
  @Output() selectRound = new EventEmitter<Round>();

  RoundWINNERS = Round.WINNERS;
  RoundLOSERS = Round.LOSERS;

  getButtonClass() {
    if (this.round === this.selectedRound || this.round.isAncestorOf(this.selectedRound)) {
      return 'btn-outline-primary';
    } else if (this.round.getWinnersOrLosers() === Round.WINNERS) {
      return 'btn-outline-success';
    } else if (this.round.getWinnersOrLosers() === Round.LOSERS) {
      return 'btn-outline-danger';
    }
    return 'btn-outline-secondary';
  }

  getButtonTextClass() {
    if (this.round.getWinnersOrLosers() === Round.WINNERS) {
      return 'text-success';
    } else if (this.round.getWinnersOrLosers() === Round.LOSERS) {
      return 'text-danger';
    }
    return null;
  }

  selectRounFnc(round) {
    this.selectRound.emit(round);
  }

  changeRound(round: Round) {
    this.selectRound.emit(round);
    console.log('detail' + round.getNumber());
  }
}
