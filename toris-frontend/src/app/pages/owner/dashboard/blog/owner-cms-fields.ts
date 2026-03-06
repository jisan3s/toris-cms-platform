import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormGroup, ReactiveFormsModule } from '@angular/forms';
import { CommonModule, NgTemplateOutlet } from '@angular/common';
import { CmsType } from '../../../../services/owner-content';
import { RichTextEditorComponent } from '../../../../shared/components/rich-text-editor/rich-text-editor';

@Component({
    selector: 'app-owner-cms-fields',
    standalone: true,
    imports: [CommonModule, NgTemplateOutlet, ReactiveFormsModule, RichTextEditorComponent],
    template: `
        @if (form) {
            <ng-container [formGroup]="form">
                <ng-template #blogFields>
                    <div class="col-md-6">
                        <label class="form-label">Category</label>
                        <input type="text" class="form-control" formControlName="category" placeholder="{{ categoryPlaceholder }}">
                    </div>
                    <div class="col-12 mt-3">
                        <label class="form-label">Featured Image URL</label>
                        <input type="text" class="form-control" formControlName="image">
                        <div class="mt-2 d-flex align-items-center gap-2">
                            <input type="file" class="form-control" accept="image/*" (change)="emitImage($event)">
                            @if (isUploadingImage) {
                                <span class="small text-muted">Uploading...</span>
                            }
                        </div>
                    </div>
                    <div class="col-12 mt-3">
                        <label class="form-label">Detail Description</label>
                        <app-rich-text-editor formControlName="detailDescription"></app-rich-text-editor>
                    </div>
                    <div class="col-md-6 mt-3">
                        <label class="form-label">Details Text</label>
                        <input type="text" class="form-control" formControlName="buttonText" placeholder="View Details">
                    </div>
                    <div class="col-md-6 mt-3">
                        <label class="form-label">Details Link</label>
                        <input type="text" class="form-control" formControlName="buttonLink" placeholder="/blog/my-post or https://...">
                    </div>
                </ng-template>

                <ng-template #portfolioFields>
                    <div class="col-md-6">
                        <label class="form-label">Category</label>
                        <input type="text" class="form-control" formControlName="category" placeholder="{{ categoryPlaceholder }}">
                    </div>
                    <div class="col-12 mt-3">
                        <label class="form-label">Featured Image URL</label>
                        <input type="text" class="form-control" formControlName="image">
                        <div class="mt-2 d-flex align-items-center gap-2">
                            <input type="file" class="form-control" accept="image/*" (change)="emitImage($event)">
                            @if (isUploadingImage) {
                                <span class="small text-muted">Uploading...</span>
                            }
                        </div>
                    </div>
                    <div class="col-12 mt-3">
                        <label class="form-label">Card Button Text</label>
                        <input type="text" class="form-control" formControlName="buttonText" placeholder="View Details">
                    </div>
                    <div class="col-12 mt-3">
                        <label class="form-label">Detail Description</label>
                        <app-rich-text-editor formControlName="detailDescription"></app-rich-text-editor>
                    </div>
                </ng-template>

                @switch (type) {
                    @case ('blog') {
                        <ng-container [ngTemplateOutlet]="blogFields"></ng-container>
                    }
                    @case ('portfolio') {
                        <ng-container [ngTemplateOutlet]="portfolioFields"></ng-container>
                    }
                    @case ('services') {
                        <div class="col-12">
                            <label class="form-label">Icon Class</label>
                            <input type="text" class="form-control" formControlName="icon" placeholder="bi bi-code-slash">
                        </div>
                        <div class="col-12 mt-3">
                            <label class="form-label">Service Image URL</label>
                            <input type="text" class="form-control" formControlName="image">
                            <div class="mt-2 d-flex align-items-center gap-2">
                                <input type="file" class="form-control" accept="image/*" (change)="emitImage($event)">
                                @if (isUploadingImage) {
                                    <span class="small text-muted">Uploading...</span>
                                }
                            </div>
                        </div>
                        <div class="col-12 mt-3">
                            <label class="form-label">Detail Description</label>
                            <app-rich-text-editor formControlName="detailDescription"></app-rich-text-editor>
                        </div>
                        <div class="col-12 mt-3">
                            <label class="form-label">Features (One Per Line)</label>
                            <textarea class="form-control" rows="4" formControlName="featuresText"></textarea>
                        </div>
                        <div class="col-md-12 mt-3">
                            <label class="form-label">Card Button Text</label>
                            <input type="text" class="form-control" formControlName="buttonText" placeholder="Learn More">
                        </div>
                        <div class="col-md-12 mt-3">
                            <label class="form-label">Card Button Link</label>
                            <input type="text" class="form-control" formControlName="buttonLink" placeholder="/service-details/my-service or https://...">
                        </div>
                        @if (uploadError) {
                            <div class="col-12 mt-3">
                                <div class="alert alert-danger py-2 mb-0">{{ uploadError }}</div>
                            </div>
                        }
                    }
                }
            </ng-container>
        }
    `
})
export class OwnerCmsFieldsComponent {
    @Input() form!: FormGroup;
    @Input() type: CmsType = 'blog';
    @Input() uploadError = '';
    @Input() isUploadingImage = false;
    @Output() imageSelected = new EventEmitter<Event>();

    emitImage(event: Event): void {
        this.imageSelected.emit(event);
    }

    get categoryPlaceholder(): string {
        return this.type === 'portfolio' ? 'Case Study' : 'Marketing';
    }
}
