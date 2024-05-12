import { AfterViewChecked, Component, ElementRef, EventEmitter, Input, OnInit, Output, TemplateRef, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { Place, StructureNameService } from 'ngx-sport';
import { TournamentCompetitor } from '../../lib/competitor';
import { CompetitorRepository } from '../../lib/ngx-sport/competitor/repository';
import { PlaceCompetitorItem } from '../../lib/ngx-sport/placeCompetitorItem';
import { InfoModalComponent } from '../../shared/tournament/infomodal/infomodal.component';
import { TournamentCompetitorMapper } from '../../lib/competitor/mapper';

@Component({
  selector: 'app-tournament-competitor-line',
  templateUrl: './listline.component.html',
  styleUrls: ['./listline.component.css']
})
export class CompetitorListLineComponent implements AfterViewChecked {
  @Input() placeCompetitor!: PlaceCompetitorItem;
  @Input() focus!: boolean;
  @Input() hasBegun!: boolean;
  @Input() hasSomeCompetitorAnImage!: boolean;
  @Input() showLockerRoomNotArranged!: boolean;
  @Input() structureNameService!: StructureNameService;
  @Input() tournamentId!: string | number;
  @Output() editPressed = new EventEmitter<Place>();
  @Output() removePressed = new EventEmitter<PlaceCompetitorItem>();
  public processing: boolean = false;

  @ViewChild('btnEdit', { static: true }) private btnEditRef: ElementRef | undefined;

  constructor(
    private modalService: NgbModal,
    private router: Router,
    public competitorRepository: CompetitorRepository,
    private competitorMapper: TournamentCompetitorMapper) {
  }

  edit() {
    this.editPressed.emit(this.placeCompetitor.place);
  }

  remove() {
    this.removePressed.emit(this.placeCompetitor);
  }

  setPresent(competitor: TournamentCompetitor): void {
    const jsonCompetitor = this.competitorMapper.toJson(competitor);
    jsonCompetitor.present = competitor.getPresent() === true ? false : true;

    // const prefix = jsonCompetitor.registered ? 'aan' : 'af';
    // const message = 'deelnemer ' + competitor.getName() + ' wordt ' + prefix + 'gemeld';

    // this.processing.emit(message);

    this.competitorRepository.editObject(jsonCompetitor, competitor, this.tournamentId)
      .subscribe({
        complete: () => this.processing = false
      });
  }

  getSwitchId(place: Place): string {
    return 'registered-' + place.getId();
  }

  ngAfterViewChecked() {
    if (this.focus && this.btnEditRef) {
      this.btnEditRef.nativeElement.focus();
    }
  }

  openLockerRoomInfoModal(modalContent: TemplateRef<any>) {
    const activeModal = this.modalService.open(InfoModalComponent, { windowClass: 'info-modal' });
    activeModal.componentInstance.header = 'kleedkamers';
    activeModal.componentInstance.modalContent = modalContent;
    activeModal.result.then((result) => {
      if (result === 'linkToLockerRooms') {
        this.linkToLockerRooms();
      }
    }, (reason) => {
    });
  }

  linkToLockerRooms() {
    this.router.navigate(
      ['/admin/lockerrooms', this.tournamentId]
    );
  }
}
