import { Injectable, PLATFORM_ID, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { isPlatformBrowser } from '@angular/common';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { catchError, finalize, map, tap } from 'rxjs/operators';
import { API_URLS } from '../shared/config/api';
import { SiteSections } from '../shared/types/site-content';

export interface ContactSubmissionPayload {
    name: string;
    email: string;
    subject: string;
    message: string;
}

export interface ContactSubmissionResponse {
    message: string;
    submissionId?: string;
}

@Injectable({
    providedIn: 'root'
})
export class SiteContentService {
    private readonly apiUrl = API_URLS.content;
    private readonly pageCache = new Map<string, { data: SiteSections; timestamp: number }>();
    private readonly inFlightRequests = new Map<string, Observable<SiteSections>>();
    private readonly pageSubjects = new Map<string, BehaviorSubject<SiteSections>>();
    private readonly platformId = inject(PLATFORM_ID);
    private readonly loggedKeys = new Set<string>();
    private readonly cacheTtlMs = 1000 * 60 * 5; // 5 minutes

    constructor(private http: HttpClient) { }

    getPageSections(page: string): Observable<SiteSections> {
        const key = this.normalizeKey(page);
        if (!key) {
            return of({});
        }

        const subject = this.getOrCreateSubject(key);
        const cached = this.pageCache.get(key);
        const isCacheValid = cached && Date.now() - cached.timestamp < this.cacheTtlMs;

        if (isCacheValid && subject.value !== cached.data) {
            subject.next(cached.data);
        }

        // Always revalidate in the background so dashboard edits are reflected immediately.
        // Cached data is still emitted first for fast initial paint.
        if (!this.inFlightRequests.has(key)) {
            const primaryApiUrl = this.getPrimaryApiUrl();
            const fallbackApiUrl = this.apiUrl;

            const request$ = this.fetchSections(primaryApiUrl, key).pipe(
                catchError((primaryError) => {
                    if (primaryApiUrl !== fallbackApiUrl) {
                        return this.fetchSections(fallbackApiUrl, key).pipe(
                            catchError((fallbackError) => this.handleFetchFailure(key, fallbackError || primaryError))
                        );
                    }
                    return this.handleFetchFailure(key, primaryError);
                }),
                finalize(() => {
                    this.inFlightRequests.delete(key);
                })
            );

            this.inFlightRequests.set(key, request$);
            request$.subscribe((sections) => {
                subject.next(sections || {});
            });
        }

        return subject.asObservable();
    }

    getPageSectionsTyped<T extends object>(page: string): Observable<T> {
        return this.getPageSections(page) as Observable<T>;
    }

    submitContact(payload: ContactSubmissionPayload): Observable<ContactSubmissionResponse> {
        return this.http.post<ContactSubmissionResponse>(`${this.apiUrl}/contact/submit`, payload);
    }

    private getPrimaryApiUrl(): string {
        if (isPlatformBrowser(this.platformId) && typeof window !== 'undefined' && window.location?.origin) {
            return `${window.location.origin}/api/content`;
        }
        return this.apiUrl;
    }

    private fetchSections(baseUrl: string, pageKey: string): Observable<SiteSections> {
        return this.http.get<any>(`${baseUrl}/page/${pageKey}`).pipe(
            map((res) => {
                if (res && typeof res === 'object' && !Array.isArray(res)) {
                    return res?.sections || {};
                }
                return {};
            }),
            tap((sections) => {
                this.pageCache.set(pageKey, { data: sections || {}, timestamp: Date.now() });
            })
        );
    }

    private normalizeKey(page: string): string {
        return (page || '').trim().toLowerCase();
    }

    private getOrCreateSubject(key: string): BehaviorSubject<SiteSections> {
        let subject = this.pageSubjects.get(key);
        if (!subject) {
            subject = new BehaviorSubject<SiteSections>({});
            this.pageSubjects.set(key, subject);
        }
        return subject;
    }

    private handleFetchFailure(pageKey: string, error: unknown): Observable<SiteSections> {
        const cached = this.pageCache.get(pageKey);
        const fallback = cached || {};

        // Avoid noisy SSR/prerender logs and never throw for content reads.
        if (isPlatformBrowser(this.platformId) && !this.loggedKeys.has(pageKey)) {
            this.loggedKeys.add(pageKey);
            console.error(`Failed to load content for page "${pageKey}"`, error);
        }

        return of(fallback);
    }
}
