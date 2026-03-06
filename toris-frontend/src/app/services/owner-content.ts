import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_URLS } from '../shared/config/api';
import { HomeSections } from '../shared/types/page-sections';

export type CmsType = 'blog' | 'services' | 'portfolio';

export interface CmsPayload {
    title: string;
    summary: string;
    status: string;
    slug?: string;
    icon?: string;
    image?: string;
    detailTitle?: string;
    detailDescription?: string;
    features?: string[] | string;
    buttonText?: string;
    buttonLink?: string;
    order?: number;
    category?: string;
}

export interface HomePayload {
    hero?: {
        title?: string;
        subtitle?: string;
        description?: string;
        buttonText?: string;
        buttonLink?: string;
        image?: string;
    };
    sections?: Partial<HomeSections> & {
        clients?: { title?: string; logos?: string[] };
        "about-preview"?: { heading?: string; description?: string; buttonText?: string; buttonLink?: string };
        "why-choose"?: {
            subtitle?: string;
            yearsExperience?: string;
            yearsExperienceLabel?: string;
            projectsCompleted?: string;
            projectsCompletedLabel?: string;
            clientSatisfaction?: string;
            clientSatisfactionLabel?: string;
        };
        testimonials?: { heading?: string };
        pricing?: { heading?: string; buttonText?: string; buttonLink?: string };
        services?: { heading?: string; subtitle?: string; sectionButtonText?: string; sectionButtonLink?: string };
        portfolio?: { heading?: string; sectionButtonText?: string; sectionButtonLink?: string };
        blog?: { heading?: string };
        cta?: { title?: string; buttonText?: string; buttonLink?: string };
    };
}

export interface ApiMessageResponse {
    message?: string;
}

export interface CmsContentItem {
    _id: string;
    type: CmsType;
    title: string;
    summary: string;
    status: string;
    slug?: string;
    icon?: string;
    image?: string;
    detailTitle?: string;
    detailDescription?: string;
    features?: string[];
    buttonText?: string;
    buttonLink?: string;
    order?: number;
    category?: string;
    createdAt?: string;
    updatedAt?: string;
}

export interface CmsContentResponse extends ApiMessageResponse {
    item: CmsContentItem;
}

export interface CmsContentListResponse {
    items: CmsContentItem[];
    total: number;
    page: number;
    limit: number;
}

export interface HomeContentResponse {
    hero?: HomePayload['hero'];
    sections?: HomePayload['sections'];
}

export interface SiteSectionRow<TData extends Record<string, unknown> = Record<string, unknown>> {
    _id?: string;
    page: string;
    section: string;
    data: TData;
    createdAt?: string;
    updatedAt?: string;
}

export interface SaveSectionResponse<TData extends Record<string, unknown> = Record<string, unknown>> extends ApiMessageResponse {
    item?: SiteSectionRow<TData>;
}

export interface MediaUploadResponse extends ApiMessageResponse {
    secureUrl?: string;
    publicId?: string;
}

export interface MediaConfigResponse {
    cloudName?: string;
    uploadPreset?: string;
    enabled?: boolean;
}

@Injectable({
    providedIn: 'root'
})
export class OwnerContentService {
    private readonly apiUrl = API_URLS.ownerContent;

    constructor(private http: HttpClient) { }

    getAbout(token: string): Observable<Record<string, unknown>> {
        return this.http.get<Record<string, unknown>>(`${this.apiUrl}/about`, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        });
    }

    updateAbout(payload: Record<string, unknown>, token: string): Observable<ApiMessageResponse> {
        return this.http.put<ApiMessageResponse>(`${this.apiUrl}/about`, payload, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        });
    }

    getHomeContent(token: string): Observable<HomeContentResponse> {
        return this.http.get<HomeContentResponse>(`${this.apiUrl}/home`, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        });
    }

    updateHomeContent(payload: HomePayload, token: string): Observable<ApiMessageResponse> {
        return this.http.put<ApiMessageResponse>(`${this.apiUrl}/home`, payload, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        });
    }

    listSections(page: string, token: string): Observable<SiteSectionRow[]> {
        return this.http.get<SiteSectionRow[]>(`${this.apiUrl}/sections?page=${encodeURIComponent(page)}`, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        });
    }

    saveSection<TData extends Record<string, unknown>>(
        page: string,
        section: string,
        data: TData,
        token: string
    ): Observable<SaveSectionResponse<TData>> {
        return this.http.put<SaveSectionResponse<TData>>(`${this.apiUrl}/sections/${page}/${section}`, { data }, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        });
    }

    listCms(type: CmsType, token: string, params: Record<string, string> = {}): Observable<CmsContentListResponse> {
        const searchParams = new URLSearchParams(params);
        const queryString = searchParams.toString();
        const url = queryString ? `${this.apiUrl}/${type}?${queryString}` : `${this.apiUrl}/${type}`;
        return this.http.get<CmsContentListResponse>(url, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        });
    }

    checkSlug(type: CmsType, slug: string, token: string): Observable<{ exists: boolean; id?: string }> {
        return this.http.get<{ exists: boolean; id?: string }>(`${this.apiUrl}/${type}/slug/${encodeURIComponent(slug)}`, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        });
    }

    createCms(type: CmsType, payload: CmsPayload, token: string): Observable<CmsContentResponse> {
        return this.http.post<CmsContentResponse>(`${this.apiUrl}/${type}`, payload, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        });
    }

    updateCms(type: CmsType, id: string, payload: CmsPayload, token: string): Observable<CmsContentResponse> {
        return this.http.put<CmsContentResponse>(`${this.apiUrl}/${type}/${id}`, payload, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        });
    }

    deleteCms(type: CmsType, id: string, token: string): Observable<ApiMessageResponse> {
        return this.http.delete<ApiMessageResponse>(`${this.apiUrl}/${type}/${id}`, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        });
    }

    getMediaConfig(token: string): Observable<MediaConfigResponse> {
        return this.http.get<MediaConfigResponse>(`${this.apiUrl}/media/config`, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        });
    }

    uploadMedia(fileDataUrl: string, token: string, folder: string): Observable<MediaUploadResponse> {
        return this.http.post<MediaUploadResponse>(`${this.apiUrl}/media/upload`, { fileDataUrl, folder }, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        });
    }
}
