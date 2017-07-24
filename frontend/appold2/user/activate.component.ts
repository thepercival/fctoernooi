import { Component, OnInit, OnDestroy } from '@angular/core';
import {Subscription } from 'rxjs';
import { Router, ActivatedRoute, NavigationExtras } from '@angular/router';
import { UserService } from './service';
import { AuthenticationService } from '../auth/service';

@Component({
    moduleId: module.id,
    selector: 'activate',
    templateUrl: 'activate.component.html',
    styleUrls: [ 'activate.component.css' ]
})

export class ActivateComponent implements OnInit, OnDestroy{
    private subscription: Subscription;
    loading = false;
    error = '';


    constructor( private activatedRoute: ActivatedRoute, private router: Router, private userService : UserService, private authService : AuthenticationService ) { }

    ngOnInit() {

        this.authService.logout();
        // subscribe to router event, params or queryParams
        this.loading = true;
        this.subscription = this.activatedRoute.queryParams.subscribe(
            (param: any) => {
                let email = param['email'];
                let activationKey = param['activationkey'];

                this.authService.activate( email, activationKey )
                    .subscribe(
                        /* happy path */ retval => {
                            let navigationExtras: NavigationExtras = {
                                queryParams: { 'message': 'je account is geactiveerd, je kunt nu inloggen' }
                            };
                            this.router.navigate(['/login'], navigationExtras );
                            // console.log( 'gebruiker is geactiveerd' );
                            // console.log( retval );
                            // should redirect to loging with messagge
                        },
                        /* error path */ e => {
                            this.error = 'account is niet geactiveerd:' + e;
                        },
                        /* onComplete */ () => {}
                    );

            });
    }

    ngOnDestroy() {
        // prevent memory leak by unsubscribing
        this.subscription.unsubscribe();
    }



    activate() {

       // this.userService.create( user )
         //   .subscribe(
          //      /* happy path */ p => {
         //           this.authService.login( user.email, user.password)
        //                .subscribe(
     //                       /* happy path */ p => this.router.navigate(['/']),
     //                       /* error path */ e => { this.error = e; this.loading = false; },
     //                       /* onComplete */ () => this.loading = false
      //                  );
      //          },
     //           /* error path */ e => { this.error = e; this.loading = false; },
     //           /* onComplete */ () => this.loading = false
     //   );
    }
}