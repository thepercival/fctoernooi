import { AfterContentInit, Component, ElementRef, OnInit, input, output } from '@angular/core';

import { Router } from '@angular/router';
import { DefaultJsonTheme } from '../../lib/tournament/theme';
import { Tournament } from '../../lib/tournament';
import { EndRankingScreen, PoulesRankingScreen, ResultsScreen, ScheduleScreen, SponsorScreen } from '../../lib/liveboard/screens';
import { CompetitionSport } from 'ngx-sport';
import { MyNavigation } from '../../shared/common/navigation';
import { EscapeHtmlPipe } from '../../shared/common/escapehtmlpipe';
import { ProgressComponent } from './progress.component';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { IconDefinition } from '@fortawesome/fontawesome-svg-core';
import { faCogs, faGrip, faLevelUpAlt } from '@fortawesome/free-solid-svg-icons';
import { getSportIconDef } from '../../shared/tournament/sport/icon.mapper';
import { CustomSportId } from '../../lib/ngx-sport/sport/custom';

@Component({
    selector: 'app-liveboard-nav',
    templateUrl: './nav.component.html',
    styleUrls: ['./nav.component.scss'],
  imports: [EscapeHtmlPipe, ProgressComponent, FontAwesomeModule]
    
})
export class LiveboardNavComponent implements OnInit, AfterContentInit {

  tournament = input.required<Tournament>();
  activeScreen = input.required<SponsorScreen | ResultsScreen | ScheduleScreen | EndRankingScreen | PoulesRankingScreen>();   
  showCategoryButton = input.required<boolean>();

  public atZero = output<void>();   
  public onCategoryButtonPressed = output<void>(); 
  public onScreenConfigsButtonPressed = output<void>(); 

  public nrOfSecondsFromZero2 = 0;
  public faCogs = faCogs;
  public faGrip = faGrip;
  public faLevelUpAlt = faLevelUpAlt;
  
  constructor(
    private elRef: ElementRef,
    private router: Router,
    private myNavigation: MyNavigation
  ) {
  }

  ngOnInit() {
    this.updateCustomProperty();
  }

  ngAfterContentInit() {
    // update this here, or later in the component
    this.updateCustomProperty();
  }

  getOrigin(): string {
    return location.origin;
  }

  countingDown(nrOfSecondsFromZero: number) {
    this.nrOfSecondsFromZero2 = nrOfSecondsFromZero;
    if (nrOfSecondsFromZero === 0 ) {
      this.atZero.emit();
    }
  }
  

  updateCustomProperty() {
    const theme = this.tournament().getTheme() ?? DefaultJsonTheme;
    if (theme !== undefined) {
      this.elRef.nativeElement.style.setProperty('--nav-bg', theme.bgColor);
      this.elRef.nativeElement.style.setProperty('--nav-color', theme.textColor);
    }
  }

  navigateBack() {
    this.router.navigateByUrl(this.myNavigation.getPreviousUrl(''));
  }

  getSportIconByCompetitionSports(competitionSports: CompetitionSport[]): IconDefinition | undefined {
    const competitionSport = competitionSports.length === 1 ? competitionSports[0] : undefined;
    const customId = competitionSport?.getSport().getCustomId();
    return customId === undefined ? undefined : getSportIconDef(customId as CustomSportId);
  }

  // execLeftButton(atHome: boolean) {
  //   if (!atHome) {
  //     this.linkToHome();
  //   } else {
  //     let colorMode = this.colorMode === ColorMode.Light ? ColorMode.Dark : ColorMode.Light;
  //     this.setAndApplyColorMode(colorMode);
  //   }
  // }

  // linkToHome(){
  //   this.globalEventsManager.updateDataInNavBar.emit({
  //     title: this.defaultTitle,
  //     atHome: true,
  //     theme: DefaultJsonTheme
  //   });
  //   this.router.navigate(['/']);
  // }

}
