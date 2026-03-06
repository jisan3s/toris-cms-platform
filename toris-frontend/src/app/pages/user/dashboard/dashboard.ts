import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../../services/auth';
import { Header } from '../../../layouts/header/header';
import { Footer } from '../../../layouts/footer/footer';

@Component({
    selector: 'app-user-dashboard',
    imports: [Header, Footer],
    templateUrl: './dashboard.html',
    styleUrl: './dashboard.scss',
})
export class UserDashboard {
    constructor(
        private authService: AuthService,
        private router: Router
    ) { }

    logout(): void {
        this.authService.clearToken();
        this.router.navigate(['/login']);
    }
}
