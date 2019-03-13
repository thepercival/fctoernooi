import { AfterViewChecked, Component, ElementRef, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';
import { Competitor, NameService, PoulePlace } from 'ngx-sport';

@Component({
  selector: 'app-tournament-competitor-line',
  templateUrl: './listline.component.html',
  styleUrls: ['./listline.component.css']
})
export class CompetitorListLineComponent implements OnInit, AfterViewChecked {

  @Input() poulePlaceToSwap: PoulePlace;
  @Input() poulePlace: PoulePlace;
  @Input() nameService: NameService;
  @Input() focus: boolean;
  @Input() isStarted: boolean;
  @Input() showSwap: boolean;
  @Output() editPressed = new EventEmitter<PoulePlace>();
  @Output() swapPressed = new EventEmitter<PoulePlace>();
  @Output() removePressed = new EventEmitter<PoulePlace>();
  @Output() registerPressed = new EventEmitter<Competitor>();

  @ViewChild('btnEdit') private elementRef: ElementRef;

  constructor(
  ) {
  }

  ngOnInit() {
  }

  edit() {
    this.editPressed.emit(this.poulePlace);
  }

  remove() {
    this.removePressed.emit(this.poulePlace);
  }

  swapTwo() {
    this.swapPressed.emit(this.poulePlace);
  }

  register() {
    this.registerPressed.emit(this.poulePlace.getCompetitor());
  }

  ngAfterViewChecked() {
    if (this.focus) {
      this.elementRef.nativeElement.focus();
    }
  }
}
