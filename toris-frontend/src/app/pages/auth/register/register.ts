import { Component } from '@angular/core';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { Header } from '../../../layouts/header/header';
import { Footer } from '../../../layouts/footer/footer';
import { AuthService } from '../../../services/auth';
import { NotificationService } from '../../../shared/services/notification.service';

@Component({
    selector: 'app-register',
    imports: [RouterLink, FormsModule, ReactiveFormsModule, Header, Footer],
    templateUrl: './register.html',
    styleUrl: './register.scss',
})
export class Register {

    registerForm: FormGroup;
    isSubmitting: boolean = false;

    constructor(
        private fb: FormBuilder,
        private authService: AuthService,
        private router: Router,
        private notifications: NotificationService
    ) {
        this.registerForm = this.fb.group({
            name: ['', Validators.required],
            email: ['', [Validators.required, Validators.email]],
            password: ['', [Validators.required, Validators.minLength(8)]],
            confirmPassword: ['', [Validators.required, Validators.minLength(8)]]
        }, { validators: this.passwordMatchValidator });
    }

    passwordMatchValidator(group: FormGroup) {
        return group.get('password')!.value === group.get('confirmPassword')!.value
        ? null : { mismatch: true };
    }

    submitRegister() {
        if (this.registerForm.invalid || this.isSubmitting) return;

        this.isSubmitting = true;
        const { name, email, password } = this.registerForm.value;

        this.authService.register({ name, email, password }).subscribe({
            next: (res) => {
                if (res.verifyRequired) {
                    this.notifications.notify(res.message || 'Registration successful. Please verify your email.', 'success');
                    this.registerForm.reset();
                    this.router.navigate(['/login']);
                    return;
                }
                if (!res?.token) {
                    this.notifications.notify(res?.message || 'Registration successful', 'success');
                    this.registerForm.reset();
                    this.router.navigate(['/login']);
                    return;
                }
                this.authService.saveToken(res.token);
                if (res.refreshToken) {
                    this.authService.saveRefreshToken(res.refreshToken);
                }
                this.notifications.notify(res.message || 'Registration successful!', 'success');
                this.registerForm.reset();
                this.router.navigate(['/user/dashboard']);
            },
            error: (err) => {
                const message = err?.error?.message || 'Registration failed';
                this.notifications.notify(message, 'danger');
                console.error('Registration failed:', err);
                this.isSubmitting = false;
            },
            complete: () => {
                this.isSubmitting = false;
            }
        });
    }

}
