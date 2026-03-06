import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { Footer } from "../../layouts/footer/footer";
import { Header } from "../../layouts/header/header";
import { RouterLink } from '@angular/router';
import { ServiceCmsItem, ServicesCmsService } from '../../services/services-cms';
import { applyDeferredViewUpdate } from '../../shared/utils/view-state';
import { RichTextPipe } from '../../shared/pipes/rich-text.pipe';
import { SiteContentService } from '../../services/site-content';
import { ServicesPageSections } from '../../shared/types/page-sections';

@Component({
    selector: 'app-services',
    imports: [RouterLink, Header, Footer, RichTextPipe],
    templateUrl: './services.html',
    styleUrl: './services.scss',
})
export class Services implements OnInit {
    services: ServiceCmsItem[] = [];
    pageSize = 6;
    currentPage = 1;
    sections: ServicesPageSections = {};

    constructor(
        private servicesCmsService: ServicesCmsService,
        private siteContentService: SiteContentService,
        private cdr: ChangeDetectorRef
    ) { }

    ngOnInit(): void {
        this.siteContentService.getPageSectionsTyped<ServicesPageSections>('services').subscribe((sections) => {
            applyDeferredViewUpdate(this.cdr, () => {
                this.sections = sections || {};
            });
        });

        this.servicesCmsService.listPublished().subscribe((items) => {
            applyDeferredViewUpdate(this.cdr, () => {
                this.services = items;
                this.currentPage = 1;
            });
        });
    }

    get displayedServices(): ServiceCmsItem[] {
        const start = (this.currentPage - 1) * this.pageSize;
        return this.services.slice(start, start + this.pageSize);
    }

    get totalPages(): number {
        return Math.max(1, Math.ceil(this.services.length / this.pageSize));
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

    getServiceCtaText(_service: ServiceCmsItem): string {
        return 'Read More';
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
}
