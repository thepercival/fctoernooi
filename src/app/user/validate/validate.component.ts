import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, NavigationExtras, Router } from '@angular/router';

import { IAlertType } from '../../shared/common/alert';
import { User } from '../../lib/user';
import { UserRepository } from '../../lib/user/repository';
import { AuthService } from '../../lib/auth/auth.service';
import { UserComponent } from '../component';
import { GlobalEventsManager } from '../../shared/common/eventmanager';

@Component({
  selector: 'app-validate',
  templateUrl: './validate.component.html',
  styleUrls: ['./validate.component.css']
})
export class ValidateComponent extends UserComponent implements OnInit {
  code: string = '';
  sentValidationRequest: boolean = false;
  public typedForm: FormGroup<{
    code: FormControl<string>
  }>;

  validations: any = {
    minlengthcode: 100000,
    maxlengthcode: 999999
  };

  constructor(
    route: ActivatedRoute,
    router: Router,
    userRepository: UserRepository,
    authService: AuthService,
    globalEventsManager: GlobalEventsManager
  ) {
    super(route, router, userRepository, authService, globalEventsManager);
    this.typedForm = new FormGroup(
      {
        code: new FormControl('', { nonNullable: true, validators: 
          [
              Validators.required,
              Validators.minLength(this.validations.minlengthcode),
              Validators.maxLength(this.validations.maxlengthcode)
          ] 
        })
      });

  }

  ngOnInit() {

    this.route.params.subscribe(params => {
      if (params.code && params.code.length > 0) {
        this.code = params.code;
      }
    });

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
          if (loggedInUser.getValidated()) {
            const navigationExtras: NavigationExtras = {
              queryParams: { type: IAlertType.Success, message: 'je emailadres is gevalideerd' }
            };
            this.router.navigate([''], navigationExtras);
            return;
          }
          if (this.code.length > 0) {
            this.authService.validate(this.code)
              .subscribe({
                next: () => {
                  const navigationExtras: NavigationExtras = {
                    queryParams: { type: IAlertType.Success, message: 'je emailadres is gevalideerd' }
                  };
                  this.router.navigate([''], navigationExtras);
                  return;
                },
                error: (e: string) => { this.setAlert(IAlertType.Danger, e); this.processing = false; }
              });
          } else {
            this.processing = false;
          }
        },
        error: (e: string) => { this.setAlert(IAlertType.Danger, e); this.processing = false; }
      });
  }

  sendValidationRequest(): boolean {

    this.processing = true;
    this.authService.validationRequest()
      .subscribe({
        next: () => {
          this.sentValidationRequest = true;
        },
        error: (e: string) => {
          this.setAlert(IAlertType.Danger, 'het opslaan is niet gelukt: ' + e); this.processing = false;
        },
        complete: () => {
          this.processing = false
        }
      });
    return false;
  }
}
