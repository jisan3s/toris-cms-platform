import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map, Observable } from 'rxjs';
import { API_URLS } from '../shared/config/api';

export interface ServiceCmsItem {
    _id: string;
    title: string;
    summary: string;
    slug: string;
    icon?: string;
    image?: string;
    detailTitle?: string;
    detailDescription?: string;
    features?: string[];
    buttonText?: string;
    buttonLink?: string;
    order?: number;
    updatedAt?: string;
}

interface ServiceListResponse {
    items?: ServiceCmsItem[];
}

interface ServiceSingleResponse {
    item?: ServiceCmsItem;
}

@Injectable({
    providedIn: 'root'
})
export class ServicesCmsService {
    private readonly baseUrl = `${API_URLS.content}/services`;

    constructor(private http: HttpClient) { }

    listPublished(): Observable<ServiceCmsItem[]> {
        return this.http.get<ServiceListResponse>(this.baseUrl).pipe(
            map((res) => Array.isArray(res?.items) ? res.items : [])
        );
    }

    getBySlug(slug: string): Observable<ServiceCmsItem | null> {
        const normalizedSlug = String(slug || '').trim().toLowerCase();
        return this.http.get<ServiceSingleResponse>(`${this.baseUrl}/${encodeURIComponent(normalizedSlug)}`).pipe(
            map((res) => res?.item || null)
        );
    }
}
