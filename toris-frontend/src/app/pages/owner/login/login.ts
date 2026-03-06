import { Component } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { OwnerAuthService } from '../../../services/owner-auth';
import { NotificationService } from '../../../shared/services/notification.service';

@Component({
    selector: 'app-owner-login',
    imports: [ReactiveFormsModule],
    templateUrl: './login.html',
    styleUrl: './login.scss',
})
export class OwnerLogin {
    loginForm: FormGroup;
    isSubmitting = false;

    constructor(
        private fb: FormBuilder,
        private ownerAuthService: OwnerAuthService,
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
        this.ownerAuthService.login(this.loginForm.value).subscribe({
            next: (res) => {
                this.ownerAuthService.saveToken(res.token);
                this.notifications.notify(res.message || 'Owner login successful!', 'success');
                this.router.navigate(['/owner/dashboard']);
            },
            error: (err) => {
                this.notifications.notify(err?.error?.message || 'Owner login failed', 'danger');
                this.isSubmitting = false;
            },
            complete: () => {
                this.isSubmitting = false;
            }
        });
    }
}
