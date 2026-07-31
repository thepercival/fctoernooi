import { OnInit, ElementRef, Input, Directive, inject } from '@angular/core';

@Directive({
    selector: '[focusMe]',
    standalone: true,
    
})
export class FocusDirective implements OnInit {
    private hostElement = inject(ElementRef);


    @Input('focusMe') isFocused: boolean = false;;
    constructor() { }

    ngOnInit() {
        if (this.isFocused && !this.isTouchDevice()) {
            this.hostElement.nativeElement.focus();
        }
    }

    private isTouchDevice(): boolean {
        if (typeof window === 'undefined') {
            return false;
        }
        return window.matchMedia('(hover: none) and (pointer: coarse)').matches;
    }
}