import { Component, Input, OnInit } from '@angular/core';

import { AuthService } from '../../../lib/auth/auth.service';
import { GlobalEventsManager } from '../../../shared/common/eventmanager';
import { LiveboardLink } from '../../../lib/liveboard/link';
import { IconName, IconPrefix } from '@fortawesome/fontawesome-svg-core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-nav',
  templateUrl: './nav.component.html',
  styleUrls: ['./nav.component.scss']
})
export class NavComponent {

  public defaultTitle: string = 'FCToernooi';
  private colorMode: ColorMode;
  @Input() data: NavBarData = this.getDefaultNavBarData();
  navbarCollapsed = true;
  tournamentLiveboardLink: LiveboardLink = {};

  constructor(
    private router: Router,
    public authService: AuthService,
    private globalEventsManager: GlobalEventsManager
  ) {
    this.globalEventsManager.toggleLiveboardIconInNavBar.subscribe((tournamentLiveboardLink: LiveboardLink) => {
      this.tournamentLiveboardLink = tournamentLiveboardLink;
    });
    this.globalEventsManager.updateDataInNavBar.subscribe((data: NavBarData) => {
      this.data = data;
    });
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

  execLeftButton(home: boolean) {
    if (!home) {
      this.linkToHome();
    } else {
      let colorMode = this.colorMode === ColorMode.Light ? ColorMode.Dark : ColorMode.Light;
      this.setAndApplyColorMode(colorMode);
    }
  }

  linkToHome(){
    this.globalEventsManager.updateDataInNavBar.emit(this.getDefaultNavBarData());
    this.router.navigate(['/']);
  }

  setAndApplyColorMode(colorMode: ColorMode) {
    this.colorMode = colorMode;    
    localStorage.setItem('colorMode', colorMode);
    document.body.setAttribute('data-bs-theme', this.colorMode);
  }

  getDefaultNavBarData(): NavBarData {
    return { title: this.defaultTitle, home: true };
  }
}

export interface NavBarData {
  title: string;
  home: boolean;
}

export enum ColorMode {
  Light = 'light', Dark = 'dark'
}