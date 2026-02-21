import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, NavigationExtras, Router, RouterModule } from '@angular/router';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { NgbAlert } from '@ng-bootstrap/ng-bootstrap';

import { IAlertType } from '../../shared/common/alert';
import { User } from '../../lib/user';
import { UserRepository } from '../../lib/user/repository';
import { AuthService } from '../../lib/auth/auth.service';
import { MyNavigation } from '../../shared/common/navigation';
import { JsonUser } from '../../lib/user/mapper';
import { UserComponent } from '../component';
import { GlobalEventsManager } from '../../shared/common/eventmanager';

@Component({
    selector: 'app-profile',
    templateUrl: './profile.component.html',
    styleUrls: ['./profile.component.css'],
    standalone: true,
  imports: [FontAwesomeModule, NgbAlert, ReactiveFormsModule, RouterModule],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ProfileComponent extends UserComponent implements OnInit {
  public typedForm: FormGroup<{
    emailaddress: FormControl<string>
  }>;

  validations: UserValidations = {
    minlengthemailaddress: User.MIN_LENGTH_EMAIL,
    maxlengthemailaddress: User.MAX_LENGTH_EMAIL
  };

  constructor(
    route: ActivatedRoute,
    router: Router,
    userRepository: UserRepository,
    authService: AuthService,
    public myNavigation: MyNavigation,
    globalEventsManager: GlobalEventsManager
  ) {
    super(route, router, userRepository, authService, globalEventsManager);
    this.typedForm = new FormGroup({
      emailaddress: new FormControl('', { nonNullable: true, validators: 
        [
            Validators.required,
            Validators.minLength(this.validations.minlengthemailaddress),
            Validators.maxLength(this.validations.maxlengthemailaddress)
        ]         
      }),
    });
  }

  ngOnInit() {
    this.userRepository.getLoggedInObject()
      .subscribe({
        next: (loggedInUser: User | undefined) => {
          if (loggedInUser === undefined) {
            const navigationExtras: NavigationExtras = {
              queryParams: { type: IAlertType.Danger, message: 'je bent niet ingelogd' }
            };
            this.router.navigate([''], navigationExtras);
            return;
          }
          this.user = loggedInUser;
          this.typedForm.controls.emailaddress.setValue(this.user.getEmailaddress());
        },
        error: (e: string) => {
          this.setAlert(IAlertType.Danger, e); this.processing.set(false);
        },
        complete: () => this.processing.set(false)
      });
  }

  protected formToJson(user: User): JsonUser {
    return {
      id: user.getId(),
      validated: user.getValidated(),
      nrOfCredits: user.getNrOfCredits(),
      validateIn: user.getValidateIn(),
      emailaddress: this.typedForm.controls.emailaddress.value
    }
  }

  save(user: User): boolean {
    this.processing.set(true);


    this.userRepository.editObject(this.formToJson(user))
      .subscribe({
        next: (user: User) => {
          this.setAlert(IAlertType.Success, 'het emailadres is opgeslagen');
          this.typedForm.controls.emailaddress.setValue(user.getEmailaddress());
        },
        error: (e: string) => {
          this.setAlert(IAlertType.Danger, 'het opslaan is niet gelukt: ' + e); this.processing.set(false);
        },
        complete: () => {
          this.processing.set(false)
        }
      });
    return false;
  }

  remove(user: User) {
    this.processing.set(true);
    this.userRepository.removeObject(user.getId())
      .subscribe({
        next: () => {
          this.authService.logout();
          this.router.navigate(['']);
        },
        error: (e: string) => {
          this.setAlert(IAlertType.Danger, 'het opslaan is niet gelukt: ' + e); this.processing.set(false);
        },
        complete: () => this.processing.set(false)
      });
  }
}

export interface UserValidations {
  minlengthemailaddress: number;
  maxlengthemailaddress: number;
}
