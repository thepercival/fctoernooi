import { OnInit, ElementRef, Input, Directive } from '@angular/core';

@Directive({ selector: '[focusMe]' })
export class FocusDirective implements OnInit {

    @Input('focusMe') isFocused: boolean = false;;

    constructor(private hostElement: ElementRef) { }

    ngOnInit() {
        if (this.isFocused) {
            this.hostElement.nativeElement.focus();
        }
    }
}