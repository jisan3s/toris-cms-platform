import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { Header } from "../../layouts/header/header";
import { Footer } from "../../layouts/footer/footer";
import { SiteContentService } from '../../services/site-content';
import { PolicySections } from '../../shared/types/page-sections';
import { applyDeferredViewUpdate } from '../../shared/utils/view-state';
import { RichTextPipe } from '../../shared/pipes/rich-text.pipe';

@Component({
    selector: 'app-terms',
    imports: [Header, Footer, RichTextPipe],
    templateUrl: './terms.html',
    styleUrl: './terms.scss',
})
export class Terms implements OnInit {
    sections: PolicySections = {};
    isLoading = true;
    loadError = '';

    constructor(
        private siteContentService: SiteContentService,
        private cdr: ChangeDetectorRef
    ) { }

    ngOnInit(): void {
        this.siteContentService.getPageSectionsTyped<PolicySections>('terms').subscribe({
            next: (sections) => {
                applyDeferredViewUpdate(this.cdr, () => {
                    this.sections = sections || {};
                    this.isLoading = false;
                });
            },
            error: () => {
                applyDeferredViewUpdate(this.cdr, () => {
                    this.loadError = 'Failed to load Terms content.';
                    this.isLoading = false;
                });
            }
        });
    }
}
