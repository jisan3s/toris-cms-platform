import { Component } from '@angular/core';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { Header } from '../../../layouts/header/header';
import { Footer } from '../../../layouts/footer/footer';
import { NotificationService } from '../../../shared/services/notification.service';
import { AuthService } from '../../../services/auth';

@Component({
    selector: 'app-forgot-password',
    imports: [RouterLink, FormsModule, ReactiveFormsModule, Header, Footer],
    templateUrl: './forgot-password.html',
    styleUrl: './forgot-password.scss',
})
export class ForgotPassword {

    forgotForm: FormGroup;
    isSubmitting = false;

    constructor(
        private fb: FormBuilder,
        private notifications: NotificationService,
        private authService: AuthService,
        private router: Router
    ) {
        this.forgotForm = this.fb.group({
            email: ['', [Validators.required, Validators.email]]
        });
    }

    submitForgot() {
        if (!this.forgotForm.valid || this.isSubmitting) {
            return;
        }

        const email = String(this.forgotForm.value.email || '').trim().toLowerCase();
        this.isSubmitting = true;

        this.authService.forgotPassword({ email }).subscribe({
            next: (response) => {
                this.isSubmitting = false;
                this.notifications.notify('Email verified. Please set your new password.', 'success');
                this.router.navigate(['/reset-password'], {
                    queryParams: { token: response.resetToken }
                });
            },
            error: (error) => {
                this.isSubmitting = false;
                this.notifications.notify(error?.error?.message || 'Failed to verify email', 'danger');
            }
        });
    }

}
