import { AfterContentInit, Component, ElementRef, OnInit, input } from '@angular/core';

import { AuthService } from '../../../lib/auth/auth.service';
import { GlobalEventsManager } from '../../../shared/common/eventmanager';
import { LiveboardLink } from '../../../lib/liveboard/link';
import { Router } from '@angular/router';
import { DefaultJsonTheme, JsonTheme } from '../../../lib/tournament/theme';

@Component({
  selector: 'app-nav',
  templateUrl: './nav.component.html',
  styleUrls: ['./nav.component.scss']
})
export class NavComponent implements OnInit, AfterContentInit {

  public defaultTitle: string = 'FCToernooi';
  private colorMode: ColorMode;
  public navBarData: NavBarData = {
    title: this.defaultTitle,
    theme: DefaultJsonTheme,
    atHome: true
  }
  tournamentLiveboardLink: LiveboardLink = {};
  navbarCollapsed = true;

  constructor(
    private elRef: ElementRef,
    private router: Router,
    public authService: AuthService,
    private globalEventsManager: GlobalEventsManager
  ) {
    let colorMode = <ColorMode>localStorage.getItem('colorMode');
    if (colorMode === null) {
      colorMode = ColorMode.Light
      if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
        colorMode = ColorMode.Dark
      }      
    }
    this.colorMode = colorMode;    
    this.setAndApplyColorMode(colorMode);
  }

  ngOnInit() {
    this.globalEventsManager.toggleLiveboardIconInNavBar.subscribe((tournamentLiveboardLink: LiveboardLink) => {
      this.tournamentLiveboardLink = tournamentLiveboardLink;
    });
    this.globalEventsManager.updateDataInNavBar.subscribe((navBarData: NavBarData) => {
      this.navBarData = navBarData;
      this.updateCustomProperty();
    });
    this.updateCustomProperty();
  }

  ngAfterContentInit() {
    // update this here, or later in the component
    this.updateCustomProperty();
  }

  updateCustomProperty() {
    const theme = this.navBarData.theme;
    if (theme !== undefined) {
      // console.log('--nav-bg', theme.bgColor);
      // console.log('--nav-color', theme.textColor)
      this.elRef.nativeElement.style.setProperty('--nav-bg', theme.bgColor);
      this.elRef.nativeElement.style.setProperty('--nav-color', theme.textColor);
    }
  }

  execLeftButton(atHome: boolean) {
    if (!atHome) {
      this.linkToHome();
    } else {
      let colorMode = this.colorMode === ColorMode.Light ? ColorMode.Dark : ColorMode.Light;
      this.setAndApplyColorMode(colorMode);
    }
  }

  linkToHome(){
    this.globalEventsManager.updateDataInNavBar.emit({
      title: this.defaultTitle,
      atHome: true,
      theme: DefaultJsonTheme
    });
    this.router.navigate(['/']);
  }

  setAndApplyColorMode(colorMode: ColorMode) {
    this.colorMode = colorMode;    
    localStorage.setItem('colorMode', colorMode);
    document.body.setAttribute('data-bs-theme', this.colorMode);
  }
}

export interface NavBarData {
  title: string;
  atHome: boolean;
  theme: JsonTheme;
}

export enum ColorMode {
  Light = 'light', Dark = 'dark'
}