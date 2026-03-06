import { ChangeDetectorRef, Component, DestroyRef, OnInit, inject } from '@angular/core';
import { Header } from '../../layouts/header/header';
import { Footer } from '../../layouts/footer/footer';
import { ActivatedRoute } from '@angular/router';
import { PortfolioCmsItem, PortfolioCmsService } from '../../services/portfolio-cms';
import { resolveMediaUrl } from '../../shared/utils/media-url';
import { applyDeferredViewUpdate } from '../../shared/utils/view-state';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { RichTextPipe } from '../../shared/pipes/rich-text.pipe';
import { SiteContentService } from '../../services/site-content';
import { PortfolioDetailsSections } from '../../shared/types/page-sections';

@Component({
    selector: 'app-portfolio-details',
    imports: [Header, Footer, RichTextPipe],
    templateUrl: './portfolio-details.html',
    styleUrl: './portfolio-details.scss',
})
export class PortfolioDetails implements OnInit {
    private readonly destroyRef = inject(DestroyRef);
    item: PortfolioCmsItem | null = null;
    bannerTitle = '';
    bannerSubtitle = '';
    sections: PortfolioDetailsSections = {};

    constructor(
        private portfolioService: PortfolioCmsService,
        private siteContentService: SiteContentService,
        private route: ActivatedRoute,
        private cdr: ChangeDetectorRef
    ) { }

    ngOnInit(): void {
        this.siteContentService.getPageSectionsTyped<PortfolioDetailsSections>('portfolio-details').subscribe((sections) => {
            applyDeferredViewUpdate(this.cdr, () => {
                this.sections = sections || {};
            });
        });

        this.route.paramMap
            .pipe(takeUntilDestroyed(this.destroyRef))
            .subscribe((params) => {
                const slug = String(params.get('slug') || '').trim().toLowerCase();
                this.loadItem(slug);
            });
    }

    get detailImage(): string {
        return resolveMediaUrl(this.item?.image || '');
    }

    getRelatedImage(item: PortfolioCmsItem): string {
        return resolveMediaUrl(item?.image || '');
    }

    private loadItem(slug: string): void {
        if (!slug) {
            applyDeferredViewUpdate(this.cdr, () => {
                this.item = null;
                this.bannerTitle = '';
                this.bannerSubtitle = '';
            });
            return;
        }

        this.portfolioService.getBySlug(slug).subscribe((entry) => {
            applyDeferredViewUpdate(this.cdr, () => {
                this.item = entry;
                this.bannerTitle = entry?.detailTitle || entry?.title || '';
                this.bannerSubtitle = entry?.summary || '';
            });
        });
    }
}
