import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { AdminAuthService } from '../../../../services/admin-auth';
import { ManagedPage, managedNonCmsPages } from '../../../owner/dashboard/page-editor/managed-pages';
import { applyDeferredViewUpdate } from '../../../../shared/utils/view-state';

@Component({
    selector: 'app-admin-dashboard-layout',
    imports: [RouterOutlet, RouterLink, RouterLinkActive],
    templateUrl: './layout.html',
    styleUrl: './layout.scss',
})
export class AdminDashboardLayout implements OnInit {
    managedPages: ManagedPage[] = [];

    constructor(
        private adminAuthService: AdminAuthService,
        private router: Router,
        private cdr: ChangeDetectorRef
    ) { }

    ngOnInit(): void {
        applyDeferredViewUpdate(this.cdr, () => {
            this.managedPages = managedNonCmsPages;
        });
    }

    logout(): void {
        this.adminAuthService.clearToken();
        this.router.navigate(['/admin/login']);
    }
}
