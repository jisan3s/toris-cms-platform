import { PLATFORM_ID, inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { isPlatformBrowser } from '@angular/common';

export const adminAuthGuard: CanActivateFn = () => {
    const router = inject(Router);
    const platformId = inject(PLATFORM_ID);

    if (!isPlatformBrowser(platformId)) {
        return true;
    }

    const token = localStorage.getItem('adminToken');
    return token ? true : router.createUrlTree(['/admin/login']);
};
