import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { OwnerAuthService } from '../../../../services/owner-auth';
import { ManagedPage, managedNonCmsPages } from '../page-editor/managed-pages';
import { applyDeferredViewUpdate } from '../../../../shared/utils/view-state';

@Component({
    selector: 'app-owner-dashboard-layout',
    imports: [RouterOutlet, RouterLink, RouterLinkActive],
    templateUrl: './layout.html',
    styleUrl: './layout.scss',
})
export class OwnerDashboardLayout implements OnInit {
    managedPages: ManagedPage[] = [];

    constructor(
        private ownerAuthService: OwnerAuthService,
        private router: Router,
        private cdr: ChangeDetectorRef
    ) { }

    ngOnInit(): void {
        applyDeferredViewUpdate(this.cdr, () => {
            this.managedPages = managedNonCmsPages;
        });
    }

    logout() {
        this.ownerAuthService.clearToken();
        this.router.navigate(['/owner/login']);
    }
}
