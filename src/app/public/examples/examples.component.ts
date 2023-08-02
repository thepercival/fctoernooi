import { AfterViewInit, Component, ElementRef, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { DateFormatter } from '../../lib/dateFormatter';
import { FavoritesRepository } from '../../lib/favorites/repository';
import { TournamentShell } from '../../lib/tournament/shell';
import { TournamentShellFilter, TournamentShellRepository } from '../../lib/tournament/shell/repository';
import { IAlert, IAlertType } from '../../shared/common/alert';
import { GlobalEventsManager } from '../../shared/common/eventmanager';
import { AbstractControl, FormControl, FormGroup } from '@angular/forms';
import { NgbDateStruct, NgbModal } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-tournament-examples',
  templateUrl: './examples.component.html',
  styleUrls: ['./examples.component.scss']
})
export class ExamplesComponent implements OnInit{

  public processing = true;
  public alert: IAlert | undefined;

  constructor(
    private router: Router,
    private modalService: NgbModal,
    globalEventsManager: GlobalEventsManager
  ) {
    globalEventsManager.showFooter.emit(true);
  }  

  ngOnInit() {
    this.processing = false;
  }

  linkToView(shell: TournamentShell) {
    this.processing = true;
    // const suffix = this.favoritesRepos.hasObject(shell.tournamentId) ? '' : '/favorites';
    // this.router.navigate(['/public' + suffix, shell.tournamentId]);
  }

  linkExampleModal(modalContent: TemplateRef<any>) {
    const activeModal = this.modalService.open(modalContent);
    activeModal.componentInstance.header = 'uitleg scheidsrechters';
    activeModal.componentInstance.noHeaderBorder = true;
    activeModal.result.then((result) => {
      // go to 
    }, (reason) => { });
  }
}