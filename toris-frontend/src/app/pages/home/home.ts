import { ChangeDetectorRef, Component } from '@angular/core';
import { Header } from "../../layouts/header/header";
import { Footer } from "../../layouts/footer/footer";
import { RouterLink } from '@angular/router';
import { SiteContentService } from '../../services/site-content';
import { resolveMediaUrl } from '../../shared/utils/media-url';
import { HomeHeroSection, HomeSections, PricingPlanItem, PricingSections, TestimonialItem, TestimonialsSections } from '../../shared/types/page-sections';
import { applyDeferredViewUpdate } from '../../shared/utils/view-state';
import { RichTextPipe } from '../../shared/pipes/rich-text.pipe';
import { ServiceCmsItem, ServicesCmsService } from '../../services/services-cms';
import { PortfolioCmsItem, PortfolioCmsService } from '../../services/portfolio-cms';
import { BlogCmsItem, BlogCmsService } from '../../services/blog-cms';

@Component({
    selector: 'app-home',
    standalone: true,
    imports: [RouterLink, Header, Footer, RichTextPipe],
    templateUrl: './home.html',
    styleUrl: './home.scss',
})
export class Home {
    banner: HomeHeroSection = {
        title: '',
        subtitle: '',
        description: '',
        buttonText: '',
        buttonLink: '',
        image: ''
    };
    homeSections: HomeSections = {
        hero: { ...this.banner },
        clients: { title: '', logos: [] },
        'about-preview': { heading: '', description: '', buttonText: '', image: '' },
        'why-choose': {
            subtitle: '',
            yearsExperience: '',
            yearsExperienceLabel: '',
            projectsCompleted: '',
            projectsCompletedLabel: '',
            clientSatisfaction: '',
            clientSatisfactionLabel: ''
        },
        testimonials: { heading: '', items: [] },
        pricing: { heading: '', plans: [], buttonText: '', buttonLink: '' },
        services: { heading: '', subtitle: '', sectionButtonText: '', sectionButtonLink: '' },
        portfolio: { heading: '', sectionButtonText: '', sectionButtonLink: '' },
        blog: { heading: '' },
        cta: { title: '', buttonText: '', buttonLink: '' }
    };
    services: ServiceCmsItem[] = [];
    portfolioItems: PortfolioCmsItem[] = [];
    blogItems: BlogCmsItem[] = [];
    pricingPageSections: PricingSections = {};
    testimonialsPageSections: TestimonialsSections = {};
    isLoading = true;
    loadError = '';

    get heroHasContent(): boolean {
        return Boolean(
            this.banner.title ||
            this.banner.subtitle ||
            this.banner.description ||
            this.banner.buttonText ||
            this.banner.image
        );
    }

    get clientsHasContent(): boolean {
        return Boolean(
            this.homeSections.clients?.title ||
            this.clientLogos.length
        );
    }

    get hasAboutPreviewContent(): boolean {
        const section = this.homeSections['about-preview'];
        return Boolean(
            section?.heading ||
            section?.description ||
            section?.buttonText ||
            section?.image
        );
    }

    get whyChooseHasContent(): boolean {
        const section = this.homeSections['why-choose'];
        return Boolean(
            section?.subtitle ||
            section?.yearsExperience ||
            section?.yearsExperienceLabel ||
            section?.projectsCompleted ||
            section?.projectsCompletedLabel ||
            section?.clientSatisfaction ||
            section?.clientSatisfactionLabel
        );
    }

    get testimonialsHasContent(): boolean {
        return this.testimonialItems.length > 0;
    }

    get pricingHasContent(): boolean {
        return this.pricingPlans.length > 0;
    }

    get ctaHasContent(): boolean {
        const section = this.homeSections?.cta;
        return Boolean(section?.title || section?.buttonText || section?.buttonLink);
    }

    constructor(
        private siteContentService: SiteContentService,
        private servicesCmsService: ServicesCmsService,
        private portfolioCmsService: PortfolioCmsService,
        private blogCmsService: BlogCmsService,
        private cdr: ChangeDetectorRef
    ) { }

    ngOnInit(): void {
        this.siteContentService.getPageSectionsTyped<HomeSections>('home').subscribe({
            next: (sections) => {
                applyDeferredViewUpdate(this.cdr, () => {
                    const hero = sections?.hero || {};
                    this.homeSections = sections || {};
                    this.banner = { ...hero };
                    this.isLoading = false;
                });
            },
            error: () => {
                applyDeferredViewUpdate(this.cdr, () => {
                    this.loadError = 'Failed to load Home content.';
                    this.isLoading = false;
                });
            }
        });

        this.servicesCmsService.listPublished().subscribe((items) => {
            applyDeferredViewUpdate(this.cdr, () => {
                this.services = (items || []).slice(0, 6);
            });
        });

        this.portfolioCmsService.listPublished().subscribe((items) => {
            applyDeferredViewUpdate(this.cdr, () => {
                this.portfolioItems = (items || []).slice(0, 3);
            });
        });

        this.blogCmsService.listPublished(1, 3).subscribe((res) => {
            applyDeferredViewUpdate(this.cdr, () => {
                this.blogItems = (res?.items || []).slice(0, 3);
            });
        });

        this.siteContentService.getPageSectionsTyped<PricingSections>('pricing').subscribe((sections) => {
            applyDeferredViewUpdate(this.cdr, () => {
                this.pricingPageSections = sections || {};
            });
        });

        this.siteContentService.getPageSectionsTyped<TestimonialsSections>('testimonials').subscribe((sections) => {
            applyDeferredViewUpdate(this.cdr, () => {
                this.testimonialsPageSections = sections || {};
            });
        });
    }

    get bannerImage(): string {
        const image = this.banner?.image;
        return resolveMediaUrl(image || '');
    }

    get aboutPreviewImage(): string {
        const image = this.homeSections['about-preview']?.image;
        return resolveMediaUrl(image || '');
    }

    get aboutPreviewButtonLink(): string {
        return this.normalizeLink(this.homeSections['about-preview']?.buttonLink) || '/about';
    }

    get isAboutPreviewButtonExternal(): boolean {
        return this.isExternalLink(this.aboutPreviewButtonLink);
    }

    get clientLogos(): string[] {
        const logos = this.homeSections.clients?.logos;
        if (!Array.isArray(logos)) {
            return [];
        }
        return logos
            .map((logo: string) => resolveMediaUrl(logo))
            .filter(Boolean);
    }

    get testimonialItems(): TestimonialItem[] {
        const homeItems = Array.isArray(this.homeSections.testimonials?.items) ? this.homeSections.testimonials?.items || [] : [];
        const source = homeItems.length
            ? homeItems
            : (Array.isArray(this.testimonialsPageSections?.items?.items) ? this.testimonialsPageSections?.items?.items || [] : []);
        return source.map((item) => ({
            ...item,
            photo: resolveMediaUrl(item?.photo || '')
        }));
    }

    get testimonialsHeading(): string {
        return String(this.homeSections?.testimonials?.heading || this.testimonialsPageSections?.banner?.title || '').trim();
    }

    get pricingPlans(): PricingPlanItem[] {
        const homePlans = Array.isArray(this.homeSections.pricing?.plans) ? this.homeSections.pricing?.plans || [] : [];
        if (homePlans.length) return homePlans;
        const pagePlans = this.pricingPageSections?.plans?.items;
        return Array.isArray(pagePlans) ? pagePlans : [];
    }

    get bannerButtonLink(): string {
        return this.normalizeLink(this.banner?.buttonLink);
    }

    get isBannerButtonExternal(): boolean {
        return this.isExternalLink(this.bannerButtonLink);
    }

    get homeCtaButtonLink(): string {
        return this.normalizeLink(this.homeSections?.cta?.buttonLink);
    }

    get isHomeCtaExternal(): boolean {
        return this.isExternalLink(this.homeCtaButtonLink);
    }

    get servicesHeading(): string {
        return String(this.homeSections?.services?.heading || '').trim();
    }

    get servicesSubtitle(): string {
        return String(this.homeSections?.services?.subtitle || '').trim();
    }

    get servicesSectionButtonText(): string {
        return String(this.homeSections?.services?.sectionButtonText || '').trim();
    }

    get servicesSectionButtonLink(): string {
        return this.normalizeLink(this.homeSections?.services?.sectionButtonLink) || '/services';
    }

    get isServicesSectionButtonExternal(): boolean {
        return this.isExternalLink(this.servicesSectionButtonLink);
    }

    get portfolioHeading(): string {
        return String(this.homeSections?.portfolio?.heading || '').trim();
    }

    get portfolioSectionButtonText(): string {
        return String(this.homeSections?.portfolio?.sectionButtonText || '').trim();
    }

    get portfolioSectionButtonLink(): string {
        return this.normalizeLink(this.homeSections?.portfolio?.sectionButtonLink) || '/portfolio';
    }

    get isPortfolioSectionButtonExternal(): boolean {
        return this.isExternalLink(this.portfolioSectionButtonLink);
    }

    get blogHeading(): string {
        return String(this.homeSections?.blog?.heading || '').trim();
    }

    getPricingPlanButtonText(plan: PricingPlanItem): string {
        return String(plan?.buttonText || '').trim();
    }

    getPricingPlanButtonLink(plan: PricingPlanItem): string {
        return this.normalizeLink(plan?.buttonLink);
    }

    isPricingPlanButtonExternal(plan: PricingPlanItem): boolean {
        return this.isExternalLink(this.getPricingPlanButtonLink(plan));
    }

    getServiceCardLink(item: ServiceCmsItem): string {
        return this.normalizeLink(`/service-details/${item.slug || ''}`);
    }

    getServiceCardButtonText(_item: ServiceCmsItem): string {
        return 'Read More';
    }

    getServiceIcon(item: ServiceCmsItem): string {
        return String(item?.icon || '').trim();
    }

    getServiceSummary(item: ServiceCmsItem): string {
        return String(item?.summary || '').trim();
    }

    getPortfolioImage(item: PortfolioCmsItem): string {
        return resolveMediaUrl(item?.image || '');
    }

    getPortfolioCardButtonText(item: PortfolioCmsItem): string {
        return String(item?.buttonText || 'View Details').trim() || 'View Details';
    }

    getBlogImage(item: BlogCmsItem): string {
        return resolveMediaUrl(item?.image || '');
    }

    getBlogCardButtonText(item: BlogCmsItem): string {
        return String(item?.buttonText || 'View Details').trim() || 'View Details';
    }

    getBlogCardButtonLink(item: BlogCmsItem): string {
        return this.normalizeLink(item?.buttonLink) || this.normalizeLink(`/blog/${item?.slug || ''}`);
    }

    isBlogCardButtonExternal(item: BlogCmsItem): boolean {
        return this.isExternalLink(this.getBlogCardButtonLink(item));
    }

    private normalizeLink(value: unknown): string {
        const raw = String(value || '').trim();
        if (!raw) return '';
        if (this.isExternalLink(raw)) return raw;
        const withLeadingSlash = raw.startsWith('/') ? raw : `/${raw}`;
        const compacted = withLeadingSlash.replace(/\/{2,}/g, '/').trim();
        const noTrailingSlash = compacted.length > 1 ? compacted.replace(/\/+$/g, '') : compacted;
        return noTrailingSlash.toLowerCase();
    }

    isExternalLink(path: string): boolean {
        return path.startsWith('http://')
            || path.startsWith('https://')
            || path.startsWith('mailto:')
            || path.startsWith('tel:')
            || path.startsWith('#');
    }
}
