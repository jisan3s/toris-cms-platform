import { Injectable, PLATFORM_ID, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { isPlatformBrowser } from '@angular/common';
import { Observable } from 'rxjs';
import { API_URLS } from '../shared/config/api';

interface OwnerLoginPayload {
    email: string;
    password: string;
}

interface OwnerAuthResponse {
    message: string;
    token: string;
    owner: {
        id: string;
        name: string;
        email: string;
    };
}

@Injectable({
    providedIn: 'root'
})
export class OwnerAuthService {
    private readonly apiUrl = API_URLS.ownerAuth;
    private readonly tokenKey = 'ownerToken';
    private readonly platformId = inject(PLATFORM_ID);

    constructor(private http: HttpClient) { }

    login(payload: OwnerLoginPayload): Observable<OwnerAuthResponse> {
        return this.http.post<OwnerAuthResponse>(`${this.apiUrl}/login`, payload);
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

    isLoggedIn(): boolean {
        return !!this.getToken();
    }
}
