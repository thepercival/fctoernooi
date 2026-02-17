import { ENVIRONMENT_INITIALIZER, inject } from '@angular/core';
import { Routes } from '@angular/router';
import { FaIconLibrary } from '@fortawesome/angular-fontawesome';
import {
  faCheckCircle,
  faKey,
  faLevelUpAlt,
  faMoneyBillAlt,
  faSignInAlt,
  faSpinner,
  faUserCircle,
} from '@fortawesome/free-solid-svg-icons';

import { AuthguardService } from '../lib/auth/authguard.service';
import { BuyCreditsComponent } from './buycredits/buycredits.component';
import { LoginComponent } from './login/login.component';
import { LogoutComponent } from './logout/logout.component';
import { PasswordchangeComponent } from './passwordchange/passwordchange.component';
import { PasswordresetComponent } from './passwordreset/passwordreset.component';
import { PaymentResultComponent } from './paymentresult/paymentresult.component';
import { ProfileComponent } from './profile/profile.component';
import { RegisterComponent } from './register/register.component';
import { ValidateComponent } from './validate/validate.component';

const provideUserIcons = () => ({
  provide: ENVIRONMENT_INITIALIZER,
  multi: true,
  useFactory: () => {
    const library = inject(FaIconLibrary);
    return () => {
      library.addIcons(
        faSpinner,
        faUserCircle,
        faSignInAlt,
        faLevelUpAlt,
        faKey,
        faMoneyBillAlt,
        faCheckCircle
      );
    };
  },
});

export const USER_ROUTES: Routes = [
  {
    path: '',
    providers: [provideUserIcons()],
    children: [
      { path: 'register', component: RegisterComponent },
      { path: 'login', component: LoginComponent },
      { path: 'passwordreset', component: PasswordresetComponent },
      { path: 'passwordchange', component: PasswordchangeComponent },
      { path: 'logout', component: LogoutComponent },
      { path: 'profile', component: ProfileComponent, canActivate: [AuthguardService] },
      { path: 'validate/:code', component: ValidateComponent, canActivate: [AuthguardService] },
      { path: 'validate', component: ValidateComponent, canActivate: [AuthguardService] },
      { path: 'buycredits', component: BuyCreditsComponent, canActivate: [AuthguardService] },
      { path: 'paymentresult/:paymentId', component: PaymentResultComponent, canActivate: [AuthguardService] },
    ],
  },
];
