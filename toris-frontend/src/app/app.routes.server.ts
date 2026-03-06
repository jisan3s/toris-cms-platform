import { RenderMode, ServerRoute } from '@angular/ssr';

export const serverRoutes: ServerRoute[] = [
    {
        path: 'service-details/:slug',
        renderMode: RenderMode.Server
    },
    {
        path: 'blog/:slug',
        renderMode: RenderMode.Server
    },
    {
        path: 'portfolio/:slug',
        renderMode: RenderMode.Server
    },
    {
        path: '**',
        renderMode: RenderMode.Prerender
    }
];
