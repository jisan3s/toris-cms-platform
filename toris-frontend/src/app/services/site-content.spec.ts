import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { forkJoin } from 'rxjs';
import { SiteContentService } from './site-content';

describe('SiteContentService', () => {
    let service: SiteContentService;
    let httpMock: HttpTestingController;

    beforeEach(() => {
        TestBed.configureTestingModule({
            providers: [provideHttpClient(), provideHttpClientTesting()]
        });

        service = TestBed.inject(SiteContentService);
        httpMock = TestBed.inject(HttpTestingController);
    });

    afterEach(() => {
        httpMock.verify();
    });

    const matchesContentEndpoint = (page: string) => {
        const suffix = `/api/content/${page}`;
        return (request: { url: string }) => request.url.endsWith(suffix);
    };

    it('should map API response to sections object', () => {
        let received: any;

        service.getPageSections('home').subscribe((sections) => {
            received = sections;
        });

        const req = httpMock.expectOne(matchesContentEndpoint('home'));
        expect(req.request.method).toBe('GET');
        req.flush({
            page: 'home',
            sections: {
                hero: {
                    title: 'Dynamic Title'
                }
            }
        });

        expect(received).toEqual({
            hero: {
                title: 'Dynamic Title'
            }
        });
    });

    it('should deduplicate in-flight requests for the same page', () => {
        let first: any;
        let second: any;

        forkJoin([
            service.getPageSections('home'),
            service.getPageSections('home')
        ]).subscribe(([a, b]) => {
            first = a;
            second = b;
        });

        const req = httpMock.expectOne(matchesContentEndpoint('home'));
        req.flush({ sections: { hero: { title: 'Shared' } } });

        expect(first).toEqual({ hero: { title: 'Shared' } });
        expect(second).toEqual({ hero: { title: 'Shared' } });
    });

    it('should reuse cache for global page without refetching', () => {
        let first: any;
        let second: any;

        service.getPageSections('global').subscribe((sections) => {
            first = sections;
        });

        const req = httpMock.expectOne(matchesContentEndpoint('global'));
        req.flush({ sections: { header: { brand: 'Toris' } } });

        service.getPageSections('global').subscribe((sections) => {
            second = sections;
        });

        httpMock.expectNone(matchesContentEndpoint('global'));
        expect(first).toEqual({ header: { brand: 'Toris' } });
        expect(second).toEqual({ header: { brand: 'Toris' } });
    });

    it('should return safe empty object when request fails and no cache exists', () => {
        let received: any;

        service.getPageSections('about').subscribe((sections) => {
            received = sections;
        });

        const primaryReq = httpMock.expectOne(matchesContentEndpoint('about'));
        primaryReq.flush({ message: 'Primary failed' }, { status: 500, statusText: 'Server Error' });

        const fallbackReq = httpMock.expectOne(matchesContentEndpoint('about'));
        fallbackReq.flush({ message: 'Fallback failed' }, { status: 500, statusText: 'Server Error' });

        expect(received).toEqual({});
    });
});
