import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map, Observable } from 'rxjs';
import { API_URLS } from '../shared/config/api';

export interface BlogCmsItem {
    _id: string;
    title: string;
    summary: string;
    slug: string;
    icon?: string;
    image?: string;
    detailTitle?: string;
    detailDescription?: string;
    buttonText?: string;
    buttonLink?: string;
    category?: string;
    updatedAt?: string;
}

interface BlogListResponse {
    items: BlogCmsItem[];
    total: number;
    page: number;
    limit: number;
}

interface BlogSingleResponse {
    item?: BlogCmsItem;
}

@Injectable({
    providedIn: 'root'
})
export class BlogCmsService {
    private readonly baseUrl = `${API_URLS.content}/blog`;

    constructor(private http: HttpClient) { }

    listPublished(page = 1, limit = 6): Observable<BlogListResponse> {
        return this.http.get<BlogListResponse>(this.baseUrl, {
            params: {
                page: String(page),
                limit: String(limit)
            }
        });
    }

    getBySlug(slug: string): Observable<BlogCmsItem | null> {
        const normalizedSlug = String(slug || '').trim().toLowerCase();
        return this.http.get<BlogSingleResponse>(`${this.baseUrl}/${encodeURIComponent(normalizedSlug)}`).pipe(
            map((res) => res?.item || null)
        );
    }
}
