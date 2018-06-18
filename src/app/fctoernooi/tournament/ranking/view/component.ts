import { Component, Input } from '@angular/core';
import { NgbPopover } from '@ng-bootstrap/ng-bootstrap/popover/popover';
import {
  Game,
  PoulePlace,
  QualifyRule,
  Ranking,
  RankingItem,
  Round,
  StructureNameService,
  StructureService,
} from 'ngx-sport';

import { Tournament } from '../../../tournament';

@Component({
  selector: 'app-tournament-ranking-view',
  templateUrl: './component.html',
  styleUrls: ['./component.scss']
})
export class TournamentRankingViewComponent {

  @Input() tournament: Tournament;
  @Input() structureService: StructureService;

  rankingService: Ranking;
  private rulesPopover: NgbPopover;

  constructor(public nameService: StructureNameService) {
    this.rankingService = new Ranking(Ranking.RULESSET_WC);
  }

  getRankingItems(): RankingItem[] {
    return this.getEndRankingItemsMain(this.structureService.getFirstRound());
  }

  protected getEndRankingItemsMain(round: Round, rankingItems: RankingItem[] = []): RankingItem[] {
    if (round === undefined) {
      return [];
    }
    this.getEndRankingItemsMain(round.getChildRound(Round.WINNERS), rankingItems);
    const deadPlaces = this.getDeadPlacesFromRound(round);
    deadPlaces.forEach(deadPlace => {
      rankingItems.push(new RankingItem(rankingItems.length + 1, deadPlace));
    });
    this.getEndRankingItemsMain(round.getChildRound(Round.LOSERS), rankingItems);
    return rankingItems;
  }

  protected getDeadPlacesFromRound(round: Round): PoulePlace[] {
    let deadPlaces: PoulePlace[] = [];
    // eerst alles met multiplie winners torule
    round.getToQualifyRules(Round.WINNERS).forEach(winnersToRule => {
      deadPlaces = deadPlaces.concat(this.getDeadPlacesFromRule(winnersToRule));
    });

    // daarna alles per number zonder torule
    const poulePlacesPerNumber = round.getPoulePlacesPerNumber(Round.WINNERS);
    poulePlacesPerNumber.forEach(poulePlaces => {
      const deadPlacesPerNumber = poulePlaces.filter(poulePlace => poulePlace.getToQualifyRules().length === 0);
      this.getDeadPlacesFromPlaceNumber(deadPlacesPerNumber, round).forEach(deadPoulePlace => {
        deadPlaces.push(deadPoulePlace);
      });
    });
    // daarna alles met multiplie losers torule
    round.getToQualifyRules(Round.LOSERS).forEach(losersToRule => {
      deadPlaces = deadPlaces.concat(this.getDeadPlacesFromRule(losersToRule));
    });
    return deadPlaces;
  }

  protected getDeadPlacesFromRule(toRule: QualifyRule): PoulePlace[] {
    if (toRule.isMultiple() === false) {
      return [];
    }
    let rankingItems: RankingItem[];
    if (toRule.getFromRound().getState() !== Game.STATE_PLAYED) {
      rankingItems = this.getUndeterminableItems(toRule.getFromPoulePlaces().length);
    } else {
      const nrQualifying = toRule.getToPoulePlaces().length;
      rankingItems = this.rankingService.getItems(toRule.getFromPoulePlaces(), toRule.getFromRound().getGames());
      for (let i = 0; i < nrQualifying; i++) {
        if (toRule.getWinnersOrLosers() === Round.WINNERS) {
          rankingItems.shift();
        } else {
          rankingItems.pop();
        }
      }
    }
    return rankingItems.map(rankingItem => rankingItem.getPoulePlace());
  }

  protected getDeadPlacesFromPlaceNumber(poulePlaces: PoulePlace[], round: Round): PoulePlace[] {
    let rankingItems: RankingItem[];
    if (round.getGames().length > 0 && round.getState() !== Game.STATE_PLAYED) {
      rankingItems = this.getUndeterminableItems(poulePlaces.length);
    } else {
      const poulePlacesToCompare: PoulePlace[] = [];
      poulePlaces.forEach(poulePlace => {
        rankingItems = this.rankingService.getItems(poulePlace.getPoule().getPlaces(), poulePlace.getPoule().getGames());
        const rankingItem = this.rankingService.getItem(rankingItems, poulePlace.getNumber());
        if (rankingItem.isSpecified()) {
          poulePlacesToCompare.push(rankingItem.getPoulePlace());
        }
      });
      rankingItems = this.rankingService.getItems(poulePlacesToCompare, round.getGames());
    }
    return rankingItems.map(rankingItem => rankingItem.getPoulePlace());
  }

  public getRankingItemName(rankingItem: RankingItem): string {
    if (rankingItem.isSpecified() === false || rankingItem.getPoulePlace().getTeam() === undefined) {
      return 'nog onbekend';
    }
    return this.nameService.getPoulePlaceName(rankingItem.getPoulePlace(), true);
  }

  showRulesPopover(popOver: NgbPopover) {
    if (this.rulesPopover === undefined) {
      this.rulesPopover = popOver;
    }
    this.rulesPopover.open();
  }

  hideRulesPopover() {
    if (this.rulesPopover !== undefined) {
      this.rulesPopover.close();
    }
  }

  // new RankingItem(rankingItems.length + 1, rankingItem.getPoulePlace()
  //  const nrOfDeadPlaces = round.getPoulePlaces().length - round.getNrOfPlacesChildRounds();
  // if (nrOfDeadPlaces > 0) {
  // laatste ronde heeft geen toqualifyrules, misschien handiger om door de fromqualifyrules te lopen
  // round.getToQualifyRules().forEach(rule => {
  // als de rule single is mag je per pouleplek iemand verwerken in de stand
  // als de rule multiple dan wachten op de hele ronde
  // const rankingService = new Ranking(Ranking.RULESSET_WC);
  // if (rule.isMultiple()) {
  //   if (rule.getFromRound().getState() === Game.STATE_PLAYED) {
  //       rankingService.getItemsForRound(round, rule.getFromPoulePlaces()).forEach(rankingItem => {
  //         rankingItems.push(new RankingItem(rankingItems.length + 1, rankingItem.getPoulePlace()));
  //       });
  //     } else {
  //       rankingItems = rankingItems.concat(this.getUndeterminableItems(rule.getToPoulePlaces().length));
  //     }
  //   } else {
  //     rule.getFromPoulePlaces().forEach(fromPoulePlace => {
  //       if (fromPoulePlace.getPoule().getState() === Game.STATE_PLAYED) {
  //         const poule = fromPoulePlace.getPoule();
  //         rankingService.getItems(poule.getPlaces(), poule.getGames()).forEach(rankingItem => {
  //           rankingItems.push(new RankingItem(rankingItems.length + 1, rankingItem.getPoulePlace()));
  //         });
  //       } else {
  //         rankingItems.push(new RankingItem(rankingItems.length + 1));
  //       }
  //     });
  //   }
  // });
  // controleer als er evenveel deadplaces zijn als

  protected getUndeterminableItems(numberOfItems: number): RankingItem[] {
    const rankingItems: RankingItem[] = [];
    const rankingNumbers = Array(numberOfItems).fill(0).map((e, i) => i + 1);
    rankingNumbers.forEach(rankingNumber => {
      rankingItems.push(new RankingItem(rankingItems.length + 1));
    });
    return rankingItems;
  }

  // getEndRankingItemsHelper(rule: QualifyRule): RankingItem[] {
  // let rankingItems: RankingItem[] = [];

  // const rankingService = new Ranking(Ranking.RULESSET_WC);
  // return rankingService.getItemsForRule(rule);

  // const poulePlacesToProcess: PoulePlace[] = [];
  // {
  //   const qualService = new QualifyService(round);
  //   const poulePlacesPer = qualService.getParentRoundPoulePlacesPer();
  //   poulePlacesPer.forEach(poulePlaces => {
  //     const rankingService = new Ranking(Ranking.RULESSET_WC);
  //     const winnerToQualifyRule = poulePlaces[0].getToQualifyRule(Round.WINNERS);
  //     if (winnerToQualifyRule === undefined) {
  //       rankingItems = rankingItems.concat(rankingService.getItemsForRound(round, poulePlaces));
  //       return;
  //     }
  //     if (winnerToQualifyRule.isMultiple() === false) {
  //       return;
  //     }
  //     // multiple
  //     const rankingItemsTmp = rankingService.getItemsForRound(round, poulePlaces);
  //     rankingItemsTmp.splice(0, winnerToQualifyRule.getToPoulePlaces().length);
  //     const loserToQualifyRule = poulePlaces[poulePlaces.length - 1].getToQualifyRule(Round.LOSERS);
  //     if (loserToQualifyRule === undefined) {
  //       rankingItems = rankingItems.concat(rankingItemsTmp);
  //     } else {
  //       rankingItemsTmp.forEach(rankingItemTmp => poulePlacesToProcess.push(rankingItemTmp.getPoulePlace()));
  //     }
  //   });
  // }



  // // check for LOSERS MULTIPLE
  // const poulePlacesPerNumberLosers = round.getPoulePlacesPerNumber(Round.LOSERS);
  // poulePlacesPerNumberLosers.forEach(poulePlaces => {
  //   const loserToQualifyRule = poulePlaces[0].getToQualifyRule(Round.LOSERS);
  //   if (loserToQualifyRule === undefined || loserToQualifyRule.isMultiple() === false) {
  //     return;
  //   }
  //   if (loserToQualifyRule.isMultiple() === false) {
  //     poulePlaces.forEach(poulePlace => {
  //       const index = poulePlacesToProcess.indexOf(poulePlace);
  //       if (index > -1) {
  //         poulePlacesToProcess.splice(index, 1);
  //       }
  //     });
  //   }
  //   // multiple
  //   const rankingService = new Ranking(Ranking.RULESSET_WC);
  //   const rankingItemsTmp = rankingService.getItemsForRound(round, poulePlaces);
  //   rankingItemsTmp.reverse();
  //   const qualifiedRankingItemsTmp = rankingItemsTmp.splice(0, loserToQualifyRule.getToPoulePlaces().length);
  //   qualifiedRankingItemsTmp.forEach(qualifiedRankingItemTmp => {
  //     const index = poulePlacesToProcess.indexOf(qualifiedRankingItemTmp.getPoulePlace());
  //     if (index > -1) {
  //       poulePlacesToProcess.splice(index, 1);
  //     }
  //   });
  //   rankingItemsTmp.forEach(rankingItemTmp => {
  //     if (poulePlacesToProcess.find(
  //       poulePlaceToProcess => poulePlaceToProcess === rankingItemTmp.getPoulePlace()
  //     ) === undefined
  //     ) {
  //       poulePlacesToProcess.push(rankingItemTmp.getPoulePlace());
  //     }
  //   });
  // });

  // const rankingServiceTmp = new Ranking(Ranking.RULESSET_WC);
  // return rankingItems.concat(rankingServiceTmp.getItemsForRound(round, poulePlacesToProcess));
  // }
}
