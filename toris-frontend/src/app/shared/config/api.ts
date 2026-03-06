declare global {
    interface Window {
        __TORIS_API_ORIGIN__?: string;
    }
}

const runtimeApiOrigin = typeof window !== 'undefined' ? window.__TORIS_API_ORIGIN__ || '' : '';
const serverEnvApiOrigin =
    (globalThis as any)?.process?.env?.TORIS_API_ORIGIN
    || (globalThis as any)?.process?.env?.API_ORIGIN
    || '';
const localDevFallbackApiOrigin = 'http://localhost:5001';

export const API_ORIGIN = (runtimeApiOrigin || serverEnvApiOrigin || localDevFallbackApiOrigin).replace(/\/+$/, '');

const toApiUrl = (path: string): string => {
    const normalizedPath = path.startsWith('/') ? path : `/${path}`;
    return API_ORIGIN ? `${API_ORIGIN}${normalizedPath}` : normalizedPath;
};

export const API_URLS = {
    content: toApiUrl('/api/content'),
    auth: toApiUrl('/api/auth'),
    ownerAuth: toApiUrl('/api/owner/auth'),
    adminAuth: toApiUrl('/api/admin/auth'),
    ownerAdmins: toApiUrl('/api/owner/admins'),
    ownerUsers: toApiUrl('/api/owner/users'),
    ownerContact: toApiUrl('/api/owner/contact'),
    ownerContent: toApiUrl('/api/owner/content')
} as const;
