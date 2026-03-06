import { Component } from '@angular/core';
import { Header } from '../../../layouts/header/header';
import { Footer } from '../../../layouts/footer/footer';
import { FormsModule, FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { NotificationService } from '../../../shared/services/notification.service';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from '../../../services/auth';

@Component({
    selector: 'app-reset-password',
    imports: [FormsModule, ReactiveFormsModule, Header, Footer],
    templateUrl: './reset-password.html',
    styleUrl: './reset-password.scss',
})
export class ResetPassword {

    resetForm: FormGroup;
    isSubmitting = false;
    private resetToken = '';

    constructor(
        private fb: FormBuilder,
        private notifications: NotificationService,
        private route: ActivatedRoute,
        private router: Router,
        private authService: AuthService
    ) {
        this.resetForm = this.fb.group({
            password: ['', [Validators.required, Validators.minLength(8)]],
            confirmPassword: ['', [Validators.required, Validators.minLength(8)]]
        });
    }

    ngOnInit(): void {
        const token = String(this.route.snapshot.queryParamMap.get('token') || '').trim();
        if (!token) {
            this.notifications.notify('Reset link is invalid or missing.', 'warning');
            this.router.navigate(['/forgot-password']);
            return;
        }
        this.resetToken = token;
    }

    resetPassword() {
        if (!this.resetForm.valid || this.isSubmitting) {
            return;
        }

        const password = String(this.resetForm.value.password || '');
        const confirmPassword = String(this.resetForm.value.confirmPassword || '');

        if (password !== confirmPassword) {
            this.notifications.notify('Passwords do not match', 'danger');
            return;
        }

        this.isSubmitting = true;
        this.authService.resetPassword({
            token: this.resetToken,
            password,
            confirmPassword
        }).subscribe({
            next: () => {
                this.isSubmitting = false;
                this.notifications.notify('Password reset successfully!', 'success');
                this.resetForm.reset();
                this.router.navigate(['/login']);
            },
            error: (error) => {
                this.isSubmitting = false;
                this.notifications.notify(error?.error?.message || 'Failed to reset password', 'danger');
            }
        });
    }

}
