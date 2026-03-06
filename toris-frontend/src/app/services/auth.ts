import { Injectable, PLATFORM_ID, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { isPlatformBrowser } from '@angular/common';
import { Observable } from 'rxjs';
import { API_URLS } from '../shared/config/api';

interface AuthPayload {
    name?: string;
    email: string;
    password: string;
}

interface AuthResponse {
    message: string;
    token?: string;
    refreshToken?: string;
    verifyRequired?: boolean;
    user: {
        id: string;
        name: string;
        email: string;
    };
}

interface ForgotPasswordPayload {
    email: string;
}

interface ForgotPasswordResponse {
    message: string;
    resetToken: string;
    expiresAt: string;
}

interface ResetPasswordPayload {
    token: string;
    password: string;
    confirmPassword: string;
}

interface GenericMessageResponse {
    message: string;
}

@Injectable({
    providedIn: 'root'
})
export class AuthService {
    private readonly apiUrl = API_URLS.auth;
    private readonly tokenKey = 'userToken';
    private readonly refreshTokenKey = 'userRefreshToken';
    private readonly platformId = inject(PLATFORM_ID);

    constructor(private http: HttpClient) { }

    register(payload: AuthPayload): Observable<AuthResponse> {
        return this.http.post<AuthResponse>(`${this.apiUrl}/register`, payload);
    }

    login(payload: AuthPayload): Observable<AuthResponse> {
        return this.http.post<AuthResponse>(`${this.apiUrl}/login`, payload);
    }

    refreshToken(refreshToken: string): Observable<{ message: string; token: string }> {
        return this.http.post<{ message: string; token: string }>(`${this.apiUrl}/refresh`, { refreshToken });
    }

    logout(refreshToken: string): Observable<{ message: string }> {
        return this.http.post<{ message: string }>(`${this.apiUrl}/logout`, { refreshToken });
    }

    forgotPassword(payload: ForgotPasswordPayload): Observable<ForgotPasswordResponse> {
        return this.http.post<ForgotPasswordResponse>(`${this.apiUrl}/forgot-password`, payload);
    }

    resetPassword(payload: ResetPasswordPayload): Observable<GenericMessageResponse> {
        return this.http.post<GenericMessageResponse>(`${this.apiUrl}/reset-password`, payload);
    }

    saveToken(token: string): void {
        if (!isPlatformBrowser(this.platformId)) return;
        localStorage.setItem(this.tokenKey, token);
    }

    saveRefreshToken(refreshToken: string): void {
        if (!isPlatformBrowser(this.platformId)) return;
        localStorage.setItem(this.refreshTokenKey, refreshToken);
    }

    getToken(): string {
        if (!isPlatformBrowser(this.platformId)) return '';
        return localStorage.getItem(this.tokenKey) || '';
    }

    clearToken(): void {
        if (!isPlatformBrowser(this.platformId)) return;
        localStorage.removeItem(this.tokenKey);
        localStorage.removeItem(this.refreshTokenKey);
    }

    getRefreshToken(): string {
        if (!isPlatformBrowser(this.platformId)) return '';
        return localStorage.getItem(this.refreshTokenKey) || '';
    }

    isLoggedIn(): boolean {
        return !!this.getToken();
    }
}
