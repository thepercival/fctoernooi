import { Component, OnInit, Input } from '@angular/core';
import { AuthService } from '../auth/auth.service';

@Component({
  selector: 'app-nav',
  templateUrl: './nav.component.html',
  styleUrls: ['./nav.component.css']
})
export class NavComponent implements OnInit {

  @Input()
  title: string;
  // showCompetitionSeasonDetails: boolean = false;

  constructor(
      private authService: AuthService/*,
      private globalEventsManager: GlobalEventsManager*/
  )
  {
    // this.globalEventsManager.showCompetitionSeasonDetailsInNavBar.subscribe((mode)=>{
    //   this.showCompetitionSeasonDetails = mode;
    //   console.log('in navbar show is ' + mode );
    // });
  }

  ngOnInit() {
  }

}
