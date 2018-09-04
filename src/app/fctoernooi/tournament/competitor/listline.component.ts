import { AfterViewChecked, Component, ElementRef, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';
import { PoulePlace, StructureNameService } from 'ngx-sport';

@Component({
  selector: 'app-tournament-competitor-line',
  templateUrl: './listline.component.html',
  styleUrls: ['./listline.component.css']
})
export class CompetitorListLineComponent implements OnInit, AfterViewChecked {

  @Input() poulePlaceToSwap: PoulePlace;
  @Input() poulePlace: PoulePlace;
  @Input() nameService: StructureNameService;
  @Input() focus: boolean;
  @Input() showSwap: boolean;
  @Output() editPressed = new EventEmitter<PoulePlace>();
  @Output() swapPressed = new EventEmitter<PoulePlace>();

  @ViewChild('btnEdit') private elementRef: ElementRef;

  constructor(
  ) {
  }

  ngOnInit() {
  }

  edit() {
    this.editPressed.emit(this.poulePlace);
  }

  swapTwo() {
    this.swapPressed.emit(this.poulePlace);
  }

  ngAfterViewChecked() {
    if (this.focus) {
      this.elementRef.nativeElement.focus();
    }
  }
}
