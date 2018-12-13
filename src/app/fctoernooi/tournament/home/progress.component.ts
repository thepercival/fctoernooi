import { Component, Input, OnChanges, OnInit, SimpleChanges } from '@angular/core';

@Component({
    selector: 'app-progress',
    templateUrl: './progress.component.html',
    styleUrls: ['./progress.component.scss']
})
export class ProgressComponent implements OnInit, OnChanges {
    @Input() value: number;
    @Input() max: number;
    radius = 16;
    strokeWidth = 5;
    circumference = 2 * Math.PI * this.radius;
    dashoffset: number;
    length = (this.radius + this.strokeWidth) * 2;

    constructor() {
        this.progress(0);
    }

    ngOnInit() { }

    ngOnChanges(changes: SimpleChanges) {
        if (changes.value.currentValue !== changes.value.previousValue) {
            this.progress(changes.value.currentValue);
        }
    }

    private progress(value: number) {
        const progress = value / this.max;
        this.dashoffset = this.circumference * (1 - progress);
    }

    getSeconds(): string {
        const val = this.max - this.value;
        if (val < 10) {
            return '0' + val;
        }
        return '' + val;
    }
}
