import {
    ChangeDetectorRef,
    Component,
    effect,
    ElementRef,
    input,
    NgZone,
    OnDestroy,
    output,
} from '@angular/core';
import { Subscription, timer } from 'rxjs';
import { DefaultJsonTheme, JsonTheme } from '../../lib/tournament/theme';

@Component({
    selector: 'app-progress',
    templateUrl: './progress.component.html',
    styleUrls: ['./progress.component.scss']
})
export class ProgressComponent implements OnDestroy {
    startNrOfSecondsFromZero = input.required<number>();
    theme = input<JsonTheme>();        
    newNrOfSecondsFromZero = output<number>();

    private nrOfSecondsFromZero: number = 0;
    
    radius = 16;
    strokeWidth = 5;
    circumference = 2 * Math.PI * this.radius;
    length = (this.radius + this.strokeWidth) * 2;
    private timer!: Subscription;
    public dashoffset!: number;

    constructor(private elRef: ElementRef, private _ngZone: NgZone, private changeRef: ChangeDetectorRef) {        
        effect(() => {
            this.resetProgress(this.startNrOfSecondsFromZero());
            this.updateCustomProperty(); 
        });
    }

    processOutsideOfAngularZone() {
        this._ngZone.runOutsideAngular(() => {
            this._increaseProgress(() => {
                // reenter the Angular zone and display done
                this._ngZone.run(() => {
                    this.resetProgress(this.startNrOfSecondsFromZero());
                });
            });
        });
    }

    _increaseProgress(doneCallback: () => void) {
        this.increaseProgress();
        this.changeRef.markForCheck();
        this.changeRef.detectChanges();
        if (this.nrOfSecondsFromZero > 0) {
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

    private resetProgress(startNrOfSecondsFromZero: number) {
        this.nrOfSecondsFromZero = startNrOfSecondsFromZero;
        this.ngOnDestroy();
        this.newNrOfSecondsFromZero.emit(this.nrOfSecondsFromZero);
        this.dashoffset = this.circumference;
        this.processOutsideOfAngularZone();
    }

    private increaseProgress() {
        this.nrOfSecondsFromZero--;
        this.newNrOfSecondsFromZero.emit(this.nrOfSecondsFromZero);
        const progress = this.startNrOfSecondsFromZero() - this.nrOfSecondsFromZero;
        this.dashoffset = this.circumference * (1 - (progress / this.startNrOfSecondsFromZero()));
    }

    getSeconds(): string {
        const val = this.nrOfSecondsFromZero;
        return (val < 10) ? '0' + val : '' + val;
    }

    updateCustomProperty() {
        const theme = this.theme() ?? DefaultJsonTheme;
        if (theme !== undefined) {
            this.elRef.nativeElement.style.setProperty('--nav-bg', theme.bgColor);
            this.elRef.nativeElement.style.setProperty('--nav-color', theme.textColor);
        }
    }
}
