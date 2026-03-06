import { Pipe, PipeTransform } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { renderRichText } from '../utils/rich-text';

@Pipe({
    name: 'richText',
    standalone: true
})
export class RichTextPipe implements PipeTransform {
    constructor(private sanitizer: DomSanitizer) { }

    transform(value?: string): SafeHtml {
        const html = renderRichText(value || '');
        return this.sanitizer.bypassSecurityTrustHtml(html);
    }
}
