import { Component } from '@angular/core';
import { Header } from "../../../layouts/header/header";
import { Footer } from "../../../layouts/footer/footer";
import { Router, RouterLink } from '@angular/router';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AuthService } from '../../../services/auth';
import { NotificationService } from '../../../shared/services/notification.service';

@Component({
    selector: 'app-login',
    imports: [RouterLink, FormsModule, ReactiveFormsModule, Header, Footer],
    templateUrl: './login.html',
    styleUrl: './login.scss',
})
export class Login {

    loginForm: FormGroup;
    isSubmitting: boolean = false;

    constructor(
        private fb: FormBuilder,
        private authService: AuthService,
        private router: Router,
        private notifications: NotificationService
    ) {
        this.loginForm = this.fb.group({
            email: ['', [Validators.required, Validators.email]],
            password: ['', Validators.required]
        });
    }

    submitLogin() {
        if (this.loginForm.invalid || this.isSubmitting) return;

        this.isSubmitting = true;
        this.authService.login(this.loginForm.value).subscribe({
            next: (res) => {
                if (!res?.token) {
                    this.notifications.notify(res?.message || 'Login unavailable', 'warning');
                    return;
                }
                this.authService.saveToken(res.token);
                if (res.refreshToken) {
                    this.authService.saveRefreshToken(res.refreshToken);
                }
                this.notifications.notify(res.message || 'Login successful!', 'success');
                this.loginForm.reset();
                this.router.navigate(['/user/dashboard']);
            },
            error: (err) => {
                const message = err?.error?.message || 'Login failed';
                this.notifications.notify(message, 'danger');
                console.error('Login failed:', err);
                this.isSubmitting = false;
            },
            complete: () => {
                this.isSubmitting = false;
            }
        });
    }

}
