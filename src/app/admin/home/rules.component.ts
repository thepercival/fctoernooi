import { Component, OnInit, TemplateRef } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

import { IAlert, IAlertType } from '../../shared/common/alert';
import { RefereeRepository } from '../../lib/ngx-sport/referee/repository';
import { TournamentRepository } from '../../lib/tournament/repository';
import { StructureRepository } from '../../lib/ngx-sport/structure/repository';
import { TournamentComponent } from '../../shared/tournament/component';
import { NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { InfoModalComponent } from '../../shared/tournament/infomodal/infomodal.component';
import { GlobalEventsManager } from '../../shared/common/eventmanager';
import { FavoritesRepository } from '../../lib/favorites/repository';
import { TournamentRuleRepository } from '../../lib/tournament/rule/repository';
import { JsonTournamentRule } from '../../lib/tournament/rule/json';
import { NameModalComponent } from '../../shared/tournament/namemodal/namemodal.component';

@Component({
  selector: 'app-tournament-rules',
  templateUrl: './rules.component.html',
  styleUrls: ['./rules.component.scss']
})
export class TournamentRulesComponent extends TournamentComponent implements OnInit {
  public rules!: JsonTournamentRule[];
  
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
    modalService: NgbModal,
    favRepository: FavoritesRepository,
    private ruleRepository: TournamentRuleRepository
  ) {
    super(route, router, tournamentRepository, sructureRepository, globalEventsManager, modalService, favRepository);
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
          this.processing = false;
        },
        error: (e) => {
          this.setAlert(IAlertType.Danger, e); this.processing = false;
        }
      });
    
    this.processing = false;
  }

  addRule() {
    const modal = this.getTextModal(false);
    modal.result.then((text: string) => {
      this.processing = true;
      this.resetAlert();
      this.ruleRepository.createObject(text, this.tournament)
        .subscribe({
          next: (newRule: JsonTournamentRule) => {
            this.rules.push(newRule);
            this.processing = false;
            this.alert = undefined;
          },
          error: (e) => {
            this.setAlert(IAlertType.Danger, e); this.processing = false;
          }
        });
    }, (reason) => { });
  }

  editRule(rule: JsonTournamentRule) {
    this.processing = true;
    const modal = this.getTextModal(true);
    const initialText = rule.text;    
    modal.componentInstance.initialName = rule.text;
    modal.result.then((text: string) => {
      rule.text = text;
      this.ruleRepository.editObject(rule, this.tournament)
        .subscribe({
          next: (updatedRule: JsonTournamentRule) => {
            this.alert = undefined;
            this.processing = false;
          },
          error: (e) => {
            this.setAlert(IAlertType.Danger, e); 
            rule.text = initialText
            this.processing = false;
          }
        });
    }, (reason) => { });
  }

  getRule(priority: number): JsonTournamentRule|undefined {
    return this.rules.find((rule: JsonTournamentRule) => rule.priority === priority)
  }


  getTextModal(edit: boolean): NgbModalRef {
    const activeModal = this.modalService.open(NameModalComponent);
    activeModal.componentInstance.header = 'regel omschrijving';
    activeModal.componentInstance.range = { min: this.validations.minlengthdescription, max: this.validations.maxlengthdescription };
    activeModal.componentInstance.buttonName = edit ? 'wijzigen' : 'maken';
    activeModal.componentInstance.labelName = 'omschrijving';
    activeModal.componentInstance.buttonOutline = false;
    return activeModal;
  }

  upgradePriority(ruleToUpgrade: JsonTournamentRule) {
    this.processing = true;
    const ruleToDowngrade: JsonTournamentRule | undefined = this.getRule(ruleToUpgrade.priority - 1);
    this.ruleRepository.upgradeObject(ruleToUpgrade, ruleToDowngrade, this.tournament)
      .subscribe({
        next: () => {
          this.rules.sort((ruleA, ruleB) => ruleA.priority - ruleB.priority);
          this.processing = false;
        },
        error: (e: string) => {
          this.setAlert(IAlertType.Danger, e); this.processing = false;
        }
      });
  }

  removeRule(rule: JsonTournamentRule) {
    this.processing = true;
    this.resetAlert();
    this.ruleRepository.removeObject(rule, this.tournament)
      .subscribe({
        next: () => {
          this.removeFromList(rule);
          this.processing = false;
        },
        error: (e) => {
          this.setAlert(IAlertType.Danger, e); this.processing = false;
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