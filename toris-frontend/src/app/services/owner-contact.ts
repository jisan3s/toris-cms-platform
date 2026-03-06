import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_URLS } from '../shared/config/api';

export interface ContactSubmissionItem {
    _id: string;
    name: string;
    email: string;
    subject: string;
    message: string;
    status: 'new' | 'read' | 'archived';
    createdAt?: string;
}

export interface ContactSubmissionListResponse {
    items: ContactSubmissionItem[];
    total: number;
    page: number;
    limit: number;
}

export interface ContactDeadLetterItem {
    _id: string;
    type: string;
    payload: any;
    attempts: number;
    maxAttempts: number;
    lastError: string;
    updatedAt?: string;
}

@Injectable({
    providedIn: 'root'
})
export class OwnerContactService {
    private readonly apiUrl = API_URLS.ownerContact;

    constructor(private http: HttpClient) { }

    listSubmissions(token: string, params: { page?: number; limit?: number; q?: string; status?: string } = {}): Observable<ContactSubmissionListResponse> {
        const search = new URLSearchParams();
        if (params.page) search.set('page', String(params.page));
        if (params.limit) search.set('limit', String(params.limit));
        if (params.q) search.set('q', params.q);
        if (params.status) search.set('status', params.status);
        const query = search.toString();
        return this.http.get<ContactSubmissionListResponse>(`${this.apiUrl}/submissions${query ? `?${query}` : ''}`, {
            headers: { Authorization: `Bearer ${token}` }
        });
    }

    setSubmissionStatus(token: string, id: string, status: 'new' | 'read' | 'archived') {
        return this.http.patch<{ message: string }>(`${this.apiUrl}/submissions/${id}/status`, { status }, {
            headers: { Authorization: `Bearer ${token}` }
        });
    }

    listDeadLetters(token: string): Observable<{ items: ContactDeadLetterItem[] }> {
        return this.http.get<{ items: ContactDeadLetterItem[] }>(`${this.apiUrl}/dead-letters`, {
            headers: { Authorization: `Bearer ${token}` }
        });
    }
}
