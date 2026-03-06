import { Component, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { OwnerAuthService } from '../../../../services/owner-auth';
import { AdminAuthService } from '../../../../services/admin-auth';
import { HomePayload, OwnerContentService } from '../../../../services/owner-content';
import { NotificationService } from '../../../../shared/services/notification.service';
import { RichTextEditorComponent } from '../../../../shared/components/rich-text-editor/rich-text-editor';

@Component({
    selector: 'app-owner-home-editor',
    imports: [ReactiveFormsModule, RichTextEditorComponent],
    templateUrl: './home.html',
    styleUrl: './home.scss',
})
export class OwnerHomeEditor implements OnInit {
    form!: FormGroup;
    token = '';
    isOwnerPortal = false;
    activeSection: HomeSection = 'hero';
    sectionMessage = '';
    sectionError = '';
    uploadError = '';
    readonly uploadState: Record<string, boolean> = {};
    readonly sections: SectionMeta[] = [
        { key: 'hero', label: 'Hero' },
        { key: 'clients', label: 'Clients' },
        { key: 'about-preview', label: 'About Preview' },
        { key: 'why-choose', label: 'Why Choose' },
        { key: 'testimonials', label: 'Testimonials' },
        { key: 'pricing', label: 'Pricing' },
        { key: 'services', label: 'Services' },
        { key: 'portfolio', label: 'Portfolio' },
        { key: 'blog', label: 'Blog' },
        { key: 'cta', label: 'CTA' }
    ];
    readonly sectionSavingState: Record<HomeSection, boolean> = {
        hero: false,
        clients: false,
        'about-preview': false,
        'why-choose': false,
        testimonials: false,
        pricing: false,
        services: false,
        portfolio: false,
        blog: false,
        cta: false
    };

    constructor(
        private fb: FormBuilder,
        private ownerAuthService: OwnerAuthService,
        private adminAuthService: AdminAuthService,
        private ownerContentService: OwnerContentService,
        private router: Router,
        private notifications: NotificationService
    ) { }

    ngOnInit(): void {
        this.isOwnerPortal = this.router.url.startsWith('/owner/');
        this.token = this.getCmsToken();
        this.form = this.fb.group({
            heroTitle: ['', Validators.required],
            heroSubtitle: ['', Validators.required],
            heroDescription: ['', Validators.required],
            heroButtonText: [''],
            heroButtonLink: [''],
            heroImage: [''],
            clientsTitle: ['', Validators.required],
            clientsLogos: this.fb.array([this.fb.control('')]),
            aboutHeading: ['', Validators.required],
            aboutDescription: ['', Validators.required],
            aboutButtonText: [''],
            aboutButtonLink: [''],
            aboutImage: [''],
            whyChooseSubtitle: [''],
            yearsExperience: ['', Validators.required],
            yearsExperienceLabel: ['', Validators.required],
            projectsCompleted: ['', Validators.required],
            projectsCompletedLabel: ['', Validators.required],
            clientSatisfaction: ['', Validators.required],
            clientSatisfactionLabel: ['', Validators.required],
            testimonialsHeading: ['', Validators.required],
            pricingHeading: ['', Validators.required],
            servicesHeading: [''],
            servicesSubtitle: [''],
            servicesSectionButtonText: [''],
            servicesSectionButtonLink: [''],
            portfolioHeading: [''],
            portfolioSectionButtonText: [''],
            portfolioSectionButtonLink: [''],
            blogHeading: [''],
            ctaTitle: ['', Validators.required],
            ctaButtonText: ['', Validators.required],
            ctaButtonLink: ['']
        });

        if (!this.token) {
            return;
        }

        this.ownerContentService.getHomeContent(this.token).subscribe({
            next: (res) => {
                const hero = res?.hero || {};
                const sections = res?.sections || {};
                const about = sections['about-preview'] || {};
                const whyChoose = sections['why-choose'] || {};
                const clients = sections['clients'] || {};
                const testimonials = sections['testimonials'] || {};
                const pricing = sections['pricing'] || {};
                const services = sections['services'] || {};
                const portfolio = sections['portfolio'] || {};
                const blog = sections['blog'] || {};
                const cta = sections['cta'] || {};
                const clientLogos = Array.isArray(clients.logos) ? clients.logos : [];
                this.setClientLogos(clientLogos);

                this.form.patchValue({
                    heroTitle: hero.title || '',
                    heroSubtitle: hero.subtitle || '',
                    heroDescription: hero.description || '',
                    heroButtonText: hero.buttonText || '',
                    heroButtonLink: hero.buttonLink || '',
                    heroImage: hero.image || '',
                    clientsTitle: clients.title || '',
                    aboutHeading: about.heading || '',
                    aboutDescription: about.description || '',
                    aboutButtonText: about.buttonText || '',
                    aboutButtonLink: about.buttonLink || '',
                    aboutImage: about.image || '',
                    whyChooseSubtitle: whyChoose.subtitle || '',
                    yearsExperience: whyChoose.yearsExperience || '',
                    yearsExperienceLabel: whyChoose.yearsExperienceLabel || '',
                    projectsCompleted: whyChoose.projectsCompleted || '',
                    projectsCompletedLabel: whyChoose.projectsCompletedLabel || '',
                    clientSatisfaction: whyChoose.clientSatisfaction || '',
                    clientSatisfactionLabel: whyChoose.clientSatisfactionLabel || '',
                    testimonialsHeading: testimonials.heading || '',
                    pricingHeading: pricing.heading || '',
                    servicesHeading: services.heading || '',
                    servicesSubtitle: services.subtitle || '',
                    servicesSectionButtonText: services.sectionButtonText || '',
                    servicesSectionButtonLink: services.sectionButtonLink || '',
                    portfolioHeading: portfolio.heading || '',
                    portfolioSectionButtonText: portfolio.sectionButtonText || '',
                    portfolioSectionButtonLink: portfolio.sectionButtonLink || '',
                    blogHeading: blog.heading || '',
                    ctaTitle: cta.title || '',
                    ctaButtonText: cta.buttonText || '',
                    ctaButtonLink: cta.buttonLink || ''
                });
            },
            error: (err) => console.error('Failed to load homepage content:', err)
        });
    }

    private getCmsToken(): string {
        return this.isOwnerPortal ? this.ownerAuthService.getToken() : this.adminAuthService.getToken();
    }

    setActiveSection(section: HomeSection): void {
        this.activeSection = section;
        this.sectionMessage = '';
        this.sectionError = '';
        this.uploadError = '';
    }

    saveSection(section: HomeSection): void {
        if (this.isSectionInvalid(section)) {
            this.markSectionTouched(section);
            this.notifications.notify(`Please fix required fields in ${this.getSectionLabel(section)}.`, 'warning');
            return;
        }
        this.token = this.getCmsToken();
        if (!this.token) {
            this.notifications.notify('Please login first', 'warning');
            this.router.navigate([this.isOwnerPortal ? '/owner/login' : '/admin/login']);
            return;
        }

        const payload = this.buildSectionPayload(section);
        this.sectionSavingState[section] = true;
        this.sectionMessage = '';
        this.sectionError = '';

        this.ownerContentService.updateHomeContent(payload, this.token).subscribe({
            next: (res) => {
                this.sectionMessage = res.message || `${this.getSectionLabel(section)} section updated`;
                this.notifications.notify(this.sectionMessage, 'success');
                this.sectionSavingState[section] = false;
            },
            error: (err) => {
                this.sectionError = err?.error?.message || 'Failed to update homepage content';
                this.notifications.notify(this.sectionError, 'danger');
                this.sectionSavingState[section] = false;
            }
        });
    }

    isSectionInvalid(section: HomeSection): boolean {
        return this.getSectionControls(section).some((controlName) => this.form.get(controlName)?.invalid);
    }

    private markSectionTouched(section: HomeSection): void {
        this.getSectionControls(section).forEach((controlName) => {
            this.form.get(controlName)?.markAsTouched();
            this.form.get(controlName)?.markAsDirty();
        });
    }

    private getSectionControls(section: HomeSection): string[] {
        const controlsMap: Record<HomeSection, string[]> = {
            hero: ['heroTitle', 'heroSubtitle', 'heroDescription'],
            clients: ['clientsTitle'],
            'about-preview': ['aboutHeading', 'aboutDescription'],
            'why-choose': [
                'whyChooseSubtitle',
                'yearsExperience',
                'yearsExperienceLabel',
                'projectsCompleted',
                'projectsCompletedLabel',
                'clientSatisfaction',
                'clientSatisfactionLabel'
            ],
            testimonials: ['testimonialsHeading'],
            pricing: ['pricingHeading'],
            services: ['servicesHeading', 'servicesSubtitle', 'servicesSectionButtonText', 'servicesSectionButtonLink'],
            portfolio: ['portfolioHeading', 'portfolioSectionButtonText', 'portfolioSectionButtonLink'],
            blog: ['blogHeading'],
            cta: ['ctaTitle', 'ctaButtonText', 'ctaButtonLink']
        };

        return controlsMap[section];
    }

    onImageSelected(controlName: string, event: Event): void {
        const input = event.target as HTMLInputElement;
        const file = input?.files?.[0];
        if (!file) return;

        this.uploadError = '';
        this.uploadToCloudinary(file, `home/${this.activeSection}`, controlName, (url) => {
            this.form.get(controlName)?.setValue(url);
        });
        input.value = '';
    }

    onClientLogoSelected(index: number, event: Event): void {
        const input = event.target as HTMLInputElement;
        const file = input?.files?.[0];
        if (!file) return;

        this.uploadError = '';
        const uploadKey = `clientsLogo-${index}`;
        this.uploadToCloudinary(file, 'home/clients', uploadKey, (url) => {
            this.clientsLogos.at(index)?.setValue(url);
        });
        input.value = '';
    }

    private buildSectionPayload(section: HomeSection): HomePayload {
        const payload: HomePayload = {};

        if (section === 'hero') {
            payload.hero = {
                title: this.form.value.heroTitle,
                subtitle: this.form.value.heroSubtitle,
                description: this.form.value.heroDescription,
                buttonText: this.form.value.heroButtonText,
                buttonLink: this.normalizeLink(this.form.value.heroButtonLink),
                image: this.form.value.heroImage
            };
            return payload;
        }

        payload.sections = {};

        if (section === 'clients') {
            payload.sections.clients = {
                title: this.form.value.clientsTitle,
                logos: this.clientsLogos.controls
                    .map((control) => String(control.value || '').trim())
                    .filter(Boolean)
            };
        } else if (section === 'about-preview') {
            payload.sections['about-preview'] = {
                heading: this.form.value.aboutHeading,
                description: this.form.value.aboutDescription,
                buttonText: this.form.value.aboutButtonText,
                buttonLink: this.normalizeLink(this.form.value.aboutButtonLink),
                image: this.form.value.aboutImage
            };
        } else if (section === 'why-choose') {
            payload.sections['why-choose'] = {
                subtitle: this.form.value.whyChooseSubtitle,
                yearsExperience: this.form.value.yearsExperience,
                yearsExperienceLabel: this.form.value.yearsExperienceLabel,
                projectsCompleted: this.form.value.projectsCompleted,
                projectsCompletedLabel: this.form.value.projectsCompletedLabel,
                clientSatisfaction: this.form.value.clientSatisfaction,
                clientSatisfactionLabel: this.form.value.clientSatisfactionLabel
            };
        } else if (section === 'testimonials') {
            payload.sections.testimonials = { heading: this.form.value.testimonialsHeading };
        } else if (section === 'pricing') {
            payload.sections.pricing = {
                heading: this.form.value.pricingHeading
            };
        } else if (section === 'services') {
            payload.sections.services = {
                heading: this.form.value.servicesHeading,
                subtitle: this.form.value.servicesSubtitle,
                sectionButtonText: this.form.value.servicesSectionButtonText,
                sectionButtonLink: this.normalizeLink(this.form.value.servicesSectionButtonLink)
            };
        } else if (section === 'portfolio') {
            payload.sections.portfolio = {
                heading: this.form.value.portfolioHeading,
                sectionButtonText: this.form.value.portfolioSectionButtonText,
                sectionButtonLink: this.normalizeLink(this.form.value.portfolioSectionButtonLink)
            };
        } else if (section === 'blog') {
            payload.sections.blog = {
                heading: this.form.value.blogHeading
            };
        } else if (section === 'cta') {
            payload.sections.cta = {
                title: this.form.value.ctaTitle,
                buttonText: this.form.value.ctaButtonText,
                buttonLink: this.normalizeLink(this.form.value.ctaButtonLink)
            };
        }

        return payload;
    }

    private normalizeLink(value: unknown): string {
        const raw = String(value || '').trim();
        if (!raw) return '/';
        if (
            raw.startsWith('http://')
            || raw.startsWith('https://')
            || raw.startsWith('mailto:')
            || raw.startsWith('tel:')
            || raw.startsWith('#')
        ) {
            return raw;
        }
        const withLeadingSlash = raw.startsWith('/') ? raw : `/${raw}`;
        const compacted = withLeadingSlash.replace(/\/{2,}/g, '/').trim();
        const noTrailingSlash = compacted.length > 1 ? compacted.replace(/\/+$/g, '') : compacted;
        return noTrailingSlash.toLowerCase();
    }

    private getSectionLabel(section: HomeSection): string {
        return this.sections.find((item) => item.key === section)?.label || 'Section';
    }

    get clientsLogos(): FormArray<FormControl<string | null>> {
        return this.form.get('clientsLogos') as FormArray<FormControl<string | null>>;
    }

    addClientLogo(): void {
        this.clientsLogos.push(this.fb.control(''));
    }

    removeClientLogo(index: number): void {
        if (this.clientsLogos.length <= 1) {
            this.clientsLogos.at(0)?.setValue('');
            return;
        }
        this.clientsLogos.removeAt(index);
    }

    private setClientLogos(logos: string[]): void {
        const values = Array.isArray(logos) && logos.length ? logos : [''];
        const logoArray = this.fb.array(values.map((logo) => this.fb.control(String(logo || ''))));
        this.form.setControl('clientsLogos', logoArray);
    }

    private uploadToCloudinary(
        file: File,
        folder: string,
        uploadKey: string,
        onSuccess: (url: string) => void
    ): void {
        this.token = this.getCmsToken();
        if (!this.token) {
            this.uploadError = 'Please login first';
            return;
        }

        this.uploadState[uploadKey] = true;
        this.fileToDataUrl(file)
            .then((fileDataUrl) => {
                this.ownerContentService.uploadMedia(fileDataUrl, this.token, folder).subscribe({
                    next: (res) => {
                        this.uploadState[uploadKey] = false;
                        if (res?.secureUrl) {
                            onSuccess(res.secureUrl);
                        } else {
                            this.uploadError = 'Upload succeeded but no URL returned';
                        }
                    },
                    error: (err) => {
                        this.uploadState[uploadKey] = false;
                        this.uploadError = err?.error?.message || 'Image upload failed';
                    }
                });
            })
            .catch(() => {
                this.uploadState[uploadKey] = false;
                this.uploadError = 'Failed to read file';
            });
    }

    private fileToDataUrl(file: File): Promise<string> {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve(String(reader.result || ''));
            reader.onerror = () => reject(new Error('Failed to read file'));
            reader.readAsDataURL(file);
        });
    }
}

type HomeSection =
    | 'hero'
    | 'clients'
    | 'about-preview'
    | 'why-choose'
    | 'testimonials'
    | 'pricing'
    | 'services'
    | 'portfolio'
    | 'blog'
    | 'cta';

interface SectionMeta {
    key: HomeSection;
    label: string;
}
