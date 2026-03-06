import {
    ChangeDetectionStrategy,
    Component,
    ElementRef,
    forwardRef,
    ViewChild
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { ControlValueAccessor, FormsModule, NG_VALUE_ACCESSOR } from '@angular/forms';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { renderRichText } from '../../utils/rich-text';

const RICH_TEXT_VALUE_ACCESSOR = {
    provide: NG_VALUE_ACCESSOR,
    useExisting: forwardRef(() => RichTextEditorComponent),
    multi: true
};

@Component({
    selector: 'app-rich-text-editor',
    standalone: true,
    imports: [CommonModule, FormsModule],
    providers: [RICH_TEXT_VALUE_ACCESSOR],
    changeDetection: ChangeDetectionStrategy.OnPush,
    template: `
        <div class="rich-text-editor">
            <div class="toolbar mb-2">
                <button type="button" class="btn btn-sm btn-outline-secondary" (click)="applyFormat('**')">Bold</button>
                <button type="button" class="btn btn-sm btn-outline-secondary ms-1" (click)="applyFormat('*')">Italic</button>
                <button type="button" class="btn btn-sm btn-outline-secondary ms-1" (click)="applyLink()">Link</button>
                <button type="button" class="btn btn-sm btn-outline-secondary ms-1" (click)="insertLine()">Line</button>
            </div>
            <textarea
                #editor
                class="form-control fs-6"
                rows="6"
                [value]="value"
                (input)="onInput(editor.value)"
                [disabled]="isDisabled"></textarea>
            <div class="preview mt-3 p-3 border rounded small" [innerHTML]="preview"></div>
        </div>
    `,
    styles: [`
        .rich-text-editor textarea {
            font-family: inherit;
            min-height: 140px;
        }
        .preview {
            min-height: 80px;
            background-color: #f8f9fa;
        }
        .toolbar button {
            min-width: 60px;
        }
    `]
})
export class RichTextEditorComponent implements ControlValueAccessor {
    @ViewChild('editor', { static: true }) editor!: ElementRef<HTMLTextAreaElement>;
    value = '';
    preview: SafeHtml = '';
    isDisabled = false;
    private onChange: (value: string) => void = () => {};
    private onTouched: () => void = () => {};

    constructor(private sanitizer: DomSanitizer) { }

    writeValue(value: string): void {
        this.value = value || '';
        this.preview = this.renderPreview(this.value);
        if (this.editor) {
            this.editor.nativeElement.value = this.value;
        }
    }

    registerOnChange(fn: (value: string) => void): void {
        this.onChange = fn;
    }

    registerOnTouched(fn: () => void): void {
        this.onTouched = fn;
    }

    setDisabledState?(isDisabled: boolean): void {
        this.isDisabled = isDisabled;
    }

    onInput(next: string): void {
        this.updateValue(next || '');
        this.onTouched();
    }

    applyFormat(wrapper: string): void {
        const textarea = this.editor.nativeElement;
        const { selectionStart, selectionEnd, value } = textarea;
        const before = value.slice(0, selectionStart);
        const after = value.slice(selectionEnd);
        const selected = value.slice(selectionStart, selectionEnd) || '';
        const wrapped = `${before}${wrapper}${selected}${wrapper}${after}`;
        this.updateValue(wrapped);
        const cursor = selectionStart + wrapper.length + selected.length + wrapper.length;
        setTimeout(() => {
            textarea.focus();
            textarea.setSelectionRange(cursor, cursor);
        });
    }

    applyLink(): void {
        const textarea = this.editor.nativeElement;
        const { selectionStart, selectionEnd, value } = textarea;
        const label = value.slice(selectionStart, selectionEnd) || 'text';
        const slug = label.toLowerCase().replace(/\s+/g, '-');
        const wrapped = `${value.slice(0, selectionStart)}[${label}](https://example.com/${slug})${value.slice(selectionEnd)}`;
        this.updateValue(wrapped);
        setTimeout(() => {
            textarea.focus();
            textarea.setSelectionRange(selectionStart, selectionStart + wrapped.length);
        });
    }

    insertLine(): void {
        const textarea = this.editor.nativeElement;
        const { selectionStart, value } = textarea;
        const withLine = `${value.slice(0, selectionStart)}\n---\n${value.slice(selectionStart)}`;
        this.updateValue(withLine);
        setTimeout(() => {
            textarea.focus();
            textarea.setSelectionRange(selectionStart + 4, selectionStart + 4);
        });
    }

    private updateValue(next: string): void {
        this.value = next;
        this.onChange(this.value);
        this.preview = this.renderPreview(next);
    }

    private renderPreview(source: string): SafeHtml {
        const html = renderRichText(source);
        return this.sanitizer.bypassSecurityTrustHtml(html);
    }
}
