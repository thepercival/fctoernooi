import { AfterViewChecked, Component, ElementRef, EventEmitter, Input, OnInit, Output, TemplateRef, ViewChild } from '@angular/core';
import { IconName } from '@fortawesome/fontawesome-svg-core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { NameService, Place } from 'ngx-sport';
import { TournamentCompetitor } from '../../lib/competitor';
import { InfoModalComponent } from '../../shared/tournament/infomodal/infomodal.component';
import { PlaceCompetitorItem } from './list.component';

@Component({
  selector: 'app-tournament-competitor-line',
  templateUrl: './listline.component.html',
  styleUrls: ['./listline.component.css']
})
export class CompetitorListLineComponent implements OnInit, AfterViewChecked {
  @Input() placeCompetitor!: PlaceCompetitorItem;
  @Input() focus!: boolean;
  @Input() hasBegun!: boolean;
  @Input() showLockerRoomNotArranged!: boolean;
  @Input() nameService!: NameService;
  @Output() editPressed = new EventEmitter<Place>();
  @Output() removePressed = new EventEmitter<PlaceCompetitorItem>();
  @Output() registerPressed = new EventEmitter<TournamentCompetitor>();
  @Output() toLockerRooms = new EventEmitter<void>();

  @ViewChild('btnEdit', { static: true }) private elementRef: ElementRef | undefined;

  constructor(private modalService: NgbModal) {
  }

  ngOnInit() {
  }

  edit() {
    this.editPressed.emit(this.placeCompetitor.place);
  }

  remove() {
    this.removePressed.emit(this.placeCompetitor);
  }

  register() {
    this.registerPressed.emit(this.placeCompetitor.competitor);
  }

  getSwitchId(place: Place): string {
    return 'registered-' + place.getId();
  }

  ngAfterViewChecked() {
    if (this.focus && this.elementRef) {
      this.elementRef.nativeElement.focus();
    }
  }

  openLockerRoomInfoModal(modalContent: TemplateRef<any>) {
    const activeModal = this.modalService.open(InfoModalComponent, { windowClass: 'info-modal' });
    activeModal.componentInstance.header = 'kleedkamers';
    activeModal.componentInstance.modalContent = modalContent;
    activeModal.result.then((result) => {
      if (result === 'linkToLockerRooms') {
        this.toLockerRooms.emit();
      }
    }, (reason) => {
    });
  }

  linkToLockerRooms() {
    this.toLockerRooms.emit();
  }
}
