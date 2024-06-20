import { AfterViewChecked, Component, ElementRef, Input, OnInit, TemplateRef, ViewChild, input } from '@angular/core';
import { Router } from '@angular/router';

import { AuthService } from '../../../lib/auth/auth.service';
import { Role } from '../../../lib/role';
import { Tournament } from '../../../lib/tournament';
import { TournamentScreen } from '../screenNames';
import { CompetitorTab } from '../../common/tab-ids';
import { JsonTheme } from '../../../lib/tournament/theme';

@Component({
  selector: 'app-tournament-navbar',
  templateUrl: './tournamentNavBar.component.html',
  styleUrls: ['./tournamentNavBar.component.scss']
})
export class TournamentNavBarComponent implements AfterViewChecked {
  @Input() upperNavBar: TemplateRef<any> | undefined;  
  @Input() public: boolean = false;
  @Input() currentScreen!: TournamentScreen;
  @Input() roles!: Role[];
  public tournament = input.required<Tournament>();
  public theme = input.required<JsonTheme>();

  @ViewChild("navbar") private navbarRef: ElementRef<HTMLElement> | undefined;

  constructor(
    public authService: AuthService,
    private router: Router
  ) {

  }

  ngAfterViewChecked() {
    if (this.navbarRef) {
      this.navbarRef.nativeElement.style.setProperty('--nav-bg', this.theme().bgColor);
      this.navbarRef.nativeElement.style.setProperty('--nav-color', this.theme().textColor);   
    }
  }


  get StructureScreen(): TournamentScreen { return TournamentScreen.Structure }
  get HomeScreen(): TournamentScreen { return TournamentScreen.Home }
  get GamesScreen(): TournamentScreen { return TournamentScreen.Games }
  get RankingScreen(): TournamentScreen { return TournamentScreen.Ranking }
  get FavoritesScreen(): TournamentScreen { return TournamentScreen.Favorites }
  get CompetitorsScreen(): TournamentScreen { return TournamentScreen.Competitors }
  get SettingsScreen(): TournamentScreen { return TournamentScreen.Settings }
  get CompetitorTabBase(): CompetitorTab { return CompetitorTab.Base } 

  getBtnClass(screen: TournamentScreen): string {
    if (this.currentScreen === screen) {
      return this.getTextContrastColorClass();
    }
    return 'btn-navbar';
  }

  linkToStructure() {
    this.router.navigate(['/' + (this.public ? 'public' : 'admin') + '/structure', this.tournament().getId()]);
  }

  linkToLockerRooms() {
    this.router.navigate(['/' + (this.public ? 'public' : 'admin') + '/lockerrooms', this.tournament().getId()]);
  }

  linkToGames() {
    this.router.navigate(['/' + (this.public ? 'public' : 'admin') + '/games', this.tournament().getId()]);
  }

  hasRole(roles: number): boolean {
    const loggedInUserId = this.authService.getLoggedInUserId();
    const tournamentUser = loggedInUserId ? this.tournament().getUser(loggedInUserId) : undefined;
    return tournamentUser ? tournamentUser.hasARole(roles) : false;
  }
        
  getTextContrastColorClass(): ContrastColorClass {    
    const rgbColors = this.convertToRgbColors(this.theme().bgColor);
    if (((rgbColors.red * 0.299) + (rgbColors.green * 0.587) + (rgbColors.blue * 0.114)) > 186) {
      return ContrastColorClass.Black;
    }
    return ContrastColorClass.White;
  }

  // controleer als zeven karakters en 1ste # en per twee een hexadecimaal getal
  private convertToRgbColors(htmlColor: string): RgbColors {
    const hekje = htmlColor.substring(0, 1);
    if (htmlColor.length !== 7 || hekje !== '#') {
      throw Error('color incorrect format : ' + htmlColor);
    }
    return {
      red: +htmlColor.substring(1, 2),
      green: +htmlColor.substring(3, 2),
      blue: +htmlColor.substring(5, 2)
    }
  }

}

enum ContrastColorClass {
  Black = 'btn-text-black', White = 'btn-text-white'
}

interface RgbColors {
  red: number;
  green: number;
  blue: number;
}