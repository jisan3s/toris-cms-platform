import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { Header } from "../../layouts/header/header";
import { Footer } from "../../layouts/footer/footer";
import { SiteContentService } from '../../services/site-content';
import { PolicySections } from '../../shared/types/page-sections';
import { applyDeferredViewUpdate } from '../../shared/utils/view-state';
import { RichTextPipe } from '../../shared/pipes/rich-text.pipe';

@Component({
    selector: 'app-privacy',
    imports: [Header, Footer, RichTextPipe],
    templateUrl: './privacy.html',
    styleUrl: './privacy.scss',
})
export class Privacy implements OnInit {
    sections: PolicySections = {};
    isLoading = true;
    loadError = '';

    constructor(
        private siteContentService: SiteContentService,
        private cdr: ChangeDetectorRef
    ) { }

    ngOnInit(): void {
        this.siteContentService.getPageSectionsTyped<PolicySections>('privacy').subscribe({
            next: (sections) => {
                applyDeferredViewUpdate(this.cdr, () => {
                    this.sections = sections || {};
                    this.isLoading = false;
                });
            },
            error: () => {
                applyDeferredViewUpdate(this.cdr, () => {
                    this.loadError = 'Failed to load Privacy content.';
                    this.isLoading = false;
                });
            }
        });
    }
}
