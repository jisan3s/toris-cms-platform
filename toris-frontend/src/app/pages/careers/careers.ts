import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { Header } from "../../layouts/header/header";
import { Footer } from "../../layouts/footer/footer";
import { RouterLink } from '@angular/router';
import { SiteContentService } from '../../services/site-content';
import { CareerJobItem, CareersSections } from '../../shared/types/page-sections';
import { applyDeferredViewUpdate } from '../../shared/utils/view-state';
import { RichTextPipe } from '../../shared/pipes/rich-text.pipe';

@Component({
    selector: 'app-careers',
    imports: [RouterLink, Header, Footer, RichTextPipe],
    templateUrl: './careers.html',
    styleUrl: './careers.scss',
})
export class Careers implements OnInit {
    sections: CareersSections = {};
    isLoading = true;
    loadError = '';

    constructor(
        private siteContentService: SiteContentService,
        private cdr: ChangeDetectorRef
    ) { }

    ngOnInit(): void {
        this.siteContentService.getPageSectionsTyped<CareersSections>('careers').subscribe({
            next: (sections) => {
                applyDeferredViewUpdate(this.cdr, () => {
                    this.sections = sections || {};
                    this.isLoading = false;
                });
            },
            error: () => {
                applyDeferredViewUpdate(this.cdr, () => {
                    this.loadError = 'Failed to load Careers content.';
                    this.isLoading = false;
                });
            }
        });
    }

    getApplyText(job: CareerJobItem): string {
        return String(job?.applyText || '').trim();
    }

    getApplyLink(job: CareerJobItem): string {
        return this.normalizeLink(job?.applyLink);
    }

    hasApplyLink(job: CareerJobItem): boolean {
        return !!this.getApplyLink(job);
    }

    isExternalApplyLink(job: CareerJobItem): boolean {
        return /^(https?:)?\/\//i.test(this.getApplyLink(job));
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
