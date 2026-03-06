import { API_ORIGIN } from '../config/api';

export const resolveMediaUrl = (image: unknown, backendOrigin: string = API_ORIGIN): string => {
    const raw = String(image || '').trim();
    if (!raw) return '';

    const normalized = raw.replace(/\\/g, '/');
    if (normalized.startsWith('http://') || normalized.startsWith('https://') || normalized.startsWith('data:') || normalized.startsWith('blob:')) {
        return normalized;
    }

    if (normalized.startsWith('uploads/') || normalized.startsWith('/uploads/')) {
        const path = normalized.startsWith('/') ? normalized : `/${normalized}`;
        return `${backendOrigin}${path}`;
    }

    const withoutPublicPrefix = normalized.startsWith('public/') ? normalized.slice(6) : normalized;
    const withoutDotSlash = withoutPublicPrefix.startsWith('./') ? withoutPublicPrefix.slice(2) : withoutPublicPrefix;
    return withoutDotSlash.startsWith('/') ? withoutDotSlash : `/${withoutDotSlash}`;
};
