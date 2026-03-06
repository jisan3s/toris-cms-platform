import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { OwnerAuthService } from '../../../../services/owner-auth';
import { AdminAuthService } from '../../../../services/admin-auth';
import { OwnerContentService } from '../../../../services/owner-content';
import { NotificationService } from '../../../../shared/services/notification.service';
import { RichTextEditorComponent } from '../../../../shared/components/rich-text-editor/rich-text-editor';

@Component({
    selector: 'app-owner-about-editor',
    imports: [ReactiveFormsModule, RichTextEditorComponent],
    templateUrl: './about.html',
    styleUrl: './about.scss',
})
export class OwnerAboutEditor implements OnInit {
    form: FormGroup;
    token = '';
    isOwnerPortal = false;

    constructor(
        private fb: FormBuilder,
        private ownerAuthService: OwnerAuthService,
        private adminAuthService: AdminAuthService,
        private ownerContentService: OwnerContentService,
        private router: Router,
        private notifications: NotificationService
    ) {
        this.form = this.fb.group({
            heading: ['', Validators.required],
            subheading: [''],
            body: ['', Validators.required],
            image: ['']
        });
    }

    ngOnInit(): void {
        this.isOwnerPortal = this.router.url.startsWith('/owner/');
        this.token = this.getCmsToken();
        if (!this.token) return;

        this.ownerContentService.getAbout(this.token).subscribe({
            next: (res) => this.form.patchValue(res),
            error: (err) => console.error('Failed to load about content:', err)
        });
    }

    onSubmit() {
        this.token = this.getCmsToken();
        if (this.form.invalid || !this.token) return;
        this.ownerContentService.updateAbout(this.form.value, this.token).subscribe({
            next: (res) => this.notifications.notify(res.message || 'About content updated', 'success'),
            error: (err) => this.notifications.notify(err?.error?.message || 'Failed to update about content', 'danger')
        });
    }

    private getCmsToken(): string {
        return this.isOwnerPortal ? this.ownerAuthService.getToken() : this.adminAuthService.getToken();
    }
}
