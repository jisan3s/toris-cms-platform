import { ChangeDetectorRef, Component, NgZone, OnInit } from '@angular/core';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Header } from "../../layouts/header/header";
import { Footer } from "../../layouts/footer/footer";
import { RouterLink } from '@angular/router';
import { SiteContentService } from '../../services/site-content';
import { ContactSections } from '../../shared/types/page-sections';
import { applyDeferredViewUpdate } from '../../shared/utils/view-state';
import { NotificationService } from '../../shared/services/notification.service';
import { RichTextPipe } from '../../shared/pipes/rich-text.pipe';
import { finalize, timeout } from 'rxjs';

@Component({
    selector: 'app-contact',
    imports: [RouterLink, FormsModule, ReactiveFormsModule, Header, Footer, RichTextPipe],
    templateUrl: './contact.html',
    styleUrl: './contact.scss',
})
export class Contact implements OnInit {

    contactForm: FormGroup;
    sections: ContactSections = {};
    isLoading = true;
    isSubmitting = false;
    loadError = '';
    ctaLink = '';

    constructor(
        private fb: FormBuilder,
        private siteContentService: SiteContentService,
        private ngZone: NgZone,
        private cdr: ChangeDetectorRef,
        private notifications: NotificationService
    ) {
        this.contactForm = this.fb.group({
            name: ['', Validators.required],
            email: ['', [Validators.required, Validators.email]],
            subject: ['', Validators.required],
            message: ['', Validators.required]
        });
    }

    ngOnInit(): void {
        this.siteContentService.getPageSectionsTyped<ContactSections>('contact').subscribe({
            next: (sections) => {
                applyDeferredViewUpdate(this.cdr, () => {
                    this.sections = sections || {};
                    this.ctaLink = this.normalizeLink(this.sections['cta']?.buttonLink);
                    this.isLoading = false;
                });
            },
            error: () => {
                applyDeferredViewUpdate(this.cdr, () => {
                    this.loadError = 'Failed to load Contact content.';
                    this.isLoading = false;
                });
            }
        });
    }

    submitForm() {
        if (!this.contactForm.valid || this.isSubmitting) {
            return;
        }

        const payload = {
            name: String(this.contactForm.value.name || '').trim(),
            email: String(this.contactForm.value.email || '').trim().toLowerCase(),
            subject: String(this.contactForm.value.subject || '').trim(),
            message: String(this.contactForm.value.message || '').trim()
        };

        this.contactForm.reset();
        this.notifications.notify('Sending your message...', 'info', 2000);
        this.cdr.detectChanges();

        this.isSubmitting = true;
        this.siteContentService
            .submitContact(payload)
            .pipe(
                timeout(15000),
                finalize(() => {
                    this.ngZone.run(() => {
                        this.isSubmitting = false;
                        this.cdr.detectChanges();
                    });
                })
            )
            .subscribe({
                next: (res) => {
                    this.ngZone.run(() => {
                        this.notifications.notify(res?.message || 'Form submitted successfully!', 'success');
                        this.cdr.detectChanges();
                    });
                },
                error: (error) => {
                    this.ngZone.run(() => {
                        this.notifications.notify(
                            error?.error?.message || 'Failed to submit form. Please try again.',
                            'danger'
                        );
                        this.cdr.detectChanges();
                    });
                }
            });
    }

    isExternalCtaLink(): boolean {
        return /^(https?:)?\/\//i.test(this.ctaLink);
    }

    private normalizeLink(value: unknown): string {
        const raw = String(value || '').trim();
        if (!raw) return '';
        if (/^(https?:)?\/\//i.test(raw) || raw.startsWith('mailto:') || raw.startsWith('tel:') || raw.startsWith('#')) {
            return raw;
        }
        return raw.startsWith('/') ? raw : `/${raw}`;
    }

}
