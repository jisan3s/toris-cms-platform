import { ChangeDetectorRef, Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Header } from '../../layouts/header/header';
import { Footer } from '../../layouts/footer/footer';
import { SiteContentService } from '../../services/site-content';
import { applyDeferredViewUpdate } from '../../shared/utils/view-state';
import { BlogCmsItem, BlogCmsService } from '../../services/blog-cms';
import { resolveMediaUrl } from '../../shared/utils/media-url';
import { RichTextPipe } from '../../shared/pipes/rich-text.pipe';
import { BlogSections } from '../../shared/types/page-sections';

@Component({
    selector: 'app-blog',
    imports: [RouterLink, Header, Footer, RichTextPipe],
    templateUrl: './blog.html',
    styleUrl: './blog.scss',
})
export class Blog {

    bannerTitle = '';
    bannerSubtitle = '';
    ctaTitle = '';
    ctaSubtitle = '';
    ctaButtonText = '';
    ctaButtonLink = '';
    sections: BlogSections = {};

    posts: BlogCmsItem[] = [];
    pageSize = 6;
    currentPage = 1;
    totalItems = 0;

    constructor(
        private siteContentService: SiteContentService,
        private cdr: ChangeDetectorRef,
        private blogCmsService: BlogCmsService
    ) { }

    ngOnInit(): void {
        this.siteContentService.getPageSectionsTyped<BlogSections>('blog').subscribe((sections) => {
            applyDeferredViewUpdate(this.cdr, () => {
                this.sections = sections || {};
                this.bannerTitle = sections['page-banner']?.title || '';
                this.bannerSubtitle = sections['page-banner']?.subtitle || '';
                this.ctaTitle = sections['cta']?.title || '';
                this.ctaSubtitle = sections['cta']?.subtitle || '';
                this.ctaButtonText = sections['cta']?.buttonText || '';
                this.ctaButtonLink = this.normalizeLink(sections['cta']?.buttonLink);
            });
        });

        this.loadPage(this.currentPage);
    }

    get displayedPosts(): BlogCmsItem[] {
        return this.posts;
    }

    get totalPages(): number {
        return Math.max(1, Math.ceil(this.totalItems / this.pageSize));
    }

    get paginationSteps(): number[] {
        return Array.from({ length: this.totalPages }, (_, index) => index + 1);
    }

    goToPage(page: number): void {
        if (page < 1 || page > this.totalPages) return;
        this.loadPage(page);
    }

    nextPage(): void {
        if (this.currentPage < this.totalPages) {
            this.loadPage(this.currentPage + 1);
        }
    }

    prevPage(): void {
        if (this.currentPage > 1) {
            this.loadPage(this.currentPage - 1);
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

    private loadPage(page: number): void {
        const targetPage = Math.max(1, page);
        this.blogCmsService.listPublished(targetPage, this.pageSize).subscribe((response) => {
            applyDeferredViewUpdate(this.cdr, () => {
                this.posts = response.items || [];
                this.totalItems = response.total || 0;
                this.currentPage = response.page || targetPage;
                this.scrollTop();
            });
        });
    }

    getPostImage(post: BlogCmsItem): string {
        return resolveMediaUrl(post.image || '');
    }

    getPostButtonText(post: BlogCmsItem): string {
        return String(post?.buttonText || 'View Details').trim() || 'View Details';
    }

    getPostButtonLink(post: BlogCmsItem): string {
        const fallback = `/blog/${post?.slug || ''}`;
        return this.normalizeLink(post?.buttonLink) || fallback;
    }

    isExternalPostLink(post: BlogCmsItem): boolean {
        return /^(https?:)?\/\//i.test(this.getPostButtonLink(post));
    }

    private normalizeLink(value: unknown): string {
        const raw = String(value || '').trim();
        if (!raw) return '';
        if (/^(https?:)?\/\//i.test(raw) || raw.startsWith('mailto:') || raw.startsWith('tel:') || raw.startsWith('#')) {
            return raw;
        }
        return raw.startsWith('/') ? raw : `/${raw}`;
    }

    isExternalCtaLink(): boolean {
        return /^(https?:)?\/\//i.test(this.ctaButtonLink);
    }

}
