import { AfterViewInit, Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { DateFormatter } from '../../lib/dateFormatter';
import { FavoritesRepository } from '../../lib/favorites/repository';
import { TournamentShell } from '../../lib/tournament/shell';
import { TournamentShellFilter, TournamentShellRepository } from '../../lib/tournament/shell/repository';
import { IAlert, IAlertType } from '../../shared/common/alert';
import { GlobalEventsManager } from '../../shared/common/eventmanager';
import { AbstractControl, FormControl, FormGroup } from '@angular/forms';
import { NgbDateStruct } from '@ng-bootstrap/ng-bootstrap';
import { DateConverter } from '../../lib/dateConverter';

@Component({
  selector: 'app-tournament-public-shells',
  templateUrl: './shells.component.html',
  styleUrls: ['./shells.component.scss']
})
export class PublicShellsComponent implements OnInit{

  public searchForm: FormGroup;/*<{
    name: FormControl<string>,
    startDate: FormControl<string>,
    endDate: FormControl<string>,
  }>;*/

  public shells: TournamentShell[] = [];
  public processing = true;
  public processingSearch = false;
  public alert: IAlert | undefined;

  private linethroughDate: Date;

  constructor(
    private router: Router,
    private tournamentShellRepos: TournamentShellRepository,
    private favoritesRepos: FavoritesRepository,
    public dateFormatter: DateFormatter,
    private dateConverter: DateConverter,
    globalEventsManager: GlobalEventsManager
  ) {
    this.linethroughDate = new Date();
    this.linethroughDate.setHours(this.linethroughDate.getHours() + 4);

    this.searchForm = new FormGroup({
      name: new FormControl('', { nonNullable: true }),
      startDate: new FormControl('', { nonNullable: true }),
      endDate: new FormControl('', { nonNullable: true }),
    });

    globalEventsManager.showFooter.emit(true);
  }  

  ngOnInit() {
    const startDate = new Date();
    startDate.setHours(0);
    startDate.setMinutes(0);

    const endDate = new Date(startDate);
    endDate.setDate(endDate.getDate() + 7);

    this.dateConverter.setDate(this.searchForm.controls.startDate, startDate);
    this.dateConverter.setDate(this.searchForm.controls.endDate, endDate);
    this.processing = false;
    this.search();
  }

  dateStructToDate(dateStruct: NgbDateStruct): Date {
    return new Date(
      dateStruct.year,
      dateStruct.month - 1,
      dateStruct.day
    );
}

  private getSearchFilterFromForm(name?: string): TournamentShellFilter {
    const filter = { 
      name: this.searchForm.controls.name.value,
      startDate: this.dateConverter.getDate(this.searchForm.controls.startDate), 
      endDate: this.dateConverter.getDate(this.searchForm.controls.endDate)
    };
    if( name !== undefined) {
      filter.name = name;
    }
    return filter;
  }

  search(name?: string) {
    
    this.processingSearch = true;
    const searchFilter = this.getSearchFilterFromForm(name);
    this.tournamentShellRepos.getObjects(searchFilter)
      .subscribe({
        next: (shellsRes: TournamentShell[]) => {
          shellsRes.sort((ts1: TournamentShell, ts2: TournamentShell) => {
            return (ts1.startDateTime > ts2.startDateTime ? 1 : -1);
          });
          this.shells = shellsRes;
          this.processingSearch = false;
        },
        error: (e) => {
          this.setAlert(IAlertType.Danger, e); this.processingSearch = false;
        }
      });
  }


  onSearchNameChanges(nativeElement: any): void {
    // console.log(nativeElement);
    if (nativeElement) {
      this.searchForm.controls.name.setValue(nativeElement.target.value);
      this.search(nativeElement.target.value);
    }
  }

  onSearchDateChanges(): void {
    console.log(this.searchForm.controls.name.value);
    this.search(this.searchForm.controls.name.value);
  }

  linkToView(shell: TournamentShell) {
    this.processing = true;
    const suffix = this.favoritesRepos.hasObject(shell.tournamentId) ? '' : '/favorites';
    this.router.navigate(['/public' + suffix, shell.tournamentId]);
  }

  protected setAlert(type: IAlertType, message: string) {
    this.alert = { 'type': type, 'message': message };
  }

  inPast(date: Date): boolean {
    return this.linethroughDate.getTime() > date.getTime();
  }
}