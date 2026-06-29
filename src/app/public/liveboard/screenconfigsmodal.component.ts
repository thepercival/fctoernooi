import { Component, Input, OnDestroy, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { NgbActiveModal, NgbAlert } from '@ng-bootstrap/ng-bootstrap';
import { ScreenConfig } from '../../lib/liveboard/screenConfig/json';
import { ScreenConfigName } from '../../lib/liveboard/screenConfig/name';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faCogs } from '@fortawesome/free-solid-svg-icons';

@Component({
    selector: 'app-ngbd-modal-screenconfigs',
    templateUrl: './screenconfigsmodal.component.html',
    styleUrls: ['./screenconfigsmodal.component.scss'],
    changeDetection: ChangeDetectionStrategy.Eager,
    imports: [ReactiveFormsModule, FontAwesomeModule, NgbAlert]
    
})
export class ScreenConfigsModalComponent implements OnInit {

    @Input() screenConfigs!: ScreenConfig[];
    public typedForm: FormGroup;
    public faCogs = faCogs;

    constructor(
        public activeModal: NgbActiveModal
    ) {
        this.typedForm = new FormGroup({});

    }

    ngOnInit() {
        this.screenConfigs.forEach((screenConfig: ScreenConfig) => {
            this.typedForm.addControl(this.getEnabledId(screenConfig), new FormControl());
            this.typedForm.addControl(this.getNrOfSecondsId(screenConfig), new FormControl());
            this.typedForm.get(this.getEnabledId(screenConfig))?.setValue(screenConfig.enabled);
            this.typedForm.get(this.getNrOfSecondsId(screenConfig))?.setValue(screenConfig.nrOfSeconds);
        });
        setTimeout(() => {
            if (this.typedForm.pristine) {
              this.activeModal.dismiss();
            }
        }, 15000);
    }

    public getEnabledId(screenConfig: ScreenConfig): string {

        return screenConfig.name + '-enabled';
    }

    hasEnabledScreenConfig(): boolean {
        return this.screenConfigs.some((screenConfig: ScreenConfig): boolean => {
            return this.getEnabled(screenConfig);
        });
    }

    getEnabled(screenConfig: ScreenConfig): boolean {
        return this.typedForm.value[this.getEnabledId(screenConfig)];
    }

    public getNrOfSecondsId(screenConfig: ScreenConfig): string {
        return screenConfig.name + '-nrOfSeconds';
    }

    getNrOfSeconds(screenConfig: ScreenConfig): number {
        return this.typedForm.value[this.getNrOfSecondsId(screenConfig)];
    }

    getRefreshRange(): number[] {
        return [5, 10, 15, 20, 25, 30];
    }

    getDescription(screenConfig: ScreenConfig): string {
        switch (screenConfig.name) {
            case ScreenConfigName.PoulesRanking: { return 'poulestanden'; }
            case ScreenConfigName.EndRanking: { return 'eindstand'; }
            case ScreenConfigName.Schedule: { return 'wedstrijden'; }
            case ScreenConfigName.Results: { return 'uitslagen'; }
            case ScreenConfigName.Sponsors: { return 'sponsoren'; }
        }
    }

    formToJson(): ScreenConfig[] {
        return this.screenConfigs.map((screenConfig: ScreenConfig): ScreenConfig => {
            return {
                name: screenConfig.name,
                enabled: this.getEnabled(screenConfig),
                nrOfSeconds: this.getNrOfSeconds(screenConfig)
            }
        });
    }
}
