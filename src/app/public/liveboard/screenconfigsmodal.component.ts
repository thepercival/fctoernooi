import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { ScreenConfig } from '../../lib/liveboard/screenConfig/json';
import { ScreenConfigName } from '../../lib/liveboard/screenConfig/name';

@Component({
    selector: 'app-ngbd-modal-screenconfigs',
    templateUrl: './screenconfigsmodal.component.html',
    styleUrls: ['./screenconfigsmodal.component.scss']
})
export class ScreenConfigsModalComponent implements OnInit {

    @Input() screenConfigs!: ScreenConfig[];

    public form: FormGroup;

    constructor(
        public activeModal: NgbActiveModal,
        private formBuilder: FormBuilder,
    ) {
        this.form = formBuilder.group({});

    }

    ngOnInit() {
        this.screenConfigs.forEach((screenConfig: ScreenConfig) => {
            this.form.addControl(this.getEnabledId(screenConfig), new FormControl());
            this.form.addControl(this.getNrOfSecondsId(screenConfig), new FormControl());
            this.form.get(this.getEnabledId(screenConfig))?.setValue(screenConfig.enabled);
            this.form.get(this.getNrOfSecondsId(screenConfig))?.setValue(screenConfig.nrOfSeconds);
        });
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
        return this.form.value[this.getEnabledId(screenConfig)];
    }

    public getNrOfSecondsId(screenConfig: ScreenConfig): string {
        return screenConfig.name + '-nrOfSeconds';
    }

    getNrOfSeconds(screenConfig: ScreenConfig): number {
        return this.form.value[this.getNrOfSecondsId(screenConfig)];
    }

    getRefreshRange(): number[] {
        return [5, 10, 15, 20, 25, 30];
    }

    getDescription(screenConfig: ScreenConfig): string {
        switch (screenConfig.name) {
            case ScreenConfigName.PoulesRanking: { return 'poulestanden'; }
            case ScreenConfigName.EndRanking: { return 'eind rangschikking'; }
            case ScreenConfigName.Schedule: { return 'programma'; }
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
