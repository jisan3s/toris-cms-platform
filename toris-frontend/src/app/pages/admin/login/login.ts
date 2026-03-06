import { Component } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AdminAuthService } from '../../../services/admin-auth';
import { NotificationService } from '../../../shared/services/notification.service';

@Component({
    selector: 'app-admin-login',
    imports: [ReactiveFormsModule],
    templateUrl: './login.html',
    styleUrl: './login.scss',
})
export class AdminLogin {
    loginForm: FormGroup;
    isSubmitting = false;

    constructor(
        private fb: FormBuilder,
        private adminAuthService: AdminAuthService,
        private router: Router,
        private notifications: NotificationService
    ) {
        this.loginForm = this.fb.group({
            email: ['', [Validators.required, Validators.email]],
            password: ['', Validators.required]
        });
    }

    submitLogin(): void {
        if (this.loginForm.invalid || this.isSubmitting) return;

        this.isSubmitting = true;
        this.adminAuthService.login(this.loginForm.value).subscribe({
            next: (res) => {
                this.adminAuthService.saveToken(res.token);
                this.notifications.notify(res.message || 'Admin login successful!', 'success');
                this.router.navigate(['/admin/dashboard/home']);
            },
            error: (err) => {
                this.notifications.notify(err?.error?.message || 'Admin login failed', 'danger');
                this.isSubmitting = false;
            },
            complete: () => {
                this.isSubmitting = false;
            }
        });
    }
}
