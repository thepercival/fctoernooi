import { AfterViewInit, Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import {
  CompetitionSportService,
  Competitor,
  CompetitorMap,
  NameService,
  PlaceRanges,
  RoundNumber,
  Structure,
  StructureEditor,
} from 'ngx-sport';

import { MyNavigation } from '../../shared/common/navigation';
import { TournamentRepository } from '../../lib/tournament/repository';
import { StructureRepository } from '../../lib/ngx-sport/structure/repository';
import { TournamentComponent } from '../../shared/tournament/component';
import { PlanningRepository } from '../../lib/ngx-sport/planning/repository';
import { cloneDeep } from 'lodash';
import { DefaultService } from '../../lib/ngx-sport/defaultService';
import { IAlertType } from '../../shared/common/alert';
import { ShepherdService } from 'angular-shepherd';

@Component({
  selector: 'app-tournament-structure',
  templateUrl: './edit.component.html',
  styleUrls: ['./edit.component.css'],
})
export class StructureEditComponent extends TournamentComponent implements OnInit, AfterViewInit {
  changedRoundNumber: RoundNumber | undefined;
  originalCompetitors!: Competitor[];
  clonedStructure!: Structure;
  public nameService!: NameService;

  constructor(
    route: ActivatedRoute,
    router: Router,
    tournamentRepository: TournamentRepository,
    structureRepository: StructureRepository,
    public structureEditor: StructureEditor,
    private planningRepository: PlanningRepository,
    private competitionSportService: CompetitionSportService,
    private myNavigation: MyNavigation,
    private defaultService: DefaultService,
    public shepherdService: ShepherdService
  ) {
    super(route, router, tournamentRepository, structureRepository);
  }

  ngOnInit() {
    const noStructure = true;
    super.myNgOnInit(() => {
      this.nameService = new NameService(new CompetitorMap(this.tournament.getCompetitors()));
      this.structureEditor.setPlaceRanges(this.getPlaceRanges());
      this.structureRepository.getObject(this.tournament)
        .subscribe({
          next: (structure: Structure) => {
            this.structure = structure;
            this.clonedStructure = this.createClonedStructure(this.structure);
            this.processing = false;
          },
          error: (e: string) => {
            const sportVariant = this.competition.getSingleSport().getVariant();
            const pouleStructure = this.defaultService.getPouleStructure([sportVariant]);
            const jsonPlanningConfig = this.defaultService.getJsonPlanningConfig(sportVariant);
            this.structure = this.structureEditor.create(this.competition, pouleStructure, jsonPlanningConfig);
            this.clonedStructure = this.createClonedStructure(this.structure);
            this.setAlert(IAlertType.Danger, e + ', new structure created');
            this.processing = false;
          }
        });
    }, noStructure);
  }

  ngAfterViewInit() {

    this.shepherdService.modal = true;
    this.shepherdService.confirmCancel = false;

    this.shepherdService.addSteps([
      {
        id: 'addPoule',
        attachTo: {
          element: '#first-btn-addpoule',
          on: 'bottom'
        },
        arrow: false,
        beforeShowPromise: function () {
          return new Promise((resolve) => {
            setTimeout(function () {
              window.scrollTo(0, 0);
              resolve(undefined);
              console.log('scrolllll');
            }, 1000);
          });
        },
        cancelIcon: { enabled: false },
        advanceOn: { selector: '#first-btn-addpoule', event: 'click' },
        highlightClass: 'highlight-custom',
        scrollTo: false,
        title: 'uitleg opzet-editor',
        text: ['voeg een poule toe door op de plus te klikken']
      },
      {
        id: 'addWinner',
        attachTo: {
          element: '#btn-addwinner-1',
          on: 'bottom'
        },
        cancelIcon: { enabled: false },
        advanceOn: { selector: '#btn-addwinner-1', event: 'click' },
        highlightClass: 'highlight',
        scrollTo: false,
        title: 'uitleg opzet-editor',
        text: ['voeg 4 plaatsen aan de volgende ronde toe']
      }
      ,
      {
        id: 'addWinner3',
        attachTo: {
          element: '#btn-addwinner-1',
          on: 'bottom'
        },
        cancelIcon: { enabled: false },
        advanceOn: { selector: '#btn-addwinner-1', event: 'click' },
        highlightClass: 'highlight',
        scrollTo: false,
        title: 'uitleg opzet-editor',
        text: ['voeg nog een plaats aan de volgende ronde toe']
      }
      ,
      {
        id: 'addWinner4',
        attachTo: {
          element: '#btn-addwinner-1',
          on: 'bottom'
        },
        cancelIcon: { enabled: false },
        advanceOn: { selector: '#btn-addwinner-1', event: 'click' },
        highlightClass: 'highlight',
        scrollTo: false,
        title: 'uitleg opzet-editor',
        text: ['voeg de vierde plaats aan de volgende ronde toe']
      }
      ,
      {
        id: 'editQualifyGroup',
        attachTo: {
          element: '#btn-edit-qualifygroup-1',
          on: 'bottom'
        }/*,
        beforeShowPromise: function () {
          return new Promise((resolve) => {
            setTimeout(function () {
              //     window.scrollTo(500, 0);
              resolve(undefined);
              console.log('scrolllll');
            }, 1000);
          });
        }*/,
        cancelIcon: { enabled: false },
        advanceOn: { selector: '#btn-edit-qualifygroup-1', event: 'click' },
        highlightClass: 'highlight',
        scrollTo: true,
        title: 'uitleg opzet-editor',
        text: ['verander kruisfinales in finales per plaats, door de kwailificatiegroep aan te passen']
      }
      ,
      {
        id: 'splitQualifyGroup',
        attachTo: {
          element: '#btn-split-qualifygroup-1',
          on: 'bottom'
        },
        cancelIcon: { enabled: false },
        advanceOn: { selector: '#btn-split-qualifygroup-1', event: 'click' },
        highlightClass: 'highlight',
        scrollTo: false,
        title: 'uitleg opzet-editor',
        text: ['verander kruisfinales in finales per plaats']
      }
    ]);
    console.log(123);
    this.shepherdService.start();
  }


  protected getPlaceRanges(): PlaceRanges {
    const sportVariants = this.competition.getSportVariants();
    const minNrOfPlacesPerPoule = this.competitionSportService.getMinNrOfPlacesPerPoule(sportVariants);
    const maxNrOfPlacesPerPouleSmall = 20;
    const maxNrOfPlacesPerPouleLarge = 12;
    const minNrOfPlacesPerRound = minNrOfPlacesPerPoule;
    const maxNrOfPlacesPerRoundSmall = 40;
    const maxNrOfPlacesPerRoundLarge = 128;
    return new PlaceRanges(
      minNrOfPlacesPerPoule, maxNrOfPlacesPerPouleSmall, maxNrOfPlacesPerPouleLarge,
      minNrOfPlacesPerRound, maxNrOfPlacesPerRoundSmall, maxNrOfPlacesPerRoundLarge
    );
  }

  createClonedStructure(structure: Structure): Structure {
    this.originalCompetitors = this.tournament.getCompetitors();
    return cloneDeep(structure);
  }

  setChangedRoundNumber(changedRoundNumber: RoundNumber) {
    if (this.changedRoundNumber !== undefined && changedRoundNumber.getNumber() > this.changedRoundNumber.getNumber()) {
      return;
    }
    this.changedRoundNumber = changedRoundNumber;
    this.resetAlert();
  }

  saveStructure() {
    this.processing = true;
    this.setAlert(IAlertType.Info, 'wijzigingen worden opgeslagen');

    this.structureRepository.editObject(this.clonedStructure, this.tournament)
      .subscribe({
        next: (structureRes: Structure) => {
          this.syncPlanning(structureRes, 1/*this.changedRoundNumber.getNumber()*/); // should always be first roundnumber
        },
        error: (e) => { this.setAlert(IAlertType.Danger, e); this.processing = false; }
      });
  }

  completeSave(structureRes: Structure) {
    this.clonedStructure = this.createClonedStructure(structureRes);
    this.changedRoundNumber = undefined;
    this.processing = false;
    this.setAlert(IAlertType.Success, 'de wijzigingen zijn opgeslagen');
  }

  protected syncPlanning(structure: Structure, roundNumberToSync: number) {
    let changedRoundNumber = structure.getRoundNumber(roundNumberToSync);
    if (changedRoundNumber === undefined) {
      return this.completeSave(structure);
    }
    this.planningRepository.create(structure, this.tournament, roundNumberToSync)
      .subscribe({
        next: () => this.completeSave(structure),
        error: e => { this.setAlert(IAlertType.Danger, e); this.processing = false; },
        complete: () => this.processing = false
      });
  }

  navigateBack() {
    this.myNavigation.back();
  }
}
