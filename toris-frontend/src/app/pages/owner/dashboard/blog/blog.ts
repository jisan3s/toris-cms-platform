import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { AbstractControl, AsyncValidatorFn, FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { DatePipe } from '@angular/common';
import { Router } from '@angular/router';
import { catchError, map, of } from 'rxjs';
import { OwnerAuthService } from '../../../../services/owner-auth';
import { AdminAuthService } from '../../../../services/admin-auth';
import { CmsContentItem, CmsPayload, CmsType, OwnerContentService } from '../../../../services/owner-content';
import { NotificationService } from '../../../../shared/services/notification.service';
import { OwnerCmsFieldsComponent } from './owner-cms-fields';

@Component({
    selector: 'app-owner-blog-editor',
    imports: [CommonModule, ReactiveFormsModule, DatePipe, OwnerCmsFieldsComponent],
    templateUrl: './blog.html',
    styleUrl: './blog.scss',
})
export class OwnerBlogEditor implements OnInit {
    form: FormGroup;
    token = '';
    isOwnerPortal = false;
    items: CmsContentItem[] = [];
    editingId: string | null = null;
    uploadError = '';
    isUploadingImage = false;
    currentPage = 1;
    pageSize = 20;
    totalItems = 0;
    private slugEdited = false;
    private originalSlug = '';
    private initialLoadRetryCount = 0;
    private readonly maxInitialLoadRetries = 5;
    private listRequestSeq = 0;
    private readonly listCache = new Map<CmsType, { items: CmsContentItem[]; total: number }>();

    get totalPages(): number {
        if (!this.pageSize) return 1;
        const pages = Math.ceil(this.totalItems / this.pageSize);
        return Math.max(1, pages || 1);
    }

    get cmsType(): CmsType {
        return this.sectionToType(String(this.form.get('section')?.value || 'Blog'));
    }

    constructor(
        private fb: FormBuilder,
        private ownerAuthService: OwnerAuthService,
        private adminAuthService: AdminAuthService,
        private ownerContentService: OwnerContentService,
        private router: Router,
        private cdr: ChangeDetectorRef,
        private notifications: NotificationService
    ) {
        this.form = this.fb.group({
            section: ['Blog', Validators.required],
            title: ['', Validators.required],
            summary: ['', Validators.required],
            status: ['Draft', Validators.required],
            slug: this.fb.control('', {
                asyncValidators: [this.slugUniqueValidator()],
                updateOn: 'blur'
            }),
            icon: [''],
            image: [''],
            detailDescription: [''],
            category: ['Blog'],
            featuresText: [''],
            buttonText: [''],
            buttonLink: [''],
            order: [0]
        });

        this.setupSlugAutoGenerate();
    }

    ngOnInit(): void {
        this.isOwnerPortal = this.router.url.startsWith('/owner/');
        this.token = this.getCmsToken();
        this.loadItems(this.currentType());
        this.preloadOtherTypes();
    }

    private sectionToType(section: string): CmsType {
        const normalized = section?.trim().toLowerCase();
        if (normalized === 'services') return 'services';
        if (normalized === 'portfolio') return 'portfolio';
        return 'blog';
    }

    private currentType(): CmsType {
        return this.cmsType;
    }

    onTypeChange(sectionValue: string) {
        this.currentPage = 1;
        this.editingId = null;
        this.uploadError = '';
        this.slugEdited = false;
        this.form.patchValue({
            section: sectionValue,
            title: '',
            summary: '',
            status: 'Draft',
            icon: '',
            image: '',
            detailDescription: '',
            category: sectionValue === 'Blog' ? 'Blog' : sectionValue === 'Portfolio' ? 'Case Study' : '',
            featuresText: '',
            buttonText: sectionValue === 'Portfolio' || sectionValue === 'Blog' ? 'View Details' : '',
            buttonLink: '',
            order: 0
        });
        this.setSlugField('');
        this.slugControl?.updateValueAndValidity();
        const nextType = this.sectionToType(sectionValue);
        this.applyCachedList(nextType);
        this.loadItems(nextType);
    }

    loadItems(type: CmsType = this.currentType()) {
        const requestType = type;
        const requestSeq = ++this.listRequestSeq;
        this.token = this.getCmsToken();
        if (!this.token) {
            if (this.initialLoadRetryCount < this.maxInitialLoadRetries) {
                this.initialLoadRetryCount += 1;
                setTimeout(() => this.loadItems(type), 200);
            }
            return;
        }
        this.initialLoadRetryCount = 0;
        const params = { page: String(this.currentPage), limit: String(this.pageSize) } as Record<string, string>;
        this.ownerContentService.listCms(type, this.token, params).subscribe({
            next: (res) => {
                if (requestSeq !== this.listRequestSeq || requestType !== this.currentType()) {
                    return;
                }
                this.items = Array.isArray(res?.items) ? res.items : [];
                this.totalItems = res?.total || 0;
                this.listCache.set(requestType, { items: this.items, total: this.totalItems });
                this.cdr.detectChanges();
            },
            error: (err) => {
                console.error('Failed to load CMS content:', err);
                if (requestSeq !== this.listRequestSeq || requestType !== this.currentType()) {
                    return;
                }
                this.items = [];
                this.totalItems = 0;
                this.cdr.detectChanges();
            }
        });
    }

    changePage(direction: -1 | 1): void {
        const nextPage = this.currentPage + direction;
        if (nextPage < 1 || nextPage > this.totalPages) return;
        this.currentPage = nextPage;
        this.loadItems(this.currentType());
    }

    private setupSlugAutoGenerate(): void {
        const titleControl = this.form.get('title');
        const slugControl = this.slugControl;
        if (!titleControl || !slugControl) return;

        titleControl.valueChanges.subscribe((value) => {
            if (!this.slugEdited) {
                slugControl.setValue(this.slugify(String(value || '')), { emitEvent: false });
            }
        });
    }

    onSlugInput(value: unknown): void {
        this.slugEdited = true;
        const normalized = this.slugify(String(value || ''));
        this.slugControl?.setValue(normalized, { emitEvent: false });
    }

    private setSlugField(value: string): void {
        this.slugControl?.setValue(this.slugify(value), { emitEvent: false });
    }

    private slugUniqueValidator(): AsyncValidatorFn {
        return (control: AbstractControl) => {
            const normalized = this.slugify(String(control.value || ''));
            if (!normalized) return of(null);
            const token = this.getCmsToken();
            if (!token) return of(null);
            const type = this.currentType();
            return this.ownerContentService.checkSlug(type, normalized, token).pipe(
                map((result) => {
                    if (result.exists && (!this.editingId || this.originalSlug !== normalized)) {
                        return { slugTaken: true };
                    }
                    return null;
                }),
                catchError(() => of(null))
            );
        };
    }

    get slugControl(): AbstractControl | null {
        return this.form.get('slug');
    }

    startEdit(item: CmsContentItem) {
        this.uploadError = '';
        this.editingId = item._id;
        this.slugEdited = true;
        this.originalSlug = item.slug || '';
        this.form.patchValue({
            section: item.type === 'services' ? 'Services' : item.type === 'portfolio' ? 'Portfolio' : 'Blog',
            title: item.title,
            summary: item.summary,
            status: item.status,
            icon: item.icon || '',
            image: item.image || '',
            detailDescription: item.detailDescription || '',
            featuresText: Array.isArray(item.features) ? item.features.join('\n') : '',
            buttonText: item.type === 'portfolio' || item.type === 'blog' ? (item.buttonText || 'View Details') : (item.buttonText || ''),
            buttonLink: item.buttonLink || '',
            category: item.category || (item.type === 'portfolio' ? 'Case Study' : 'Blog'),
            order: item.order || 0
        });
        this.setSlugField(item.slug || '');
        this.slugControl?.updateValueAndValidity();
    }

    cancelEdit() {
        this.editingId = null;
        this.uploadError = '';
        this.slugEdited = false;
        this.originalSlug = '';
        this.form.patchValue({
            title: '',
            summary: '',
            status: 'Draft',
            icon: '',
            image: '',
            detailDescription: '',
            category: this.currentType() === 'portfolio' ? 'Case Study' : 'Blog',
            featuresText: '',
            buttonText: this.currentType() === 'portfolio' || this.currentType() === 'blog' ? 'View Details' : '',
            buttonLink: '',
            order: 0
        });
        this.setSlugField('');
        this.slugControl?.updateValueAndValidity();
    }

    deleteItem(item: CmsContentItem) {
        this.token = this.getCmsToken();
        if (!this.token) return;
        if (!confirm(`Delete "${item.title}"?`)) return;

        this.ownerContentService.deleteCms(item.type, item._id, this.token).subscribe({
            next: (res) => {
                this.notifications.notify(res.message || 'Content deleted', 'success');
                this.loadItems(this.currentType());
            },
            error: (err) => {
                this.notifications.notify(err?.error?.message || 'Failed to delete content', 'danger');
            }
        });
    }

    async onSubmit() {
        this.token = this.getCmsToken();
        if (this.form.invalid || !this.token) return;
        const type = this.currentType();
        const payload: CmsPayload = {
            title: String(this.form.value.title || ''),
            summary: String(this.form.value.summary || ''),
            status: String(this.form.value.status || 'Draft')
        };
        const slugValue = this.slugify(String(this.form.value.slug || ''));

        payload.slug = slugValue || this.slugify(payload.title);
        payload.order = Number(this.form.value.order || 0);

        if (type === 'services') {
            payload.icon = String(this.form.value.icon || '');
            payload.image = String(this.form.value.image || '');
            payload.detailDescription = String(this.form.value.detailDescription || '');
            payload.features = String(this.form.value.featuresText || '')
                .split('\n')
                .map((line) => line.trim())
                .filter(Boolean);
            payload.buttonText = String(this.form.value.buttonText || '');
            payload.buttonLink = String(this.form.value.buttonLink || '');
        }

        if (type === 'blog' || type === 'portfolio') {
            payload.image = String(this.form.value.image || '');
            payload.detailDescription = String(this.form.value.detailDescription || '');
            payload.category = String(this.form.value.category || (type === 'blog' ? 'Blog' : 'Case Study'));
            if (type === 'blog') {
                payload.buttonText = String(this.form.value.buttonText || 'View Details');
                payload.buttonLink = String(this.form.value.buttonLink || '');
            }
            if (type === 'portfolio') {
                payload.buttonText = String(this.form.value.buttonText || 'View Details');
            }
        }

        const request = this.editingId
            ? this.ownerContentService.updateCms(type, this.editingId, payload, this.token)
            : this.ownerContentService.createCms(type, payload, this.token);

        request.subscribe({
            next: (res) => {
                this.notifications.notify(res.message || 'Content saved', 'success');
                this.cancelEdit();
                this.loadItems(type);
            },
            error: (err) => {
                const message = err?.error?.message || 'Failed to save content';
                this.notifications.notify(message, 'danger');
            }
        });
    }

    onImageSelected(event: Event, fieldKey = 'image'): void {
        const input = event.target as HTMLInputElement;
        const file = input?.files?.[0];
        if (!file) return;

        this.uploadError = '';
        this.isUploadingImage = true;
        this.token = this.getCmsToken();
        if (!this.token) {
            this.uploadError = 'Please login first';
            this.isUploadingImage = false;
            input.value = '';
            return;
        }

        const pageKey = this.sectionToType(String(this.form.get('section')?.value || 'Services'));
        const folder = `cms/${pageKey}/${String(this.form.value.slug || this.form.value.title || pageKey).trim().toLowerCase().replace(/[^a-z0-9]+/g, '-')}`;

        this.fileToDataUrl(file)
            .then((fileDataUrl) => {
                this.ownerContentService.uploadMedia(fileDataUrl, this.token, folder).subscribe({
                    next: (res) => {
                        this.isUploadingImage = false;
                        if (res?.secureUrl) {
                            this.form.patchValue({ [fieldKey]: res.secureUrl });
                        } else {
                            this.uploadError = 'Upload succeeded but no URL returned';
                        }
                    },
                    error: (err) => {
                        this.isUploadingImage = false;
                        this.uploadError = err?.error?.message || 'Image upload failed';
                    }
                });
            })
            .catch(() => {
                this.isUploadingImage = false;
                this.uploadError = 'Failed to read file';
            })
            .finally(() => {
                input.value = '';
            });
    }

    private fileToDataUrl(file: File): Promise<string> {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve(String(reader.result || ''));
            reader.onerror = () => reject(new Error('Failed to read file'));
            reader.readAsDataURL(file);
        });
    }

    private slugify(value: string): string {
        return String(value || '')
            .trim()
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/^-+|-+$/g, '');
    }

    private getCmsToken(): string {
        const ownerToken = this.ownerAuthService.getToken();
        const adminToken = this.adminAuthService.getToken();
        if (this.isOwnerPortal) {
            return ownerToken || adminToken;
        }
        return adminToken || ownerToken;
    }

    private preloadOtherTypes(): void {
        (['blog', 'services', 'portfolio'] as CmsType[]).forEach((type) => {
            if (type === this.currentType()) return;
            this.prefetchList(type);
        });
    }

    private prefetchList(type: CmsType): void {
        const token = this.getCmsToken();
        if (!token) return;
        const params = { page: '1', limit: String(this.pageSize) } as Record<string, string>;
        this.ownerContentService.listCms(type, token, params).subscribe({
            next: (res) => {
                this.listCache.set(type, {
                    items: Array.isArray(res?.items) ? res.items : [],
                    total: res?.total || 0
                });
            },
            error: () => {
                // no-op: prefetch failure should not block active list loading
            }
        });
    }

    private applyCachedList(type: CmsType): void {
        const cached = this.listCache.get(type);
        if (!cached) {
            this.items = [];
            this.totalItems = 0;
            return;
        }
        this.items = cached.items;
        this.totalItems = cached.total;
    }
}
