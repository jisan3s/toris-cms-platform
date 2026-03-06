import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { Header } from "../../layouts/header/header";
import { Footer } from "../../layouts/footer/footer";
import { RouterLink } from '@angular/router';
import { SiteContentService } from '../../services/site-content';
import { PricingSections } from '../../shared/types/page-sections';
import { applyDeferredViewUpdate } from '../../shared/utils/view-state';
import { RichTextPipe } from '../../shared/pipes/rich-text.pipe';

@Component({
    selector: 'app-pricing',
    imports: [RouterLink, Header, Footer, RichTextPipe],
    templateUrl: './pricing.html',
    styleUrl: './pricing.scss',
})
export class Pricing implements OnInit {
    sections: PricingSections = {};
    isLoading = true;
    loadError = '';
    ctaLink = '';

    constructor(
        private siteContentService: SiteContentService,
        private cdr: ChangeDetectorRef
    ) { }

    ngOnInit(): void {
        this.siteContentService.getPageSectionsTyped<PricingSections>('pricing').subscribe({
            next: (sections) => {
                applyDeferredViewUpdate(this.cdr, () => {
                    this.sections = sections || {};
                    this.ctaLink = this.normalizeLink(this.sections['cta']?.buttonLink);
                    this.isLoading = false;
                });
            },
            error: () => {
                applyDeferredViewUpdate(this.cdr, () => {
                    this.loadError = 'Failed to load Pricing content.';
                    this.isLoading = false;
                });
            }
        });
    }

    getPlanButtonText(plan: { buttonText?: string }): string {
        return String(plan?.buttonText || '').trim();
    }

    getPlanButtonLink(plan: { buttonLink?: string }): string {
        return this.normalizeLink(plan?.buttonLink);
    }

    isExternalLink(link: string): boolean {
        return /^(https?:)?\/\//i.test(String(link || '').trim());
    }

    isExternalCtaLink(): boolean {
        return this.isExternalLink(this.ctaLink);
    }

    private normalizeLink(value: unknown): string {
        const raw = String(value || '').trim();
        if (!raw) return '';
        if (this.isExternalLink(raw) || raw.startsWith('mailto:') || raw.startsWith('tel:') || raw.startsWith('#')) {
            return raw;
        }
        return raw.startsWith('/') ? raw : `/${raw}`;
    }
}
