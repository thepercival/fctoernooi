import { AfterViewChecked, Component, ElementRef, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';
import { Competitor, NameService, Place } from 'ngx-sport';

@Component({
  selector: 'app-tournament-competitor-line',
  templateUrl: './listline.component.html',
  styleUrls: ['./listline.component.css']
})
export class CompetitorListLineComponent implements OnInit, AfterViewChecked {
  @Input() place: Place;
  @Input() nameService: NameService;
  @Input() focus: boolean;
  @Input() hasBegun: boolean;
  @Output() editPressed = new EventEmitter<Place>();
  @Output() removePressed = new EventEmitter<Place>();
  @Output() registerPressed = new EventEmitter<Competitor>();

  @ViewChild('btnEdit', { static: true }) private elementRef: ElementRef;

  constructor(
  ) {
  }

  ngOnInit() {
  }

  edit() {
    this.editPressed.emit(this.place);
  }

  remove() {
    this.removePressed.emit(this.place);
  }

  register() {
    this.registerPressed.emit(this.place.getCompetitor());
  }

  ngAfterViewChecked() {
    if (this.focus) {
      this.elementRef.nativeElement.focus();
    }
  }
}
