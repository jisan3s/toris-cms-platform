import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { Header } from "../../layouts/header/header";
import { Footer } from "../../layouts/footer/footer";
import { RouterLink } from '@angular/router';
import { SiteContentService } from '../../services/site-content';
import { TestimonialItem, TestimonialsSections } from '../../shared/types/page-sections';
import { resolveMediaUrl } from '../../shared/utils/media-url';
import { applyDeferredViewUpdate } from '../../shared/utils/view-state';
import { RichTextPipe } from '../../shared/pipes/rich-text.pipe';

@Component({
    selector: 'app-testimonials',
    imports: [RouterLink, Header, Footer, RichTextPipe],
    templateUrl: './testimonials.html',
    styleUrl: './testimonials.scss',
})
export class Testimonials implements OnInit {
    sections: TestimonialsSections = {};
    isLoading = true;
    loadError = '';
    ctaLink = '';

    constructor(
        private siteContentService: SiteContentService,
        private cdr: ChangeDetectorRef
    ) { }

    ngOnInit(): void {
        this.siteContentService.getPageSectionsTyped<TestimonialsSections>('testimonials').subscribe({
            next: (sections) => {
                applyDeferredViewUpdate(this.cdr, () => {
                    this.sections = sections || {};
                    this.ctaLink = this.normalizeLink(this.sections['cta']?.buttonLink);
                    this.isLoading = false;
                });
            },
            error: () => {
                applyDeferredViewUpdate(this.cdr, () => {
                    this.loadError = 'Failed to load Testimonials content.';
                    this.isLoading = false;
                });
            }
        });
    }

    get testimonialItems(): TestimonialItem[] {
        const items = this.sections['items']?.items;
        if (!Array.isArray(items)) {
            return [];
        }
        return items.map((item: TestimonialItem) => ({
            ...item,
            photo: resolveMediaUrl(item?.photo || '')
        }));
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
