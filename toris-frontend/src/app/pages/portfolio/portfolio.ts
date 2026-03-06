import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Header } from '../../layouts/header/header';
import { Footer } from '../../layouts/footer/footer';
import { SiteContentService } from '../../services/site-content';
import { applyDeferredViewUpdate } from '../../shared/utils/view-state';
import { PortfolioCmsItem, PortfolioCmsService } from '../../services/portfolio-cms';
import { resolveMediaUrl } from '../../shared/utils/media-url';
import { RichTextPipe } from '../../shared/pipes/rich-text.pipe';
import { PortfolioSections } from '../../shared/types/page-sections';

@Component({
    selector: 'app-portfolio',
    imports: [RouterLink, Header, Footer, RichTextPipe],
    templateUrl: './portfolio.html',
    styleUrl: './portfolio.scss',
})
export class Portfolio implements OnInit {

    heroTitle = '';
    heroSubtitle = '';
    sections: PortfolioSections = {};
    projects: PortfolioCmsItem[] = [];
    pageSize = 6;
    currentPage = 1;

    constructor(
        private siteContentService: SiteContentService,
        private cdr: ChangeDetectorRef,
        private portfolioService: PortfolioCmsService
    ) { }

    ngOnInit(): void {
        this.siteContentService.getPageSectionsTyped<PortfolioSections>('portfolio').subscribe((sections) => {
            applyDeferredViewUpdate(this.cdr, () => {
                this.sections = sections || {};
                this.heroTitle = sections['hero']?.title || '';
                this.heroSubtitle = sections['hero']?.subtitle || '';
            });
        });

        this.portfolioService.listPublished().subscribe((items) => {
            applyDeferredViewUpdate(this.cdr, () => {
                this.projects = items;
                this.currentPage = 1;
            });
        });
    }

    get displayedProjects(): PortfolioCmsItem[] {
        const start = (this.currentPage - 1) * this.pageSize;
        return this.projects.slice(start, start + this.pageSize);
    }

    get totalPages(): number {
        return Math.max(1, Math.ceil(this.projects.length / this.pageSize));
    }

    get paginationSteps(): number[] {
        return Array.from({ length: this.totalPages }, (_, index) => index + 1);
    }

    goToPage(page: number): void {
        if (page < 1 || page > this.totalPages) return;
        this.currentPage = page;
        this.scrollTop();
    }

    nextPage(): void {
        if (this.currentPage < this.totalPages) {
            this.currentPage += 1;
            this.scrollTop();
        }
    }

    prevPage(): void {
        if (this.currentPage > 1) {
            this.currentPage -= 1;
            this.scrollTop();
        }
    }

    private scrollTop(): void {
        if (typeof window === 'undefined') {
            return;
        }
        window.requestAnimationFrame(() => {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
    }

    getProjectImage(project: PortfolioCmsItem): string {
        return resolveMediaUrl(project.image || '');
    }

    getProjectButtonText(project: PortfolioCmsItem): string {
        return String(project?.buttonText || 'View Details').trim() || 'View Details';
    }

}
