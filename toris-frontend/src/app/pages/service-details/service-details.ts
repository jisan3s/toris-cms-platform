import { ChangeDetectorRef, Component, DestroyRef, OnInit, inject } from '@angular/core';
import { Header } from "../../layouts/header/header";
import { Footer } from "../../layouts/footer/footer";
import { ActivatedRoute } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { resolveMediaUrl } from '../../shared/utils/media-url';
import { ServiceCmsItem, ServicesCmsService } from '../../services/services-cms';
import { applyDeferredViewUpdate } from '../../shared/utils/view-state';
import { RichTextPipe } from '../../shared/pipes/rich-text.pipe';
import { SiteContentService } from '../../services/site-content';
import { ServiceDetailsSections } from '../../shared/types/page-sections';

@Component({
    selector: 'app-service-details',
    imports: [Header, Footer, RichTextPipe],
    templateUrl: './service-details.html',
    styleUrl: './service-details.scss',
})
export class ServiceDetails implements OnInit {
    private readonly destroyRef = inject(DestroyRef);
    service: ServiceCmsItem | null = null;
    bannerTitle = '';
    bannerSubtitle = '';
    sections: ServiceDetailsSections = {};

    constructor(
        private servicesCmsService: ServicesCmsService,
        private siteContentService: SiteContentService,
        private route: ActivatedRoute,
        private cdr: ChangeDetectorRef
    ) { }

    ngOnInit(): void {
        this.siteContentService.getPageSectionsTyped<ServiceDetailsSections>('service-details').subscribe((sections) => {
            applyDeferredViewUpdate(this.cdr, () => {
                this.sections = sections || {};
            });
        });

        this.route.paramMap
            .pipe(takeUntilDestroyed(this.destroyRef))
            .subscribe((params) => {
                const slug = String(params.get('slug') || '').trim().toLowerCase();
                this.loadService(slug);
            });
    }

    get detailImage(): string {
        return resolveMediaUrl(this.service?.image || '');
    }

    private loadService(slug: string): void {
        if (!slug) {
            applyDeferredViewUpdate(this.cdr, () => {
                this.service = null;
                this.bannerTitle = '';
                this.bannerSubtitle = '';
            });
            return;
        }

        this.servicesCmsService.getBySlug(slug).subscribe((item) => {
            applyDeferredViewUpdate(this.cdr, () => {
                this.service = item;
                this.bannerTitle = item?.title || '';
                this.bannerSubtitle = item?.summary || '';
            });
        });
    }
}
