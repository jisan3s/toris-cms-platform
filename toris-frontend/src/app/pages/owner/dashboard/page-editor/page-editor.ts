import { ChangeDetectorRef, Component, DestroyRef, OnInit, inject } from '@angular/core';
import { FormArray, FormBuilder, FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { OwnerAuthService } from '../../../../services/owner-auth';
import { AdminAuthService } from '../../../../services/admin-auth';
import { OwnerContentService, SiteSectionRow } from '../../../../services/owner-content';
import { ManagedField, ManagedPage, ManagedSection, managedNonCmsPageMap } from './managed-pages';
import { RichTextEditorComponent } from '../../../../shared/components/rich-text-editor/rich-text-editor';
import { applyDeferredViewUpdate } from '../../../../shared/utils/view-state';
import { NotificationService } from '../../../../shared/services/notification.service';

type SectionData = Record<string, unknown>;
type RouteSuggestion = { label: string; path: string };

@Component({
    selector: 'app-page-editor',
    imports: [ReactiveFormsModule, RichTextEditorComponent],
    templateUrl: './page-editor.html',
    styleUrl: './page-editor.scss',
})
export class PageEditor implements OnInit {
    private static readonly CORE_PUBLIC_ROUTES: RouteSuggestion[] = [
        { label: 'Home', path: '/' },
        { label: 'Services', path: '/services' },
        { label: 'Portfolio', path: '/portfolio' },
        { label: 'Contact', path: '/contact' },
        { label: 'Blog', path: '/blog' }
    ];
    private readonly destroyRef = inject(DestroyRef);
    token = '';
    isOwnerPortal = false;
    pageKey = '';
    pageConfig?: ManagedPage;
    sections: ManagedSection[] = [];
    activeSection = '';
    sectionMessage = '';
    sectionError = '';
    isSaving = false;
    formReady = false;
    sectionForm!: FormGroup;
    uploadError = '';
    readonly uploadState: Record<string, boolean> = {};
    navRouteSuggestions: RouteSuggestion[] = [];
    private sectionLoadRetryCount = 0;
    private readonly maxSectionLoadRetries = 5;

    constructor(
        private fb: FormBuilder,
        private ownerAuthService: OwnerAuthService,
        private adminAuthService: AdminAuthService,
        private ownerContentService: OwnerContentService,
        private route: ActivatedRoute,
        private router: Router,
        private cdr: ChangeDetectorRef,
        private notifications: NotificationService
    ) { }

    ngOnInit(): void {
        this.sectionForm = this.fb.group({});
        this.refreshAuthContext();

        this.route.data
            .pipe(takeUntilDestroyed(this.destroyRef))
            .subscribe((data) => {
                applyDeferredViewUpdate(this.cdr, () => {
                    this.refreshAuthContext();
                    this.pageKey = (data['pageKey'] || '').toLowerCase();
                    this.pageConfig = managedNonCmsPageMap[this.pageKey];
                    this.sections = this.pageConfig?.sections || [];
                    this.activeSection = this.sections[0]?.key || '';
                    this.navRouteSuggestions = this.buildNavRouteSuggestions();
                    this.formReady = false;
                    this.sectionMessage = '';
                    this.sectionError = '';
                    this.sectionLoadRetryCount = 0;
                    this.buildSectionForm();
                    this.loadSections();
                });
            });
    }

    setActiveSection(sectionKey: string): void {
        applyDeferredViewUpdate(this.cdr, () => {
            this.formReady = false;
            this.activeSection = sectionKey;
            this.sectionMessage = '';
            this.sectionError = '';
            this.uploadError = '';
            this.buildSectionForm();
        });
    }

    saveActiveSection(): void {
        this.refreshAuthContext();
        if (!this.token || !this.pageKey || !this.activeSection || !this.activeSectionConfig || !this.formReady) {
            this.notifications.notify('Please login first', 'warning');
            return;
        }

        const payload: SectionData = {};

        this.activeSectionConfig.fields.forEach((field) => {
            const control = this.sectionForm.get(field.key);
            let value = control?.value;

            if (field.type === 'string-list') {
                value = (value || []).map((item: string) => String(item || '').trim()).filter(Boolean);
            }

            if (field.type === 'object-list') {
                const rows = Array.isArray(value) ? value : [];
                value = rows.map((row) => this.normalizeRow(row as Record<string, unknown>));
            }

            if (field.toPayloadValue) {
                value = field.toPayloadValue(value);
            }

            payload[field.key] = value;
        });

        this.isSaving = true;
        this.sectionError = '';
        this.sectionMessage = '';

        this.ownerContentService.saveSection(this.pageKey, this.activeSection, payload, this.token).subscribe({
            next: (res) => {
                this.sectionMessage = res?.message || 'Section saved successfully';
                this.notifications.notify(this.sectionMessage, 'success');
                this.isSaving = false;
                this.updateCurrentSectionData(payload);
            },
            error: (err) => {
                this.sectionError = err?.error?.message || 'Failed to save section';
                this.notifications.notify(this.sectionError, 'danger');
                this.isSaving = false;
            }
        });
    }

    get activeSectionConfig(): ManagedSection | undefined {
        return this.sections.find((item) => item.key === this.activeSection);
    }

    getStringListArray(fieldKey: string): FormArray {
        return this.sectionForm.get(fieldKey) as FormArray;
    }

    getObjectListArray(fieldKey: string): FormArray {
        return this.sectionForm.get(fieldKey) as FormArray;
    }

    hasControl(fieldKey: string): boolean {
        return !!this.sectionForm?.get(fieldKey);
    }

    addStringListItem(fieldKey: string): void {
        this.getStringListArray(fieldKey).push(this.fb.control(''));
    }

    removeStringListItem(fieldKey: string, index: number): void {
        this.getStringListArray(fieldKey).removeAt(index);
    }

    addObjectListItem(field: ManagedField): void {
        this.getObjectListArray(field.key).push(this.buildObjectRow(field, {}));
    }

    addNavItemSuggestion(suggestion: RouteSuggestion): void {
        if (!this.isGlobalHeaderEditor()) return;
        const row = this.fb.group({
            label: this.fb.control(suggestion.label),
            path: this.fb.control(suggestion.path)
        });
        this.getObjectListArray('items').push(row);
    }

    removeObjectListItem(fieldKey: string, index: number): void {
        this.getObjectListArray(fieldKey).removeAt(index);
    }

    isImageField(fieldKey: string, label = ''): boolean {
        const merged = `${fieldKey} ${label}`.toLowerCase();
        return ["image", "photo", "logo", "icon", "banner", "thumbnail", "avatar"].some((key) => merged.includes(key));
    }

    onImageSelected(fieldKey: string, event: Event): void {
        const input = event.target as HTMLInputElement;
        const file = input?.files?.[0];
        if (!file) return;
        this.uploadError = '';
        this.uploadToCloudinary(file, `${this.pageKey}/${this.activeSection}`, fieldKey, (url) => {
            this.sectionForm.get(fieldKey)?.setValue(url);
        });
        input.value = '';
    }

    onObjectImageSelected(fieldKey: string, index: number, itemKey: string, event: Event): void {
        const input = event.target as HTMLInputElement;
        const file = input?.files?.[0];
        if (!file) return;
        this.uploadError = '';
        this.uploadToCloudinary(file, `${this.pageKey}/${this.activeSection}`, `${fieldKey}-${index}-${itemKey}`, (url) => {
            const row = this.getObjectListArray(fieldKey).at(index) as FormGroup;
            row.get(itemKey)?.setValue(url);
        });
        input.value = '';
    }

    isGlobalHeaderEditor(): boolean {
        return this.pageKey === 'global' && this.activeSection === 'header';
    }

    private loadSections(allowRetry = true): void {
        this.refreshAuthContext();
        if (!this.pageKey || !this.pageConfig) {
            return;
        }
        if (!this.token) {
            if (allowRetry && this.sectionLoadRetryCount < this.maxSectionLoadRetries) {
                this.sectionLoadRetryCount += 1;
                setTimeout(() => this.loadSections(allowRetry), 200);
            }
            return;
        }
        this.sectionLoadRetryCount = 0;

        this.ownerContentService.listSections(this.pageKey, this.token).subscribe({
            next: (rows) => {
                applyDeferredViewUpdate(this.cdr, () => {
                    const rowMap = (rows || []).reduce<Record<string, SectionData>>((acc, row: SiteSectionRow) => {
                        if (row?.section) {
                            acc[row.section] = (row.data || {}) as SectionData;
                        }
                        return acc;
                    }, {});

                    this.sections = this.pageConfig!.sections.map((section) => ({
                        ...section,
                        defaultData: {
                            ...section.defaultData,
                            ...(rowMap[section.key] || {})
                        }
                    }));

                    if (!this.activeSection && this.sections.length) {
                        this.activeSection = this.sections[0].key;
                    }
                    this.buildSectionForm();
                });
            },
            error: (err) => {
                if (allowRetry && this.useAlternateTokenIfAvailable(err)) {
                    this.loadSections(false);
                    return;
                }
                applyDeferredViewUpdate(this.cdr, () => {
                    this.sectionError = err?.error?.message || 'Failed to load page sections';
                });
            }
        });
    }

    private buildSectionForm(): void {
        const section = this.activeSectionConfig;
        if (!section) {
            this.sectionForm = this.fb.group({});
            this.formReady = false;
            return;
        }

        const group: Record<string, FormControl | FormArray> = {};

        section.fields.forEach((field) => {
            const baseValue = section.defaultData?.[field.key];
            const formValue = field.toFormValue ? field.toFormValue(baseValue) : baseValue;

            if (field.type === 'text' || field.type === 'textarea') {
                group[field.key] = this.fb.control(formValue ?? '');
                return;
            }

            if (field.type === 'string-list') {
                const list = Array.isArray(formValue) ? formValue : [];
                group[field.key] = this.fb.array(
                    (list.length ? list : ['']).map((item: string) => this.fb.control(String(item || '')))
                );
                return;
            }

            const rows = Array.isArray(formValue) ? formValue : [];
            group[field.key] = this.fb.array(
                (rows.length ? rows : [{}]).map((row) => this.buildObjectRow(field, (row || {}) as Record<string, unknown>))
            );
        });

        this.sectionForm = this.fb.group(group);
        this.formReady = true;
        this.sectionForm.updateValueAndValidity({ emitEvent: false });
        this.cdr.markForCheck();
    }

    private buildObjectRow(field: ManagedField, row: Record<string, unknown>): FormGroup {
        const controls: Record<string, FormControl> = {};
        (field.itemFields || []).forEach((itemField) => {
            controls[itemField.key] = this.fb.control(row[itemField.key] ?? '');
        });
        return this.fb.group(controls);
    }

    private normalizeRow(row: Record<string, unknown>): SectionData {
        const normalized: SectionData = {};
        Object.keys(row || {}).forEach((key) => {
            normalized[key] = typeof row[key] === 'string' ? row[key].trim() : row[key];
        });
        return normalized;
    }

    private buildNavRouteSuggestions(): RouteSuggestion[] {
        const managedPageSuggestions: RouteSuggestion[] = Object.keys(managedNonCmsPageMap)
            .filter((key) => key !== 'global' && !key.endsWith('-details'))
            .map((key) => managedNonCmsPageMap[key])
            .filter(Boolean)
            .map((page) => ({
                label: page.label,
                path: page.key === 'about' ? '/about' : `/${page.key}`
            }));

        const suggestions = [...PageEditor.CORE_PUBLIC_ROUTES, ...managedPageSuggestions];
        const seen = new Set<string>();
        return suggestions.filter((item) => {
            const pathKey = String(item.path || '').trim().toLowerCase();
            if (!pathKey || seen.has(pathKey)) return false;
            seen.add(pathKey);
            return true;
        });
    }

    private updateCurrentSectionData(payload: SectionData): void {
        const index = this.sections.findIndex((section) => section.key === this.activeSection);
        if (index === -1) return;
        this.sections[index] = {
            ...this.sections[index],
            defaultData: {
                ...this.sections[index].defaultData,
                ...payload
            }
        };
    }

    private getCmsToken(): string {
        const primary = this.isOwnerPortal ? this.ownerAuthService.getToken() : this.adminAuthService.getToken();
        if (primary) return primary;
        return this.isOwnerPortal ? this.adminAuthService.getToken() : this.ownerAuthService.getToken();
    }

    private getAlternateCmsToken(): string {
        return this.isOwnerPortal ? this.adminAuthService.getToken() : this.ownerAuthService.getToken();
    }

    private useAlternateTokenIfAvailable(err: any): boolean {
        const status = Number(err?.status || 0);
        const message = String(err?.error?.message || '').toLowerCase();
        const isAuthFailure = status === 401 || message.includes('not authorized');
        if (!isAuthFailure) return false;

        const alternate = this.getAlternateCmsToken();
        if (!alternate || alternate === this.token) return false;

        this.token = alternate;
        return true;
    }

    private refreshAuthContext(): void {
        this.isOwnerPortal = this.router.url.startsWith('/owner/');
        this.token = this.getCmsToken();
    }

    private uploadToCloudinary(
        file: File,
        folder: string,
        uploadKey: string,
        onSuccess: (url: string) => void
    ): void {
        this.token = this.getCmsToken();
        if (!this.token) {
            this.uploadError = 'Please login first';
            return;
        }

        this.uploadState[uploadKey] = true;
        this.fileToDataUrl(file)
            .then((fileDataUrl) => {
                this.ownerContentService.uploadMedia(fileDataUrl, this.token, folder).subscribe({
                    next: (res) => {
                        this.uploadState[uploadKey] = false;
                        if (res?.secureUrl) {
                            onSuccess(res.secureUrl);
                        } else {
                            this.uploadError = 'Upload succeeded but no URL returned';
                        }
                    },
                    error: (err) => {
                        this.uploadState[uploadKey] = false;
                        this.uploadError = err?.error?.message || 'Image upload failed';
                    }
                });
            })
            .catch(() => {
                this.uploadState[uploadKey] = false;
                this.uploadError = 'Failed to read file';
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

}
