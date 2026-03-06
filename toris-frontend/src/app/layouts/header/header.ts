import { ChangeDetectorRef, Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { SiteContentService } from '../../services/site-content';
import { SiteSections } from '../../shared/types/site-content';
import { applyDeferredViewUpdate } from '../../shared/utils/view-state';
import { resolveMediaUrl } from '../../shared/utils/media-url';

@Component({
    selector: 'app-header',
    imports: [RouterLink],
    templateUrl: './header.html',
    styleUrl: './header.scss',
})
export class Header {
    brand = '';
    logo = '';
    backgroundImage = '';
    items: Array<{ label: string; path: string }> = [];

    constructor(
        private siteContentService: SiteContentService,
        private cdr: ChangeDetectorRef
    ) { }

    ngOnInit(): void {
        this.siteContentService.getPageSections('global').subscribe((sections: SiteSections) => {
            applyDeferredViewUpdate(this.cdr, () => {
                const header = sections['header'] || {};
                this.brand = header.brand || '';
                this.logo = resolveMediaUrl(header.logo || '');
                this.backgroundImage = resolveMediaUrl(header.backgroundImage || '');
                this.items = this.normalizeHeaderItems(header);
            });
        });
    }

    get headerBackgroundStyle(): string {
        return this.backgroundImage ? `url('${this.backgroundImage}')` : '';
    }

    private normalizeHeaderItems(header: any): Array<{ label: string; path: string }> {
        const hasItemsKey = !!header && Object.prototype.hasOwnProperty.call(header, 'items');
        if (hasItemsKey) {
            if (!Array.isArray(header.items)) {
                return [];
            }

            // Respect dashboard data exactly: if user removes items, keep them removed.
            return header.items
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

        return [];
    }

    private normalizePath(path: any): string {
        const raw = String(path || '').trim();
        if (!raw) return '/';
        if (raw.startsWith('http://') || raw.startsWith('https://') || raw.startsWith('mailto:') || raw.startsWith('tel:') || raw.startsWith('#')) {
            return raw;
        }
        const withLeadingSlash = raw.startsWith('/') ? raw : `/${raw}`;
        const compacted = withLeadingSlash.replace(/\/{2,}/g, '/').trim();
        const noTrailingSlash = compacted.length > 1 ? compacted.replace(/\/+$/g, '') : compacted;
        return noTrailingSlash.toLowerCase();
    }
}
