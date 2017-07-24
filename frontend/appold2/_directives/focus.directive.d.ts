/**
 * Created by cdunnink on 30-11-2016.
 */
import { ElementRef } from '@angular/core';
export declare class FocusDirective {
    focus: boolean;
    private element;
    constructor($element: ElementRef);
    ngAfterContentChecked(): void;
    giveFocus(): void;
}
