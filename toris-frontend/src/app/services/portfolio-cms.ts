import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map, Observable } from 'rxjs';
import { API_URLS } from '../shared/config/api';

export interface PortfolioCmsItem {
    _id: string;
    title: string;
    summary: string;
    slug: string;
    image?: string;
    detailTitle?: string;
    detailDescription?: string;
    buttonText?: string;
    category?: string;
    order?: number;
    updatedAt?: string;
}

interface PortfolioListResponse {
    items?: PortfolioCmsItem[];
}

interface PortfolioSingleResponse {
    item?: PortfolioCmsItem;
}

@Injectable({
    providedIn: 'root'
})
export class PortfolioCmsService {
    private readonly baseUrl = `${API_URLS.content}/portfolio`;

    constructor(private http: HttpClient) { }

    listPublished(): Observable<PortfolioCmsItem[]> {
        return this.http.get<PortfolioListResponse>(this.baseUrl).pipe(
            map((res) => Array.isArray(res?.items) ? res.items : [])
        );
    }

    getBySlug(slug: string): Observable<PortfolioCmsItem | null> {
        const normalizedSlug = String(slug || '').trim().toLowerCase();
        return this.http.get<PortfolioSingleResponse>(`${this.baseUrl}/${encodeURIComponent(normalizedSlug)}`).pipe(
            map((res) => res?.item || null)
        );
    }
}
