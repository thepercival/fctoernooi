import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, NavigationExtras, Router } from '@angular/router';

import { IAlert, IAlertType } from '../../shared/common/alert';
import { User } from '../../lib/user';
import { UserRepository } from '../../lib/user/repository';
import { AuthService } from '../../lib/auth/auth.service';
import { MyNavigation } from '../../shared/common/navigation';

@Component({
  selector: 'app-validate',
  templateUrl: './validate.component.html',
  styleUrls: ['./validate.component.css']
})
export class ValidateComponent implements OnInit {
  alert: IAlert | undefined;
  processing = true;
  user!: User;
  code: string = '';
  sentValidationRequest: boolean = false;
  form: FormGroup;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private authService: AuthService,
    private userRepository: UserRepository,
    public myNavigation: MyNavigation,
    fb: FormBuilder
  ) {
    this.form = fb.group({
      code: ['', Validators.compose([
        Validators.required
      ])],
    });
  }

  ngOnInit() {

    const authUser = this.authService.getUser();
    if (authUser === undefined) {
      const navigationExtras: NavigationExtras = {
        queryParams: { type: IAlertType.Danger, message: 'je bent niet ingelogd' }
      };
      this.router.navigate([''], navigationExtras);
      return
    }
    this.user = authUser;

    this.route.params.subscribe(params => {
      if (params.code && params.code.length > 0) {
        this.code = params.code;
      }
    });

    this.userRepository.getObject(authUser.getId())
      .subscribe({
        next: (user: User) => {
          if (user.getValidated()) {
            const navigationExtras: NavigationExtras = {
              queryParams: { type: IAlertType.Success, message: 'je emailadres is gevalideerd' }
            };
            this.router.navigate([''], navigationExtras);
            return;
          }
          if (this.code.length > 0) {
            this.authService.validate(authUser, this.code)
              .subscribe({
                next: () => {
                  const navigationExtras: NavigationExtras = {
                    queryParams: { type: IAlertType.Success, message: 'je emailadres is gevalideerd' }
                  };
                  this.router.navigate([''], navigationExtras);
                  return;
                },
                error: (e) => { this.setAlert(IAlertType.Danger, e); this.processing = false; }
              });
          } else {
            this.processing = false;
          }
        },
        error: (e) => { this.setAlert(IAlertType.Danger, e); this.processing = false; }
      });
  }

  protected setAlert(type: IAlertType, message: string) {
    this.alert = { 'type': type, 'message': message };
  }

  protected resetAlert() {
    this.alert = undefined;
  }

  sendValidationRequest(): boolean {

    this.processing = true;
    this.authService.validationRequest()
      .subscribe({
        next: () => {
          this.sentValidationRequest = true;
        },
        error: (e) => {
          this.setAlert(IAlertType.Danger, 'het opslaan is niet gelukt: ' + e); this.processing = false;
        },
        complete: () => {
          this.processing = false
        }
      });
    return false;
  }
}