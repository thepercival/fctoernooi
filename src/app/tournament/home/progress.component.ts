import {
    ChangeDetectorRef,
    Component,
    EventEmitter,
    Input,
    NgZone,
    OnChanges,
    OnDestroy,
    Output,
    SimpleChanges,
} from '@angular/core';
import { Subscription, timer } from 'rxjs';

@Component({
    selector: 'app-progress',
    templateUrl: './progress.component.html',
    styleUrls: ['./progress.component.scss']
})
export class ProgressComponent implements OnDestroy, OnChanges {
    @Input() max: number;
    @Input() toggleProgress: boolean;
    @Output() executeAtZero = new EventEmitter<boolean>();
    radius = 16;
    strokeWidth = 5;
    circumference = 2 * Math.PI * this.radius;
    length = (this.radius + this.strokeWidth) * 2;
    private timer: Subscription;
    private progress: number;
    public dashoffset: number;

    constructor(private _ngZone: NgZone, private changeRef: ChangeDetectorRef) {
        this.resetProgress();
    }

    ngOnChanges(changes: SimpleChanges) {
        if (changes.toggleProgress !== undefined && changes.toggleProgress.previousValue !== undefined
            && changes.toggleProgress.currentValue !== changes.toggleProgress.previousValue) {
            this.processOutsideOfAngularZone();
        }
    }

    processOutsideOfAngularZone() {
        this._ngZone.runOutsideAngular(() => {
            this._increaseProgress(() => {
                // reenter the Angular zone and display done
                this._ngZone.run(() => {
                    this.resetProgress();
                    this.executeAtZero.emit(true);
                });
            });
        });
    }

    _increaseProgress(doneCallback: () => void) {
        this.increaseProgress();
        this.changeRef.markForCheck();
        this.changeRef.detectChanges();
        if (this.progress < this.max) {
            this.timer = timer(1000).subscribe(counter => {
                this._increaseProgress(doneCallback);
            });
        } else {
            doneCallback();
        }
    }

    ngOnDestroy() {
        if (this.timer !== undefined) {
            this.timer.unsubscribe();
        }
    }

    private resetProgress() {
        this.progress = 0;
        this.dashoffset = this.circumference;
    }

    private increaseProgress() {
        this.progress += 1;
        this.dashoffset = this.circumference * (1 - (this.progress / this.max));
    }

    getSeconds(): string {
        const val = this.max - this.progress;
        return (val < 10) ? '0' + val : '' + val;
    }
}
