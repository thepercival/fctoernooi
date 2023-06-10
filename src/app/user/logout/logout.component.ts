import { Component, OnInit } from '@angular/core';
import { NavigationExtras, Router } from '@angular/router';
import { AuthService } from '../../lib/auth/auth.service';
import { IAlertType } from '../../shared/common/alert';

@Component({
  selector: 'app-logout',
  templateUrl: './logout.component.html',
  styleUrls: ['./logout.component.css']
})
export class LogoutComponent implements OnInit {

  constructor(private router: Router, private authService: AuthService) { }

  ngOnInit() {
    // reset login status
    this.authService.logout();
    const navigationExtras: NavigationExtras = {
      queryParams: { type: IAlertType.Info, message: 'je bent uitgelogd' }
    };
    this.router.navigate([''], navigationExtras);
  }

}
