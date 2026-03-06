import { ChangeDetectorRef, Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { SiteContentService } from '../../services/site-content';
import { SiteSections } from '../../shared/types/site-content';
import { applyDeferredViewUpdate } from '../../shared/utils/view-state';
import { resolveMediaUrl } from '../../shared/utils/media-url';

@Component({
    selector: 'app-footer',
    imports: [RouterLink],
    templateUrl: './footer.html',
    styleUrl: './footer.scss',
})
export class Footer {
    title = '';
    subtitle = '';
    logo = '';
    backgroundImage = '';
    copyright = '';
    links: Array<{ label: string; path: string }> = [];

    constructor(
        private siteContentService: SiteContentService,
        private cdr: ChangeDetectorRef
    ) { }

    ngOnInit(): void {
        this.siteContentService.getPageSections('global').subscribe((sections: SiteSections) => {
            applyDeferredViewUpdate(this.cdr, () => {
                const footer = sections['footer'] || {};
                this.title = footer.title || '';
                this.subtitle = footer.subtitle || '';
                this.logo = resolveMediaUrl(footer.logo || '');
                this.backgroundImage = resolveMediaUrl(footer.backgroundImage || '');
                this.copyright = footer.copyright || '';
                this.links = this.normalizeFooterLinks(footer);
            });
        });
    }

    get footerBackgroundStyle(): string {
        return this.backgroundImage ? `url('${this.backgroundImage}')` : '';
    }

    private normalizeFooterLinks(footer: any): Array<{ label: string; path: string }> {
        const hasLinksKey = !!footer && Object.prototype.hasOwnProperty.call(footer, 'links');
        if (!hasLinksKey || !Array.isArray(footer.links)) {
            return [];
        }

        return footer.links
            .map((item: any) => {
                const label = String(item?.label || '').trim();
                const rawPath = String(item?.path || '').trim();
                if (!label || !rawPath) return null;
                return {
                    label,
                    path: this.normalizePath(rawPath)
                };
            })
            .filter((item: { label: string; path: string } | null): item is { label: string; path: string } => !!item);
    }

    private normalizePath(path: unknown): string {
        const raw = String(path || '').trim();
        if (!raw) return '';
        if (raw.startsWith('http://') || raw.startsWith('https://') || raw.startsWith('mailto:') || raw.startsWith('tel:') || raw.startsWith('#')) {
            return raw;
        }
        const withLeadingSlash = raw.startsWith('/') ? raw : `/${raw}`;
        const compacted = withLeadingSlash.replace(/\/{2,}/g, '/').trim();
        return compacted.length > 1 ? compacted.replace(/\/+$/g, '').toLowerCase() : compacted;
    }

    isExternalLink(path: string): boolean {
        return path.startsWith('http://')
            || path.startsWith('https://')
            || path.startsWith('mailto:')
            || path.startsWith('tel:')
            || path.startsWith('#');
    }
}
