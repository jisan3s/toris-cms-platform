import { ChangeDetectorRef, Component, DestroyRef, OnInit, inject } from '@angular/core';
import { Header } from "../../layouts/header/header";
import { Footer } from "../../layouts/footer/footer";
import { ActivatedRoute } from '@angular/router';
import { BlogCmsItem, BlogCmsService } from '../../services/blog-cms';
import { resolveMediaUrl } from '../../shared/utils/media-url';
import { applyDeferredViewUpdate } from '../../shared/utils/view-state';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { RichTextPipe } from '../../shared/pipes/rich-text.pipe';
import { SiteContentService } from '../../services/site-content';
import { BlogDetailsSections } from '../../shared/types/page-sections';

@Component({
    selector: 'app-blog-details',
    imports: [Header, Footer, RichTextPipe],
    templateUrl: './blog-details.html',
    styleUrl: './blog-details.scss',
})
export class BlogDetails implements OnInit {
    private readonly destroyRef = inject(DestroyRef);
    post: BlogCmsItem | null = null;
    bannerTitle = '';
    bannerSubtitle = '';
    sections: BlogDetailsSections = {};

    constructor(
        private blogCmsService: BlogCmsService,
        private siteContentService: SiteContentService,
        private route: ActivatedRoute,
        private cdr: ChangeDetectorRef
    ) { }

    ngOnInit(): void {
        this.siteContentService.getPageSectionsTyped<BlogDetailsSections>('blog-details').subscribe((sections) => {
            applyDeferredViewUpdate(this.cdr, () => {
                this.sections = sections || {};
            });
        });

        this.route.paramMap
            .pipe(takeUntilDestroyed(this.destroyRef))
            .subscribe((params) => {
                const slug = String(params.get('slug') || '').trim().toLowerCase();
                this.loadPost(slug);
            });
    }

    get detailImage(): string | null {
        const image = this.post?.image || '';
        return image ? resolveMediaUrl(image) : null;
    }

    getRelatedImage(item: BlogCmsItem): string | null {
        const image = item.image || '';
        return image ? resolveMediaUrl(image) : null;
    }

    private loadPost(slug: string): void {
        if (!slug) {
            applyDeferredViewUpdate(this.cdr, () => {
                this.post = null;
                this.bannerTitle = '';
                this.bannerSubtitle = '';
            });
            return;
        }

        this.blogCmsService.getBySlug(slug).subscribe((item) => {
            applyDeferredViewUpdate(this.cdr, () => {
                this.post = item;
                this.bannerTitle = item?.detailTitle || item?.title || '';
                this.bannerSubtitle = item?.summary || '';
            });
        });
    }
}
