import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

import { MyNavigation } from '../../shared/common/navigation';
import { TournamentRepository } from '../../lib/tournament/repository';
import { StructureRepository } from '../../lib/ngx-sport/structure/repository';
import { TournamentComponent } from '../../shared/tournament/component';
import { GlobalEventsManager } from '../../shared/common/eventmanager';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { FavoritesRepository } from '../../lib/favorites/repository';
import { TournamentScreen } from '../../shared/tournament/screenNames';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { IAlertType } from '../../shared/common/alert';
import { Tournament } from '../../lib/tournament';
import { JsonTournament } from '../../lib/tournament/json';
import { TournamentMapper } from '../../lib/tournament/mapper';

@Component({
  selector: 'app-tournament-home-edit',
  templateUrl: './homeedit.component.html',
  styleUrls: ['./homeedit.component.scss'],
})
export class HomeEditComponent extends TournamentComponent implements OnInit {

  public form: FormGroup<{
    intro: FormControl<string>, 
    coordinate: FormControl<string|null>
  }>;
  validations: HomeValidations = {
    minlengthintro: 10,
    maxlengthintro: 200,
    minlengthcoordinate: 20,
    maxlengthcoordinate: 30,
  };

  constructor(
    route: ActivatedRoute,
    router: Router,
    tournamentRepository: TournamentRepository,
    structureRepository: StructureRepository,
    globalEventsManager: GlobalEventsManager,
    modalService: NgbModal,
    favRepository: FavoritesRepository,
    private tournamentMapper: TournamentMapper,
    private myNavigation: MyNavigation,
  ) {
    super(route, router, tournamentRepository, structureRepository, globalEventsManager, modalService, favRepository);

    this.form = new FormGroup({
      intro: new FormControl('', {
        nonNullable: true, validators:
          [
            Validators.required,
            Validators.minLength(this.validations.minlengthintro),
            Validators.maxLength(this.validations.maxlengthintro)
          ]
      }),
      coordinate: new FormControl('', {
        nonNullable: false, validators:
          [
            Validators.required,
            Validators.minLength(this.validations.minlengthcoordinate),
            Validators.maxLength(this.validations.maxlengthcoordinate)
          ]
      }),      
    });
  }

  ngOnInit() {
    super.myNgOnInit(() => this.postNgOnInit());
  }

  postNgOnInit() {

    this.form.controls.intro.setValue(this.tournament.getIntro());
    this.form.controls.coordinate.setValue(this.tournament.getCoordinate() ?? null);

    // this.lockerRoomValidator = new LockerRoomValidator(this.tournament.getCompetitors(), this.tournament.getLockerRooms());
    // const firstRoundNumber = this.structure.getFirstRoundNumber();
    // this.hasBegun = firstRoundNumber.hasBegun();
    // this.allPoulesHaveGames = this.structure.allPoulesHaveGames();
    // this.hasPlanningEditManualMode = this.structureHasPlanningEditManualMode(firstRoundNumber);

    // let openModalExe = false;
    // // console.log('outside params');
    // this.route.queryParams.subscribe(params => {
    //   // console.log('params', params);
    //   if (params.newStartForCopyAsTime !== undefined) {
    //     this.openModalCopy(params.newStartForCopyAsTime);
    //   } else if (params.myPreviousId !== undefined && !openModalExe) {
    //     // console.log(this.router.getCurrentNavigation()?.extras.state);
    //     openModalExe = true;
    //     this.openModalCopied(params.myPreviousId);
    //   }
    // });
    this.processing = false;
  }

  get HomeScreen(): TournamentScreen { return TournamentScreen.Home }

  navigateBack() {
    this.myNavigation.back();
  }

  formToJson(): JsonTournament {
    const json = this.tournamentMapper.toJson(this.tournament);
    json.intro = this.form.controls.intro.value; 
    json.coordinate = this.form.controls.coordinate.value ?? undefined;    
    return json;
  }

  save(): boolean {
    this.processing = true;
    this.setAlert(IAlertType.Info, 'de thuispagina wordt opgeslagen');

    this.tournamentRepository.editObject(this.formToJson()).subscribe({
      next: (tournament: Tournament) => {
        this.tournament = tournament;
        this.navigateBack(); 
        this.processing = false;        
      },
      error: (e) => {
        this.setAlert(IAlertType.Danger, e); this.processing = false;
      },
      complete: () => this.processing = false
    });
    return false;
  }

}

export interface HomeValidations {
  minlengthintro: number;
  maxlengthintro: number;
  minlengthcoordinate: number;
  maxlengthcoordinate: number;
}