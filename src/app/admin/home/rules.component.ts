import { Component, inject, Injector, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

import { IAlertType } from '../../shared/common/alert';
import { TournamentRepository } from '../../lib/tournament/repository';
import { StructureRepository } from '../../lib/ngx-sport/structure/repository';
import { TournamentComponent } from '../../shared/tournament/component';
import { NgbModalRef, NgbAlert } from '@ng-bootstrap/ng-bootstrap';
import { GlobalEventsManager } from '../../shared/common/eventmanager';
import { TournamentRuleRepository } from '../../lib/tournament/rule/repository';
import { JsonTournamentRule } from '../../lib/tournament/rule/json';
import { NAME_MODAL_DATA, NameModalComponent } from '../../shared/tournament/namemodal/namemodal.component';
import { TournamentNavBarComponent } from "../../shared/tournament/tournamentNavBar/tournamentNavBar.component";
import { FaIconComponent } from "@fortawesome/angular-fontawesome";
import { faSpinner } from '@fortawesome/free-solid-svg-icons';

@Component({
    selector: 'app-tournament-rules',
    templateUrl: './rules.component.html',
    styleUrls: ['./rules.component.scss'],
    imports: [TournamentNavBarComponent, FaIconComponent, NgbAlert],
    
})
export class TournamentRulesComponent extends TournamentComponent implements OnInit {
  faSpinner = faSpinner;
  public rules!: JsonTournamentRule[];
  private injector = inject(Injector);
  
  validations: any = {
    'minlengthdescription': TournamentRuleRepository.MIN_LENGTH_DESCRIPTION,
    'maxlengthdescription': TournamentRuleRepository.MAX_LENGTH_DESCRIPTION
  };

  constructor(
    route: ActivatedRoute,
    router: Router,
    tournamentRepository: TournamentRepository,
    sructureRepository: StructureRepository,
    globalEventsManager: GlobalEventsManager,    
    private ruleRepository: TournamentRuleRepository
  ) {
    super(route, router, tournamentRepository, sructureRepository, globalEventsManager);
  }

  ngOnInit() {
    super.myNgOnInit(() => this.initRules());
  }

  
  get MaxPerTournament(): number { return TournamentRuleRepository.MAX_PER_TOURNAMENT };

  initRules() {
    
    this.ruleRepository.getObjects(this.tournament)
      .subscribe({
        next: (rules: JsonTournamentRule[]) => {
          this.rules = rules;
          this.processing.set(false);
        },
        error: (e) => {
          this.alert.set({ type: IAlertType.Danger, message: e }); this.processing.set(false);
        }
      });
    
    this.processing.set(false);
  }

  addRule() {
    const modal = this.getTextModal(false);
    modal.result.then((text: string) => {
      this.processing.set(true);
      this.alert.set(undefined);
      this.ruleRepository.createObject(text, this.tournament)
        .subscribe({
          next: (newRule: JsonTournamentRule) => {
            this.rules.push(newRule);
            this.processing.set(false);
            this.alert.set(undefined);
          },
          error: (e) => {
            this.alert.set({ type: IAlertType.Danger, message: e }); this.processing.set(false);
          }
        });
    }, (reason) => { });
  }

  editRule(rule: JsonTournamentRule) {
    this.processing.set(true);
    const modal = this.getTextModal(true, rule.text);
    const initialText = rule.text;    
    modal.result.then((text: string) => {
      rule.text = text;
      this.ruleRepository.editObject(rule, this.tournament)
        .subscribe({
          next: (updatedRule: JsonTournamentRule) => {
            this.alert.set(undefined);
            this.processing.set(false);
          },
          error: (e) => {
            this.alert.set({ type: IAlertType.Danger, message: e }); 
            rule.text = initialText
            this.processing.set(false);
          }
        });
    }, (reason) => { });
  }

  getRule(priority: number): JsonTournamentRule|undefined {
    return this.rules.find((rule: JsonTournamentRule) => rule.priority === priority)
  }


  getTextModal(edit: boolean, initialName: string = ''): NgbModalRef {
    return this.modalService.open(NameModalComponent, {
      injector: Injector.create({
        providers: [{
          provide: NAME_MODAL_DATA,
          useValue: {
            header: 'regel omschrijving',
            range: { min: this.validations.minlengthdescription, max: this.validations.maxlengthdescription },
            buttonName: edit ? 'wijzigen' : 'maken',
            labelName: 'omschrijving',
            buttonOutline: false,
            initialName
          }
        }],
        parent: this.injector
      })
    });
  }

  upgradePriority(ruleToUpgrade: JsonTournamentRule) {
    this.processing.set(true);
    const ruleToDowngrade: JsonTournamentRule | undefined = this.getRule(ruleToUpgrade.priority - 1);
    this.ruleRepository.upgradeObject(ruleToUpgrade, ruleToDowngrade, this.tournament)
      .subscribe({
        next: () => {
          this.rules.sort((ruleA, ruleB) => ruleA.priority - ruleB.priority);
          this.processing.set(false);
        },
        error: (e: string) => {
          this.alert.set({ type: IAlertType.Danger, message: e }); this.processing.set(false);
        }
      });
  }

  removeRule(rule: JsonTournamentRule) {
    this.processing.set(true);
    this.alert.set(undefined);
    this.ruleRepository.removeObject(rule, this.tournament)
      .subscribe({
        next: () => {
          this.removeFromList(rule);
          this.processing.set(false);
        },
        error: (e) => {
          this.alert.set({ type: IAlertType.Danger, message: e }); this.processing.set(false);
        }
      });
  }

  removeFromList(rule: JsonTournamentRule) {
    const idx = this.rules.indexOf(rule);
    if (idx >= 0) {
      this.rules.splice(idx, 1);
    }
  }

  linkToHome() {
    this.router.navigate(['/admin/homeedit', this.tournament.getId()]);
  }
}