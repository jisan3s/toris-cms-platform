import { Routes } from '@angular/router';
import { Login } from './pages/auth/login/login';
import { Register } from './pages/auth/register/register';
import { ForgotPassword } from './pages/auth/forgot-password/forgot-password';
import { ResetPassword } from './pages/auth/reset-password/reset-password';
import { Terms } from './pages/terms/terms';
import { Privacy } from './pages/privacy/privacy';
import { NotFound } from './pages/not-found/not-found';
import { ownerAuthGuard } from './guards/auth.guard';
import { userAuthGuard } from './guards/user-auth.guard';
import { adminAuthGuard } from './guards/admin-auth.guard';
import { managedNonCmsPageKeys } from './pages/owner/dashboard/page-editor/managed-pages';

const pageEditorRoutes = managedNonCmsPageKeys.map((pageKey) => ({
    path: `pages/${pageKey}`,
    loadComponent: () => import('./pages/owner/dashboard/page-editor/page-editor').then((m) => m.PageEditor),
    data: { pageKey }
}));

export const routes: Routes = [
    
    // Public Pages
    {
        path: '',
        loadComponent: () => import('./pages/home/home').then((m) => m.Home)
    },
    {
        path: 'about',
        loadComponent: () => import('./pages/about/about').then((m) => m.About)
    },
    {
        path: 'services',
        loadComponent: () => import('./pages/services/services').then((m) => m.Services)
    },
    {
        path: 'service-details/:slug',
        loadComponent: () => import('./pages/service-details/service-details').then((m) => m.ServiceDetails)
    },
    {
        path: 'portfolio',
        loadComponent: () => import('./pages/portfolio/portfolio').then((m) => m.Portfolio)
    },
    {
        path: 'portfolio/:slug',
        loadComponent: () => import('./pages/portfolio-details/portfolio-details').then((m) => m.PortfolioDetails)
    },
    {
        path: 'pricing',
        loadComponent: () => import('./pages/pricing/pricing').then((m) => m.Pricing)
    },
    {
        path: 'testimonials',
        loadComponent: () => import('./pages/testimonials/testimonials').then((m) => m.Testimonials)
    },
    {
        path: 'blog',
        loadComponent: () => import('./pages/blog/blog').then((m) => m.Blog)
    },
    {
        path: 'blog/:slug',
        loadComponent: () => import('./pages/blog-details/blog-details').then((m) => m.BlogDetails)
    },
    {
        path: 'contact',
        loadComponent: () => import('./pages/contact/contact').then((m) => m.Contact)
    },
    {
        path: 'faq',
        loadComponent: () => import('./pages/faq/faq').then((m) => m.Faq)
    },
    {
        path: 'careers',
        loadComponent: () => import('./pages/careers/careers').then((m) => m.Careers)
    },
    {
        path: 'team',
        loadComponent: () => import('./pages/team/team').then((m) => m.Team)
    },

    // Auth
    { path: 'login', component: Login },
    { path: 'register', component: Register },
    { path: 'forgot-password', component: ForgotPassword },
    { path: 'reset-password', component: ResetPassword },

    // User Dashboard
    {
        path: 'user/dashboard',
        canActivate: [userAuthGuard],
        loadComponent: () => import('./pages/user/dashboard/dashboard').then((m) => m.UserDashboard)
    },

    // Owner Dashboard
    {
        path: 'owner/login',
        loadComponent: () => import('./pages/owner/login/login').then((m) => m.OwnerLogin)
    },
    {
        path: 'owner/dashboard',
        loadComponent: () => import('./pages/owner/dashboard/layout/layout').then((m) => m.OwnerDashboardLayout),
        canActivate: [ownerAuthGuard],
        children: [
            {
                path: '',
                loadComponent: () => import('./pages/owner/dashboard/overview/overview').then((m) => m.OwnerDashboardOverview)
            },
            {
                path: 'home',
                loadComponent: () => import('./pages/owner/dashboard/home/home').then((m) => m.OwnerHomeEditor)
            },
            {
                path: 'cms',
                loadComponent: () => import('./pages/owner/dashboard/blog/blog').then((m) => m.OwnerBlogEditor)
            },
            ...pageEditorRoutes
        ]
    },

    // Admin Dashboard
    {
        path: 'admin/login',
        loadComponent: () => import('./pages/admin/login/login').then((m) => m.AdminLogin)
    },
    {
        path: 'admin/dashboard',
        loadComponent: () => import('./pages/admin/dashboard/layout/layout').then((m) => m.AdminDashboardLayout),
        canActivate: [adminAuthGuard],
        children: [
            { path: '', pathMatch: 'full', redirectTo: 'home' },
            {
                path: 'home',
                loadComponent: () => import('./pages/owner/dashboard/home/home').then((m) => m.OwnerHomeEditor)
            },
            {
                path: 'cms',
                loadComponent: () => import('./pages/owner/dashboard/blog/blog').then((m) => m.OwnerBlogEditor)
            },
            ...pageEditorRoutes
        ]
    },

    // Legal
    { path: 'terms', component: Terms },
    { path: 'privacy', component: Privacy },

    // 404
    { path: '**', component: NotFound }

];
