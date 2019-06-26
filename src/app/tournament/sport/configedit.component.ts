import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import {
    JsonSport,
    Sport,
    Referee,
    RefereeRepository,
    StructureRepository,
} from 'ngx-sport';

import { MyNavigation } from '../../common/navigation';
import { TournamentRepository } from '../../lib/tournament/repository';
import { TournamentService } from '../../lib/tournament/service';
import { User } from '../../lib/user';
import { TournamentComponent } from '../component';

@Component({
    selector: 'app-tournament-sportconfig-edit',
    templateUrl: './configedit.component.html',
    styleUrls: ['./configedit.component.css']
})
export class SportConfigEditComponent extends TournamentComponent implements OnInit {
    customForm: FormGroup;
    sport: Sport;

    validations: SportValidations = {
        minlengthinitials: Referee.MIN_LENGTH_INITIALS,
        maxlengthinitials: Referee.MAX_LENGTH_INITIALS,
        maxlengthname: Referee.MAX_LENGTH_NAME,
        maxlengthinfo: Referee.MAX_LENGTH_INFO,
        minlengthemailaddress: User.MIN_LENGTH_EMAIL,
        maxlengthemailaddress: User.MAX_LENGTH_EMAIL,
    };

    constructor(
        /*private sportRepository: SportRepository,*/
        route: ActivatedRoute,
        router: Router,
        tournamentRepository: TournamentRepository,
        structureRepository: StructureRepository,
        private myNavigation: MyNavigation,
        fb: FormBuilder
    ) {
        // EditPermissions, EmailAddresses
        // andere groep moet dan zijn getEditPermission, wanneer ingelogd, bij gewone view
        super(route, router, tournamentRepository, structureRepository);
        this.customForm = fb.group({
            initials: ['', Validators.compose([
                Validators.required,
                Validators.minLength(this.validations.minlengthinitials),
                Validators.maxLength(this.validations.maxlengthinitials)
            ])],
            name: ['', Validators.compose([
                Validators.maxLength(this.validations.maxlengthname)
            ])],
            emailaddress: ['', Validators.compose([
                Validators.minLength(this.validations.minlengthemailaddress),
                Validators.maxLength(this.validations.maxlengthemailaddress)
            ])],
            info: ['', Validators.compose([
                Validators.maxLength(this.validations.maxlengthinfo)
            ])],
        });
    }

    // initialsValidator(control: FormControl): { [s: string]: boolean } {
    //     if (control.value.length < this.validations.minlengthinitials || control.value.length < this.validations.maxlengthinitials) {
    //         return { invalidInitials: true };
    //     }
    // }

    ngOnInit() {
        this.route.params.subscribe(params => {
            super.myNgOnInit(() => this.postInit(+params.sportId));
        });
    }

    private getSportById(id: number): Sport {
        if (id === undefined || id === 0) {
            this.processing = false;
            return;
        }
        return this.tournament.getCompetition().getSports().find(sportIt => id === sportIt.getId());
    }

    private postInit(id: number) {
        this.sport = this.getSportById(id);
        if (this.sport === undefined) {
            this.processing = false;
            return;
        }
        // this.customForm.controls.initials.setValue(this.referee.getInitials());
        // this.customForm.controls.name.setValue(this.referee.getName());
        // this.customForm.controls.emailaddress.setValue(this.referee.getEmailaddress());
        // this.customForm.controls.info.setValue(this.referee.getInfo());
        this.processing = false;
    }

    // save(): boolean {
    //     if (this.referee !== undefined) {
    //         this.edit();
    //     } else {
    //         this.add();
    //     }
    //     return false;
    // }

    // add() {
    //     this.processing = true;
    //     this.setAlert('info', 'de scheidsrechter wordt toegevoegd');
    //     const initials = this.customForm.controls.initials.value;
    //     const name = this.customForm.controls.name.value;
    //     const emailaddress = this.customForm.controls.emailaddress.value;
    //     const info = this.customForm.controls.info.value;

    //     if (this.isInitialsDuplicate(this.customForm.controls.initials.value)) {
    //         this.setAlert('danger', 'de initialen bestaan al voor dit toernooi');
    //         this.processing = false;
    //         return;
    //     }
    //     const ref: JsonReferee = {
    //         initials: initials,
    //         name: name ? name : undefined,
    //         emailaddress: emailaddress ? emailaddress : undefined,
    //         info: info ? info : undefined
    //     };
    //     this.refereeRepository.createObject(ref, this.tournament.getCompetition()).subscribe(
    //         /* happy path */ refereeRes => {
    //             const firstRoundNumber = this.structure.getFirstRoundNumber();
    //             const tournamentService = new TournamentService(this.tournament);
    //             tournamentService.reschedule(new PlanningService(this.tournament.getCompetition()), firstRoundNumber);
    //             this.planningRepository.editObject(firstRoundNumber).subscribe(
    //             /* happy path */ gamesRes => {
    //                     this.tournamentRepository.syncRefereeRoles(this.tournament).subscribe(
    //                     /* happy path */ allRolesRes => {
    //                             this.processing = false;
    //                             this.navigateBack();
    //                         },
    //                     /* error path */ e => { this.setAlert('danger', e); this.processing = false; },
    //                     /* onComplete */() => this.processing = false
    //                     );
    //                 },
    //             /* error path */ e => { this.setAlert('danger', e); this.processing = false; },
    //             );
    //         },
    //         /* error path */ e => { this.setAlert('danger', e); this.processing = false; },
    //     );
    // }

    // edit() {
    //     this.processing = true;
    //     this.setAlert('info', 'de scheidsrechter wordt gewijzigd');
    //     if (this.isInitialsDuplicate(this.customForm.controls.initials.value, this.referee)) {
    //         this.setAlert('danger', 'de initialen bestaan al voor dit toernooi');
    //         this.processing = false;
    //         return;
    //     }
    //     const initials = this.customForm.controls.initials.value;
    //     const name = this.customForm.controls.name.value;
    //     const emailaddress = this.customForm.controls.emailaddress.value;
    //     const info = this.customForm.controls.info.value;

    //     this.referee.setInitials(initials);
    //     this.referee.setName(name ? name : undefined);
    //     const emailaddressChanged = emailaddress !== this.referee.getEmailaddress();
    //     this.referee.setEmailaddress(emailaddress ? emailaddress : undefined);
    //     this.referee.setInfo(info ? info : undefined);
    //     this.refereeRepository.editObject(this.referee, this.tournament.getCompetition())
    //         .subscribe(
    //         /* happy path */ refereeRes => {
    //                 if (!emailaddressChanged) {
    //                     this.navigateBack();
    //                     return;
    //                 }
    //                 this.tournamentRepository.syncRefereeRoles(this.tournament).subscribe(
    //                     /* happy path */ allRolesRes => {
    //                         this.navigateBack();
    //                     },
    //                     /* error path */ e => { this.setAlert('danger', e); this.processing = false; },
    //                     /* onComplete */() => this.processing = false
    //                 );
    //             },
    //         /* error path */ e => { this.setAlert('danger', e); this.processing = false; },
    //         /* onComplete */() => { this.processing = false; }
    //         );
    // }

    // navigateBack() {
    //     this.myNavigation.back();
    // }

    // isInitialsDuplicate(initials: string, referee?: Referee): boolean {
    //     const referees = this.tournament.getCompetition().getReferees();
    //     return referees.find(refereeIt => {
    //         return (initials === refereeIt.getInitials() && (referee === undefined || refereeIt.getId() === undefined));
    //     }) !== undefined;
    // }
}

export interface SportValidations {
    minlengthinitials: number;
    maxlengthinitials: number;
    maxlengthname: number;
    maxlengthinfo: number;
    minlengthemailaddress: number;
    maxlengthemailaddress: number;
}
