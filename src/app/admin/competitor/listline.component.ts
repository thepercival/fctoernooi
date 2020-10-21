import { AfterViewChecked, Component, ElementRef, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';
import { NameService, Place } from 'ngx-sport';
import { TournamentCompetitor } from '../../lib/competitor';

@Component({
  selector: 'app-tournament-competitor-line',
  templateUrl: './listline.component.html',
  styleUrls: ['./listline.component.css']
})
export class CompetitorListLineComponent implements OnInit, AfterViewChecked {
  @Input() place: Place;
  @Input() competitor: TournamentCompetitor;
  @Input() focus: boolean;
  @Input() hasBegun: boolean;
  @Input() showLockerRoomNotArranged: boolean;
  @Input() nameService: NameService;
  @Output() editPressed = new EventEmitter<Place>();
  @Output() removePressed = new EventEmitter<Place>();
  @Output() registerPressed = new EventEmitter<TournamentCompetitor>();
  @Output() toLockerRooms = new EventEmitter<void>();

  @ViewChild('btnEdit', { static: true }) private elementRef: ElementRef;

  ngOnInit() {
  }

  edit() {
    this.editPressed.emit(this.place);
  }

  remove() {
    this.removePressed.emit(this.place);
  }

  register() {
    this.registerPressed.emit(this.competitor);
  }

  ngAfterViewChecked() {
    if (this.focus) {
      this.elementRef.nativeElement.focus();
    }
  }
}
