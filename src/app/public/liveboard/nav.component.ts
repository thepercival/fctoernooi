import { AfterContentInit, Component, ElementRef, OnInit, computed, effect, input, output } from '@angular/core';

import { Router } from '@angular/router';
import { LiveboardLink } from '../../lib/liveboard/link';
import { DefaultJsonTheme, JsonTheme } from '../../lib/tournament/theme';
import { AuthService } from '../../lib/auth/auth.service';
import { GlobalEventsManager } from '../../shared/common/eventmanager';
import { Tournament } from '../../lib/tournament';
import { ScreenConfig } from '../../lib/liveboard/screenConfig/json';
import { EndRankingScreen, PoulesRankingScreen, ResultsScreen, ScheduleScreen, SponsorScreen } from '../../lib/liveboard/screens';
import { MyNavigation } from '../../shared/common/navigation';

@Component({
  selector: 'app-liveboard-nav',
  templateUrl: './nav.component.html',
  styleUrls: ['./nav.component.scss']
})
export class LiveboardNavComponent implements OnInit, AfterContentInit {

  tournament = input.required<Tournament>();
  activeScreen = input.required<SponsorScreen | ResultsScreen | ScheduleScreen | EndRankingScreen | PoulesRankingScreen>();   
  showCategoryButton = input.required<boolean>();

  public atZero = output<void>();   
  public onCategoryButtonPressed = output<void>(); 
  public onScreenConfigsButtonPressed = output<void>(); 

  public nrOfSecondsFromZero2 = 0;
  
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
