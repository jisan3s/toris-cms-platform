import { Injectable, PLATFORM_ID, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { isPlatformBrowser } from '@angular/common';
import { Observable } from 'rxjs';
import { API_URLS } from '../shared/config/api';

interface AdminLoginPayload {
    email: string;
    password: string;
}

interface AdminAuthResponse {
    message: string;
    token: string;
    admin: {
        id: string;
        name: string;
        email: string;
        role: string;
    };
}

@Injectable({
    providedIn: 'root'
})
export class AdminAuthService {
    private readonly apiUrl = API_URLS.adminAuth;
    private readonly tokenKey = 'adminToken';
    private readonly platformId = inject(PLATFORM_ID);

    constructor(private http: HttpClient) { }

    login(payload: AdminLoginPayload): Observable<AdminAuthResponse> {
        return this.http.post<AdminAuthResponse>(`${this.apiUrl}/login`, payload);
    }

    saveToken(token: string): void {
        if (!isPlatformBrowser(this.platformId)) return;
        localStorage.setItem(this.tokenKey, token);
    }

    getToken(): string {
        if (!isPlatformBrowser(this.platformId)) return '';
        return localStorage.getItem(this.tokenKey) || '';
    }

    clearToken(): void {
        if (!isPlatformBrowser(this.platformId)) return;
        localStorage.removeItem(this.tokenKey);
    }
}
