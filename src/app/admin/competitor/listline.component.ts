import { AfterViewChecked, Component, ElementRef, Input, output, signal, TemplateRef, ViewChild, WritableSignal, ChangeDetectionStrategy, inject } from '@angular/core';
import { Router } from '@angular/router';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { Place, StructureNameService } from 'ngx-sport';
import { TournamentCompetitor } from '../../lib/competitor';
import { CompetitorRepository } from '../../lib/ngx-sport/competitor/repository';
import { PlaceCompetitorItem } from '../../lib/ngx-sport/placeCompetitorItem';
import { InfoModalComponent } from '../../shared/tournament/infomodal/infomodal.component';
import { TournamentCompetitorMapper } from '../../lib/competitor/mapper';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { EscapeHtmlPipe } from '../../shared/common/escapehtmlpipe';
import { faCircleCheck, faDoorClosed, faPencil, faTrashCan } from '@fortawesome/free-solid-svg-icons';

@Component({
    selector: 'app-tournament-competitor-line',
    templateUrl: './listline.component.html',
    styleUrls: ['./listline.component.css'],
    standalone: true,
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [FontAwesomeModule, EscapeHtmlPipe]
})
export class CompetitorListLineComponent implements AfterViewChecked {
  private modalService = inject(NgbModal);
  private router = inject(Router);
  competitorRepository = inject(CompetitorRepository);
  private competitorMapper = inject(TournamentCompetitorMapper);

  @Input() placeCompetitor!: PlaceCompetitorItem;
  @Input() focus!: boolean;
  @Input() hasBegun!: boolean;
  @Input() hasSomeCompetitorAnImage!: boolean;
  @Input() showLockerRoomNotArranged!: boolean;
  @Input() structureNameService!: StructureNameService;
  @Input() tournamentId!: string | number;
  
  onPressEdit = output<Place>();
  onPressRemove = output<PlaceCompetitorItem>();
  
  public readonly processing: WritableSignal<boolean> = signal(true);
  faPencilAlt = faPencil;
  faDoorClosed = faDoorClosed;
  faCheckCircle = faCircleCheck;
  faTrashAlt = faTrashCan;

  @ViewChild('btnEdit', { static: true }) private btnEditRef: ElementRef | undefined;
  constructor() {
  }

  edit() {
    this.onPressEdit.emit(this.placeCompetitor.place);
  }

  remove() {
    this.onPressRemove.emit(this.placeCompetitor);
  }

  setPresent(competitor: TournamentCompetitor): void {
    const jsonCompetitor = this.competitorMapper.toJson(competitor);
    jsonCompetitor.present = competitor.getPresent() === true ? false : true;

    // const prefix = jsonCompetitor.registered ? 'aan' : 'af';
    // const message = 'deelnemer ' + competitor.getName() + ' wordt ' + prefix + 'gemeld';

    // this.processing.emit(message);

    this.competitorRepository.editObject(jsonCompetitor, competitor, this.tournamentId)
      .subscribe({
        complete: () => this.processing.set(false)
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
    activeModal.componentInstance.header = () => 'kleedkamers';
    activeModal.componentInstance.modalContent = () => modalContent;
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
