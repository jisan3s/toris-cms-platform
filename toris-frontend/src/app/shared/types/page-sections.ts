export interface ContentBannerSection {
    title?: string;
    subtitle?: string;
}

export interface CtaSection {
    title?: string;
    subtitle?: string;
    buttonText?: string;
    buttonLink?: string;
}

export interface HomeHeroSection {
    title?: string;
    subtitle?: string;
    description?: string;
    buttonText?: string;
    buttonLink?: string;
    image?: string;
}

export interface HomeClientSection {
    title?: string;
    logos?: string[];
}

export interface HomeAboutPreviewSection {
    heading?: string;
    description?: string;
    buttonText?: string;
    buttonLink?: string;
    image?: string;
}

export interface HomeWhyChooseSection {
    subtitle?: string;
    yearsExperience?: string;
    yearsExperienceLabel?: string;
    projectsCompleted?: string;
    projectsCompletedLabel?: string;
    clientSatisfaction?: string;
    clientSatisfactionLabel?: string;
}

export interface TestimonialItem {
    name?: string;
    position?: string;
    message?: string;
    photo?: string;
}

export interface PricingPlanItem {
    name?: string;
    price?: string;
    features?: string[];
    buttonText?: string;
    buttonLink?: string;
}

export interface HomeTestimonialsSection {
    heading?: string;
    items?: TestimonialItem[];
}

export interface HomePricingSection {
    heading?: string;
    plans?: PricingPlanItem[];
    buttonText?: string;
    buttonLink?: string;
}

export interface HomeServicesSection {
    heading?: string;
    subtitle?: string;
    sectionButtonText?: string;
    sectionButtonLink?: string;
}

export interface HomePortfolioSection {
    heading?: string;
    sectionButtonText?: string;
    sectionButtonLink?: string;
}

export interface HomeBlogSection {
    heading?: string;
}

export interface HomeSections {
    hero?: HomeHeroSection;
    clients?: HomeClientSection;
    'about-preview'?: HomeAboutPreviewSection;
    'why-choose'?: HomeWhyChooseSection;
    testimonials?: HomeTestimonialsSection;
    pricing?: HomePricingSection;
    services?: HomeServicesSection;
    portfolio?: HomePortfolioSection;
    blog?: HomeBlogSection;
    cta?: CtaSection;
}

export interface AboutOverviewSection {
    image?: string;
    title?: string;
    description1?: string;
    description2?: string;
}

export interface AboutMissionVisionSection {
    missionTitle?: string;
    missionText?: string;
    visionTitle?: string;
    visionText?: string;
}

export interface AboutWhyChooseSection {
    title?: string;
    cardText?: string;
    items?: string[];
}

export interface StatItem {
    title?: string;
    label?: string;
}

export interface TeamPreviewItem {
    name?: string;
    position?: string;
    image?: string;
}

export interface AboutSections {
    banner?: ContentBannerSection;
    overview?: AboutOverviewSection;
    'mission-vision'?: AboutMissionVisionSection;
    'why-choose'?: AboutWhyChooseSection;
    stats?: { items?: StatItem[] };
    'team-preview'?: { title?: string; items?: TeamPreviewItem[] };
    cta?: CtaSection;
}

export interface ContactInfoSection {
    addressTitle?: string;
    address?: string;
    emailTitle?: string;
    email?: string;
    phoneTitle?: string;
    phone?: string;
}

export interface ContactSections {
    banner?: ContentBannerSection;
    info?: ContactInfoSection;
    cta?: CtaSection;
}

export interface FaqItem {
    question?: string;
    answer?: string;
}

export interface FaqSections {
    banner?: ContentBannerSection;
    faqs?: { items?: FaqItem[] };
    cta?: CtaSection;
}

export interface PricingSections {
    banner?: ContentBannerSection;
    plans?: { items?: PricingPlanItem[] };
    cta?: CtaSection;
}

export interface TestimonialsSections {
    banner?: ContentBannerSection;
    items?: { items?: TestimonialItem[] };
    cta?: CtaSection;
}

export interface BlogSections {
    'page-banner'?: ContentBannerSection;
    pagination?: {
        previousText?: string;
        nextText?: string;
    };
    cta?: CtaSection;
}

export interface PortfolioSections {
    hero?: ContentBannerSection;
    pagination?: {
        previousText?: string;
        nextText?: string;
    };
}

export interface ServicesPageSections {
    banner?: ContentBannerSection;
    pagination?: {
        previousText?: string;
        nextText?: string;
    };
}

export interface ServiceDetailsSections {
    features?: {
        title?: string;
        itemDescription?: string;
    };
    media?: {
        detailFallbackImage?: string;
    };
    cta?: CtaSection;
}

export interface BlogDetailsSections {
    media?: {
        detailFallbackImage?: string;
    };
    empty?: {
        message?: string;
    };
}

export interface PortfolioDetailsSections {
    media?: {
        detailFallbackImage?: string;
    };
    empty?: {
        message?: string;
    };
}

export interface TeamMemberItem {
    name?: string;
    role?: string;
    image?: string;
}

export interface TeamSections {
    banner?: ContentBannerSection;
    members?: { items?: TeamMemberItem[] };
    cta?: CtaSection;
}

export interface CareerJobItem {
    title?: string;
    location?: string;
    type?: string;
    applyText?: string;
    applyLink?: string;
}

export interface CareersSections {
    banner?: ContentBannerSection;
    jobs?: {
        items?: CareerJobItem[];
    };
}

export interface PolicySections {
    banner?: { title?: string };
    content?: { body?: string };
}
