import { Component, OnInit, TemplateRef } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';

import { MyNavigation } from '../../shared/common/navigation';
import { Sponsor } from '../../lib/sponsor';
import { JsonSponsor } from '../../lib/sponsor/json';
import { SponsorRepository } from '../../lib/sponsor/repository';
import { TournamentRepository } from '../../lib/tournament/repository';
import { StructureRepository } from '../../lib/ngx-sport/structure/repository';
import { TournamentComponent } from '../../shared/tournament/component';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { InfoModalComponent } from '../../shared/tournament/infomodal/infomodal.component';
import { SponsorScreensCreator } from '../../lib/liveboard/screenCreator/sponsors';
import { SponsorScreen } from '../../lib/liveboard/screens';
import { IAlertType } from '../../shared/common/alert';
import { ScreenConfig } from '../../lib/liveboard/screenConfig/json';
import { SponsorMapper } from '../../lib/sponsor/mapper';
import { GlobalEventsManager } from '../../shared/common/eventmanager';
import { FavoritesRepository } from '../../lib/favorites/repository';
import { League } from 'ngx-sport';
import { TournamentMapper } from '../../lib/tournament/mapper';
import { JsonTournament } from '../../lib/tournament/json';
import { Tournament } from '../../lib/tournament';

@Component({
    selector: 'app-tournament-name-and-logo',
    templateUrl: './name-and-logo.component.html',
    styleUrls: ['./name-and-logo.component.css']
})
export class TournamentNameAndLogoComponent extends TournamentComponent implements OnInit {
    public typedForm: FormGroup<{
        name: FormControl<string>,
        logoExtension: FormControl<string|null>,
        logoFileStream: FormControl<Blob|null>,
      }>;

    base64Logo!: string | ArrayBuffer | null;

    logoInputType: LogoInput;    
    newLogoUploaded: boolean;
    private readonly LOGO_ASPECTRATIO_THRESHOLD = 0.34;
    
    validations: TournamentNameValidations = {
        minlengthname: League.MIN_LENGTH_NAME,
        maxlengthname: League.MAX_LENGTH_NAME
    };

    constructor(
        route: ActivatedRoute,
        router: Router,
        tournamentRepository: TournamentRepository,
        structureRepository: StructureRepository,
        globalEventsManager: GlobalEventsManager,
        modalService: NgbModal,
        favRepository: FavoritesRepository,
        private tournamentMapper: TournamentMapper,
        private myNavigation: MyNavigation
    ) {
        super(route, router, tournamentRepository, structureRepository, globalEventsManager, modalService, favRepository);
        this.logoInputType = LogoInput.ByUpload;
        this.newLogoUploaded = false;
        
        // activeModal.componentInstance.initialName = this.competition.getLeague().getName();


        this.typedForm = new FormGroup({
            name: new FormControl('', { nonNullable: true, validators: 
                [
                    Validators.required,
                    Validators.minLength(this.validations.minlengthname),
                    Validators.maxLength(this.validations.maxlengthname)
                ] 
            }),
            logoExtension: new FormControl('', { validators: 
                [
                    Validators.maxLength(this.validations.maxlengthname)
                ] 
            }),
            logoFileStream:  new FormControl(),
        });
    }

    get LogoInputTypeByUpload(): LogoInput { return LogoInput.ByUpload; }

    // initialsValidator(control: FormControl): { [s: string]: boolean } {
    //     if (control.value.length < this.validations.minlengthinitials || control.value.length < this.validations.maxlengthinitials) {
    //         return { invalidInitials: true };
    //     }
    // }

    ngOnInit() {
        this.route.params.subscribe(params => {
            super.myNgOnInit(() => {
                this.typedForm.controls.name.setValue(this.tournament.getName());
                this.typedForm.controls.logoExtension.setValue(this.tournament.getLogoExtension() ?? null);
                this.processing = false; 
            });
        });
    }
    
    save(): boolean {
        this.processing = true;
        this.setAlert(IAlertType.Info, 'de sponsor wordt opgeslagen');

        this.tournamentRepository.editObject(this.formToJson()).subscribe({
            next: (tournament: Tournament) => {
                this.tournament = tournament;
                this.processLogoAndNavigateBack(tournament);
            },
            error: (e) => {
                this.setAlert(IAlertType.Danger, e); this.processing = false;
            },
            complete: () => this.processing = false
        });
        return false;
    }

    saveName(newName: string) {
        this.setAlert(IAlertType.Info, 'de naam wordt opgeslagen');

        this.processing = true;
        const json = this.formToJson()
        this.tournamentRepository.editObject(json)
            .subscribe({
                next: (tournament: Tournament) => {
                    this.tournament = tournament;
                    // this.router.navigate(['/admin', newTournamentId]);
                    this.setAlert(IAlertType.Success, 'de naam is opgeslagen');
                },
                error: (e) => {
                    this.setAlert(IAlertType.Danger, 'de naam kon niet worden opgeslagen');
                    this.processing = false;
                },
                complete: () => this.processing = false
            });
    }

    formToJson(): JsonTournament {
        const json = this.tournamentMapper.toJson(this.tournament);
        const logoExtension = this.logoInputType === LogoInput.ByUrl ? this.typedForm.controls.logoExtension.value ?? undefined : undefined;
        json.logoExtension = logoExtension;
        json.competition.league.name = this.typedForm.controls.name.value;
        return json;
    }

    processLogoAndNavigateBack(tournament: Tournament) {
        if (this.logoInputType === LogoInput.ByUrl || this.newLogoUploaded !== true) {
            this.processing = false;
            this.navigateBack();
            return;
        }
        const input = new FormData();
        const stream: Blob | null = this.typedForm.controls.logoFileStream.value;
        if( stream) {
            input.append('logostream', stream);
        }
        this.tournamentRepository.uploadImage(input, tournament)
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

    onFileChange(event: Event) {
        const files: FileList | null = (<HTMLInputElement>event.target).files;
        if (!files || files.length === 0) {
            return;
        }
        const file = files[0];
        const mimeType = file.type;
        if (mimeType.match(/image\/*/) == null) {
            this.setAlert(IAlertType.Danger, 'alleen afbeeldingen worden ondersteund');
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
        return 'De afbeelding moet in jpg-, png-, gif-, of svgformaat worden aangeleverd. De afbeedling wordt geschaald naar een hoogte van 200px. De beeldverhouding moet liggen tussen '
            + (1 - this.LOGO_ASPECTRATIO_THRESHOLD).toFixed(2) + ' en ' + (1 + this.LOGO_ASPECTRATIO_THRESHOLD).toFixed(2);
    }

    openInfoModal(modalContent: TemplateRef<any>) {
        const activeModal = this.modalService.open(InfoModalComponent, { windowClass: 'info-modal' });
        activeModal.componentInstance.header = 'uitleg upload logo';
        activeModal.componentInstance.modalContent = modalContent;
    }

    getLogoUrl(tournament: Tournament): string {
        return this.tournamentRepository.getLogoUrl(tournament);
    }

    removeFileStream(): boolean {
        this.base64Logo = null;
        this.typedForm.controls.logoFileStream.setValue(null);
        this.typedForm.controls.logoExtension.setValue(null);
        this.logoInputType = LogoInput.ByUpload;
        this.newLogoUploaded = true;
        return false;
    }
}

export interface TournamentNameValidations {
    minlengthname: number;
    maxlengthname: number;
}

export enum LogoInput {
    ByUrl = 1, ByUpload
}
