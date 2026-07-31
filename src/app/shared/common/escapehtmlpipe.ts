import { Pipe, PipeTransform, inject } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';

@Pipe({
    name: 'keepHtml', pure: false,
    
})
export class EscapeHtmlPipe implements PipeTransform {
    private sanitizer = inject(DomSanitizer);
    constructor() {
    }

    transform(content: string) {
        return this.sanitizer.bypassSecurityTrustHtml(content);
    }
}
