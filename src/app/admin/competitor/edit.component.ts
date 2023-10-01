import { Component, OnInit, TemplateRef } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import {
    Competitor,
    NameService,
    StartLocation,
    StartLocationMap,
    StructureNameService,
} from 'ngx-sport';

import { MyNavigation } from '../../shared/common/navigation';
import { TournamentRepository } from '../../lib/tournament/repository';
import { CompetitorRepository } from '../../lib/ngx-sport/competitor/repository';
import { TournamentComponent } from '../../shared/tournament/component';
import { StructureRepository } from '../../lib/ngx-sport/structure/repository';
import { TournamentCompetitor } from '../../lib/competitor';
import { IAlertType } from '../../shared/common/alert';
import { GlobalEventsManager } from '../../shared/common/eventmanager';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { FavoritesRepository } from '../../lib/favorites/repository';
import { InfoModalComponent } from '../../shared/tournament/infomodal/infomodal.component';
import { JsonTournamentCompetitor } from '../../lib/competitor/json';
import { NameValidator } from '../../lib/nameValidator';
import { TournamentRegistration } from '../../lib/tournament/registration';
import { User } from '../../lib/user';
import { Observable, of } from 'rxjs';
import { Tournament } from '../../lib/tournament';
import { LogoInput } from '../sponsor/edit.component';

@Component({
    selector: 'app-tournament-competitor-edit',
    templateUrl: './edit.component.html',
    styleUrls: ['./edit.component.scss']
})
export class CompetitorEditComponent extends TournamentComponent implements OnInit {
    public typedForm: FormGroup<{
        name: FormControl<string>,
        emailaddress: FormControl<string | null>,
        telephone: FormControl<string | null>, 
        registered: FormControl<boolean>,
        logoExtension: FormControl<string | null>,
        logoFileStream: FormControl<Blob | null>,
        info: FormControl<string|null>,
      }>;
    originalCompetitor: TournamentCompetitor | undefined;
    hasBegun!: boolean;
    public nameService: NameService;
    public structureNameService!: StructureNameService;
    
    public logoInputType: LogoInput | undefined;
    public newLogoUploaded: boolean;
    public base64Logo!: string | ArrayBuffer | null;

    startLocation!: StartLocation;
    placeNr!: number;

    validations: CompetitorValidations = {
        minlengthname: TournamentCompetitor.MIN_LENGTH_NAME,
        maxlengthname: TournamentCompetitor.MAX_LENGTH_NAME,
        minlengthemailaddress: User.MIN_LENGTH_EMAIL,
        maxlengthemailaddress: User.MAX_LENGTH_EMAIL,
        minlengthtelephone: TournamentCompetitor.MIN_LENGTH_TELEPHONE,
        maxlengthtelephone: TournamentCompetitor.MAX_LENGTH_TELEPHONE,
        maxlengthinfo: TournamentCompetitor.MAX_LENGTH_INFO,
        maxlengthurl: TournamentCompetitor.MAX_LENGTH_IMAGEURL
    };

    constructor(
        route: ActivatedRoute,
        router: Router,
        tournamentRepository: TournamentRepository,
        structureRepository: StructureRepository,
        globalEventsManager: GlobalEventsManager,
        modalService: NgbModal,
        favRepository: FavoritesRepository,
        private competitorRepository: CompetitorRepository,
        private myNavigation: MyNavigation,
        private nameValidator: NameValidator
    ) {
        super(route, router, tournamentRepository, structureRepository, globalEventsManager, modalService, favRepository);
        this.logoInputType = LogoInput.ByUpload;
        this.newLogoUploaded = false;
        this.typedForm = new FormGroup({
            name: new FormControl('', { nonNullable: true, validators: 
                [
                    Validators.required,
                    Validators.minLength(this.validations.minlengthname),
                    Validators.maxLength(this.validations.maxlengthname)
                ] 
            }),
            emailaddress: new FormControl('', {
                validators:
                    [
                        Validators.minLength(this.validations.minlengthemailaddress),
                        Validators.maxLength(this.validations.maxlengthemailaddress)
                    ]
            }),
            telephone: new FormControl('', {
                validators:
                    [
                        Validators.minLength(this.validations.minlengthtelephone),
                        Validators.maxLength(this.validations.maxlengthtelephone)
                    ]
            }),
            registered: new FormControl(false, { nonNullable: true }),
            logoExtension: new FormControl('', {
                validators:
                    [
                        Validators.maxLength(this.validations.maxlengthurl)
                    ]
            }),
            logoFileStream: new FormControl(),
            info: new FormControl('', { nonNullable: false , validators: 
                [Validators.maxLength(this.validations.maxlengthinfo)] 
            }),            
          });
        this.nameService = new NameService();
    }

    // initialsValidator(control: FormControl): { [s: string]: boolean } {
    //     if (control.value.length < this.validations.minlengthinitials || control.value.length < this.validations.maxlengthinitials) {
    //         return { invalidInitials: true };
    //     }
    // }

    ngOnInit() {
        this.route.params.subscribe(params => {
            super.myNgOnInit(() => this.postInit(+params.categoryNr, +params.pouleNr, +params.placeNr));
        });
    }

    private postInit(categoryNr: number, pouleNr: number, placeNr: number) {
        if (categoryNr < 1 || placeNr < 1 || pouleNr < 1) {
            this.setAlert(IAlertType.Danger, 'de startplek kan niet gevonden worden');
            return;
        }
        this.startLocation = new StartLocation(categoryNr, pouleNr, placeNr);
        // console.log(this.startLocation);
        this.hasBegun = this.structure.getFirstRoundNumber().hasBegun();
        const startLocationMap = new StartLocationMap(this.tournament.getCompetitors());
        this.structureNameService = new StructureNameService(startLocationMap);

        const competitor = <TournamentCompetitor | undefined>startLocationMap.getCompetitor(this.startLocation);
        this.reloadCompetitor(competitor)
            .subscribe({
                next: (competitor: TournamentCompetitor|undefined) => {
                    this.originalCompetitor = competitor;
                    this.typedForm.controls.name.setValue(this.originalCompetitor?.getName() ?? '');
                    this.typedForm.controls.emailaddress.setValue(this.originalCompetitor?.getEmailaddress() ?? '');
                    this.typedForm.controls.telephone.setValue(this.originalCompetitor?.getTelephone() ?? '');
                    this.typedForm.controls.registered.setValue(this.originalCompetitor ? this.originalCompetitor.getRegistered() : false);
                    this.typedForm.controls.info.setValue(this.originalCompetitor?.getInfo() ?? null);
                    this.typedForm.controls.logoExtension.setValue(this.originalCompetitor?.getLogoExtension() ?? null);
                    this.processing = false;
                },
                error: (e: string) => {
                    this.setAlert(IAlertType.Danger, e);
                    this.processing = false;
                }
            });

    }

    get LogoInputTypeByUpload(): LogoInput { return LogoInput.ByUpload; }

    private reloadCompetitor(competitor: TournamentCompetitor | undefined): Observable<TournamentCompetitor|undefined> {
        if ( competitor === undefined ) {
            return of(undefined);
        }
        return this.competitorRepository.reloadObject(competitor, this.tournament);
    }

    getPlaceName(): string {
        const startPlace = this.structure.getStartPlace(this.startLocation);
        return this.structureNameService.getPlaceName(startPlace);
    }

    formToJson(): JsonTournamentCompetitor {
        const info = this.typedForm.controls.info.value;
        const logoExtension = this.logoInputType === LogoInput.ByUrl ? this.typedForm.controls.logoExtension.value ?? undefined : undefined;
        return {
            id: this.originalCompetitor ? this.originalCompetitor.getId() : 0,
            name: this.typedForm.controls.name.value,
            emailaddress: this.typedForm.controls.emailaddress.value ?? undefined,
            telephone: this.typedForm.controls.telephone.value ?? undefined,
            registered: this.typedForm.controls.registered.value,
            logoExtension: logoExtension, 
            info: info ? info : undefined,
            categoryNr: this.startLocation.getCategoryNr(),
            pouleNr: this.startLocation.getPouleNr(),
            placeNr: this.startLocation.getPlaceNr()
        };
    }

    save(): boolean {
        const jsonCompetitor = this.formToJson();
        const message = this.nameValidator.validate(
            jsonCompetitor.name, 
            this.originalCompetitor,
            this.tournament.getCompetitors(),
            this.startLocation.getCategoryNr()
        );
        if (message) {
            this.setAlert(IAlertType.Danger, message);
            return false;
        }
        this.processing = true;
        this.setAlert(IAlertType.Info, 'de deelnemer wordt opgeslagen');
        if (this.originalCompetitor) {
            this.competitorRepository.editObject(jsonCompetitor, this.originalCompetitor, this.tournament.getId())
                .subscribe({
                    next: (competitor: Competitor) => {
                        this.processLogoAndNavigateBack(<TournamentCompetitor>competitor);
                    },
                    error: (e) => {
                        this.setAlert(IAlertType.Danger, e); this.processing = false;
                    }
                });
            return false;
        }
        this.competitorRepository.createObject(jsonCompetitor, this.tournament)
            .subscribe({
                next: (competitor: Competitor) => {
                    this.processLogoAndNavigateBack(<TournamentCompetitor>competitor);
                },
                error: (e) => {
                    this.setAlert(IAlertType.Danger, e); this.processing = false;
                }
            });
        return false;
    }

    processLogoAndNavigateBack(competitor: TournamentCompetitor) {
        if (this.logoInputType === LogoInput.ByUrl || this.newLogoUploaded !== true) {
            this.processing = false;
            this.navigateBack();
            return;
        }

        const input = new FormData();
        const stream: Blob | null = this.typedForm.controls.logoFileStream.value;
        if (stream) {
            input.append('logostream', stream);
        }
        this.competitorRepository.uploadImage(input, competitor, this.tournament)
            .subscribe({
                next: () => {
                    this.processing = false;
                    this.navigateBack();
                },
                error: (e) => {
                    this.setAlert(IAlertType.Danger, e); this.processing = false;
                },
                complete: () => this.processing = false
            });
    }

    toggleLogoInput() {
        if (this.logoInputType === LogoInput.ByUpload) {
            this.logoInputType = LogoInput.ByUrl;
        } else {
            this.logoInputType = LogoInput.ByUpload;
        }
    }

    navigateBack() {
        this.myNavigation.back();
    }

    getLogoUploadDescription() {
        return 'het plaatje moet in svg formaat worden aangeleverd, zodat het voor zowel de website als het programmaboekje gebruikt kan worden. De beeldverhouding moet vierkant zijn'
    }

    openInfoModal(modalContent: TemplateRef<any>) {
        const activeModal = this.modalService.open(InfoModalComponent, { windowClass: 'info-modal' });
        activeModal.componentInstance.header = 'uitleg upload logo';
        activeModal.componentInstance.modalContent = modalContent;
    }

    onFileChange(event: Event) {
        const files: FileList | null = (<HTMLInputElement>event.target).files;
        if (!files || files.length === 0) {
            return;
        }
        const file = files[0];
        const mimeType = file.type;
        if (mimeType.match(/image\/*/) == null) {
            this.setAlert(IAlertType.Danger, 'alleen plaatjes worden ondersteund');
            return;
        }
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = (_event) => {
            this.base64Logo = reader.result;
        };
        this.typedForm.controls.logoFileStream.setValue(file);

        this.newLogoUploaded = true;
    }
    // setName(name) {
    //     this.error = undefined;
    //     if (name.length < this.validations.minlengthinitials || name.length > this.validations.maxlengthinfo) {
    //         return;
    //     }
    //     this.model.name = name;
    // }

    removeFileStream(): boolean {
        this.base64Logo = null;
        this.typedForm.controls.logoFileStream.setValue(null);
        this.typedForm.controls.logoExtension.setValue(null);
        this.logoInputType = LogoInput.ByUpload;
        this.newLogoUploaded = true;
        return false;
    }

    getLogoUrl(competitor: TournamentCompetitor): string {
        return this.competitorRepository.getLogoUrl(competitor);
    }
}

export interface CompetitorValidations {
    minlengthname: number;
    maxlengthname: number;
    minlengthemailaddress: number;
    maxlengthemailaddress: number;
    minlengthtelephone: number;
    maxlengthtelephone: number;
    maxlengthinfo: number;
    maxlengthurl: number;
}
