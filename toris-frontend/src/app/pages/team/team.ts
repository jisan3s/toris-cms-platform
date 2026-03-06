import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Header } from '../../layouts/header/header';
import { Footer } from '../../layouts/footer/footer';
import { SiteContentService } from '../../services/site-content';
import { TeamMemberItem, TeamSections } from '../../shared/types/page-sections';
import { resolveMediaUrl } from '../../shared/utils/media-url';
import { applyDeferredViewUpdate } from '../../shared/utils/view-state';
import { RichTextPipe } from '../../shared/pipes/rich-text.pipe';

@Component({
    selector: 'app-team',
    imports: [RouterLink, Header, Footer, RichTextPipe],
    templateUrl: './team.html',
    styleUrl: './team.scss',
})
export class Team implements OnInit {
    sections: TeamSections = {};
    isLoading = true;
    loadError = '';
    ctaLink = '';

    constructor(
        private siteContentService: SiteContentService,
        private cdr: ChangeDetectorRef
    ) { }

    ngOnInit(): void {
        this.siteContentService.getPageSectionsTyped<TeamSections>('team').subscribe({
            next: (sections) => {
                applyDeferredViewUpdate(this.cdr, () => {
                    this.sections = sections || {};
                    this.ctaLink = this.normalizeLink(this.sections['cta']?.buttonLink);
                    this.isLoading = false;
                });
            },
            error: () => {
                applyDeferredViewUpdate(this.cdr, () => {
                    this.loadError = 'Failed to load Team content.';
                    this.isLoading = false;
                });
            }
        });
    }

    get members(): TeamMemberItem[] {
        const items = this.sections['members']?.items;
        if (!Array.isArray(items)) {
            return [];
        }
        return items.map((member: TeamMemberItem) => ({
            ...member,
            image: resolveMediaUrl(member?.image || '')
        }));
    }

    isExternalCtaLink(): boolean {
        return /^(https?:)?\/\//i.test(this.ctaLink);
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
