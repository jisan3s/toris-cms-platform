import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Header } from '../../layouts/header/header';
import { Footer } from '../../layouts/footer/footer';
import { SiteContentService } from '../../services/site-content';
import { FaqSections } from '../../shared/types/page-sections';
import { applyDeferredViewUpdate } from '../../shared/utils/view-state';
import { RichTextPipe } from '../../shared/pipes/rich-text.pipe';

@Component({
    selector: 'app-faq',
    imports: [RouterLink, Header, Footer, RichTextPipe],
    templateUrl: './faq.html',
    styleUrl: './faq.scss',
})
export class Faq implements OnInit {
    sections: FaqSections = {};
    isLoading = true;
    loadError = '';
    ctaLink = '';

    constructor(
        private siteContentService: SiteContentService,
        private cdr: ChangeDetectorRef
    ) { }

    ngOnInit(): void {
        this.siteContentService.getPageSectionsTyped<FaqSections>('faq').subscribe({
            next: (sections) => {
                applyDeferredViewUpdate(this.cdr, () => {
                    this.sections = sections || {};
                    this.ctaLink = this.normalizeLink(this.sections['cta']?.buttonLink);
                    this.isLoading = false;
                });
            },
            error: () => {
                applyDeferredViewUpdate(this.cdr, () => {
                    this.loadError = 'Failed to load FAQ content.';
                    this.isLoading = false;
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
