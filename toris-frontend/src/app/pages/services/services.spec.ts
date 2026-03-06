import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Services } from './services';

describe('Services', () => {
    let component: Services;
    let fixture: ComponentFixture<Services>;

    const createServiceItem = (index: number) => ({
        _id: `id-${index}`,
        title: `Service ${index}`,
        summary: `Summary ${index}`,
        slug: `service-${index}`,
        icon: 'bi-star',
        image: 'images/service.jpg',
        detailDescription: '',
        status: 'Published'
    });

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [Services]
        }).compileComponents();

        fixture = TestBed.createComponent(Services);
        component = fixture.componentInstance;
        await fixture.whenStable();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('paginates services data correctly', () => {
        const items = Array.from({ length: 7 }, (_, index) => createServiceItem(index));
        component.services = items;
        expect(component.totalPages).toBe(2);
        expect(component.displayedServices.length).toBe(6);

        component.goToPage(2);
        expect(component.currentPage).toBe(2);
        expect(component.displayedServices.length).toBe(1);

        component.prevPage();
        expect(component.currentPage).toBe(1);
        component.nextPage();
        expect(component.currentPage).toBe(2);
    });
});
