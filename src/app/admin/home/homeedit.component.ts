import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import {
  BalancedPouleStructure,
  Category,
  Competitor,
  JsonStructure,
  Round,
  StartLocationMap,
  Structure,
  StructureEditor,
  StructureMapper,
  StructureNameService
} from 'ngx-sport';

import { MyNavigation } from '../../shared/common/navigation';
import { TournamentRepository } from '../../lib/tournament/repository';
import { StructureRepository } from '../../lib/ngx-sport/structure/repository';
import { TournamentComponent } from '../../shared/tournament/component';
import { PlanningRepository } from '../../lib/ngx-sport/planning/repository';
import { DefaultService } from '../../lib/ngx-sport/defaultService';
import { IAlertType } from '../../shared/common/alert';
import { QualifyPathNode } from 'ngx-sport';
import { GlobalEventsManager } from '../../shared/common/eventmanager';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { NameModalComponent } from '../../shared/tournament/namemodal/namemodal.component';
import { CategoryUniqueChecker } from '../../lib/ngx-sport/category/uniqueChecker';
import { FavoritesRepository } from '../../lib/favorites/repository';
import { CategoryChooseModalComponent } from '../../shared/tournament/category/chooseModal.component';
import { Favorites } from '../../lib/favorites';
import { TournamentScreen } from '../../shared/tournament/screenNames';
import { TournamentRegistrationRepository } from '../../lib/tournament/registration/repository';
import { TournamentRegistration } from '../../lib/tournament/registration';
import { CategoryModalComponent } from '../../shared/tournament/structure/categorymodal/categorymodal.component';

@Component({
  selector: 'app-tournament-home-edit',
  templateUrl: './homeedit.component.html',
  styleUrls: ['./homeedit.component.scss'],
})
export class HomeEditComponent extends TournamentComponent implements OnInit {
  constructor(
    route: ActivatedRoute,
    router: Router,
    tournamentRepository: TournamentRepository,
    structureRepository: StructureRepository,
    globalEventsManager: GlobalEventsManager,
    modalService: NgbModal,
    favRepository: FavoritesRepository,
    private myNavigation: MyNavigation,
  ) {
    super(route, router, tournamentRepository, structureRepository, globalEventsManager, modalService, favRepository);


  }

  ngOnInit() {
    super.myNgOnInit(() => this.postNgOnInit());
  }

  postNgOnInit() {
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

  // ngAfterViewChecked() {
  //   if (this.roundElRef !== undefined && !this.processing && !this.scrolled) {
  //     this.scrolled = true;
  //     this.roundElRef.nativeElement.scrollIntoView({ behavior: 'smooth' });
  //   }
  // }

}
