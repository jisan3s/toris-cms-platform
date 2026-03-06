import { ChangeDetectorRef, Component, NgZone, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { OwnerAuthService } from '../../../../services/owner-auth';
import { ManagedAdmin, OwnerAdminService } from '../../../../services/owner-admin';
import { ManagedUser, OwnerUserService } from '../../../../services/owner-user';
import { ContactSubmissionItem, OwnerContactService } from '../../../../services/owner-contact';
import { NotificationService } from '../../../../shared/services/notification.service';

@Component({
    selector: 'app-owner-dashboard-overview',
    imports: [FormsModule, ReactiveFormsModule],
    templateUrl: './overview.html',
    styleUrl: './overview.scss',
})
export class OwnerDashboardOverview implements OnInit {
    adminForm!: FormGroup;
    admins: ManagedAdmin[] = [];
    users: ManagedUser[] = [];
    pagedAdmins: ManagedAdmin[] = [];
    pagedUsers: ManagedUser[] = [];
    editingAdminId: string | null = null;
    originalAdminSnapshot: ManagedAdmin | null = null;
    token = '';
    adminSearchTerm = '';
    adminStatusFilter: 'all' | 'active' | 'blocked' = 'all';
    adminPage = 1;
    adminPageSize = 5;
    adminTotalPages = 1;
    adminFilteredCount = 0;
    userSearchTerm = '';
    userStatusFilter: 'all' | 'active' | 'blocked' = 'all';
    userPage = 1;
    userPageSize = 5;
    userTotalPages = 1;
    userFilteredCount = 0;
    contactItems: ContactSubmissionItem[] = [];
    contactLoading = false;
    contactError = '';
    contactPage = 1;
    contactLimit = 10;
    contactTotal = 0;
    contactSearch = '';
    contactStatus: 'all' | 'new' | 'read' | 'archived' = 'all';
    get contactTotalPages(): number {
        return Math.max(1, Math.ceil(this.contactTotal / this.contactLimit));
    }

    constructor(
        private fb: FormBuilder,
        private ownerAuthService: OwnerAuthService,
        private ownerAdminService: OwnerAdminService,
        private ownerUserService: OwnerUserService,
        private ownerContactService: OwnerContactService,
        private ngZone: NgZone,
        private cdr: ChangeDetectorRef,
        private notifications: NotificationService
    ) { }

    ngOnInit(): void {
        this.token = this.ownerAuthService.getToken();
        this.adminForm = this.fb.group({
            name: ['', Validators.required],
            email: ['', [Validators.required, Validators.email]],
            password: ['', [Validators.required, Validators.minLength(6)]]
        });
        this.loadAdmins();
        this.loadUsers();
        this.loadContacts();
    }

    private normalizeAdmin(admin: ManagedAdmin): ManagedAdmin {
        if (!admin || typeof admin !== 'object') return admin;
        const normalizedId = admin._id || admin.id;
        return {
            ...admin,
            _id: String(normalizedId || '')
        };
    }

    loadAdmins() {
        if (!this.token) return;
        this.ownerAdminService.listAdmins(this.token).subscribe({
            next: (res) => {
                const list: ManagedAdmin[] = Array.isArray(res) ? res : (res?.admins || []);
                this.ngZone.run(() => {
                    this.admins = list.map((admin) => this.normalizeAdmin(admin));
                    this.recomputeAdminView();
                    this.cdr.detectChanges();
                });
            },
            error: (err) => { console.error('Failed to load admins:', err); }
        });
    }

    private normalizeUser(user: ManagedUser): ManagedUser {
        if (!user || typeof user !== 'object') return user;
        const normalizedId = user._id || user.id;
        return {
            ...user,
            _id: String(normalizedId || '')
        };
    }

    loadUsers() {
        if (!this.token) return;
        this.ownerUserService.listUsers(this.token).subscribe({
            next: (res) => {
                const list: ManagedUser[] = Array.isArray(res) ? res : (res?.users || []);
                this.ngZone.run(() => {
                    this.users = list.map((user) => this.normalizeUser(user));
                    this.recomputeUserView();
                    this.cdr.detectChanges();
                });
            },
            error: (err) => { console.error('Failed to load users:', err); }
        });
    }

    private matchesStatus<T extends { isBlocked?: boolean }>(
        item: T,
        status: 'all' | 'active' | 'blocked'
    ): boolean {
        if (status === 'all') return true;
        return status === 'blocked' ? !!item.isBlocked : !item.isBlocked;
    }

    private recomputeAdminView() {
        const q = this.adminSearchTerm.trim().toLowerCase();
        const filtered = this.admins.filter((admin) => {
            const name = String(admin.name || '').toLowerCase();
            const email = String(admin.email || '').toLowerCase();
            const matchesQuery = !q || name.includes(q) || email.includes(q);
            return matchesQuery && this.matchesStatus(admin, this.adminStatusFilter);
        });

        this.adminFilteredCount = filtered.length;
        this.adminTotalPages = Math.max(1, Math.ceil(filtered.length / this.adminPageSize));
        if (this.adminPage > this.adminTotalPages) this.adminPage = this.adminTotalPages;
        if (this.adminPage < 1) this.adminPage = 1;

        const start = (this.adminPage - 1) * this.adminPageSize;
        this.pagedAdmins = filtered.slice(start, start + this.adminPageSize);
    }

    private recomputeUserView() {
        const q = this.userSearchTerm.trim().toLowerCase();
        const filtered = this.users.filter((user) => {
            const name = String(user.name || '').toLowerCase();
            const email = String(user.email || '').toLowerCase();
            const matchesQuery = !q || name.includes(q) || email.includes(q);
            return matchesQuery && this.matchesStatus(user, this.userStatusFilter);
        });

        this.userFilteredCount = filtered.length;
        this.userTotalPages = Math.max(1, Math.ceil(filtered.length / this.userPageSize));
        if (this.userPage > this.userTotalPages) this.userPage = this.userTotalPages;
        if (this.userPage < 1) this.userPage = 1;

        const start = (this.userPage - 1) * this.userPageSize;
        this.pagedUsers = filtered.slice(start, start + this.userPageSize);
    }

    onAdminSearchTermChange(value: string) {
        this.adminSearchTerm = value;
        this.adminPage = 1;
        this.recomputeAdminView();
    }

    onAdminStatusFilterChange(value: 'all' | 'active' | 'blocked') {
        this.adminStatusFilter = value;
        this.adminPage = 1;
        this.recomputeAdminView();
    }

    onAdminPageSizeChange(value: number | string) {
        const parsed = Number(value);
        this.adminPageSize = Number.isFinite(parsed) && parsed > 0 ? parsed : 5;
        this.adminPage = 1;
        this.recomputeAdminView();
    }

    goToAdminPage(page: number) {
        this.adminPage = page;
        this.recomputeAdminView();
    }

    onUserSearchTermChange(value: string) {
        this.userSearchTerm = value;
        this.userPage = 1;
        this.recomputeUserView();
    }

    onUserStatusFilterChange(value: 'all' | 'active' | 'blocked') {
        this.userStatusFilter = value;
        this.userPage = 1;
        this.recomputeUserView();
    }

    onUserPageSizeChange(value: number | string) {
        const parsed = Number(value);
        this.userPageSize = Number.isFinite(parsed) && parsed > 0 ? parsed : 5;
        this.userPage = 1;
        this.recomputeUserView();
    }

    goToUserPage(page: number) {
        this.userPage = page;
        this.recomputeUserView();
    }

    onCreateAdmin() {
        if (this.adminForm.invalid || !this.token) return;
        const raw = this.adminForm.value;
        this.ownerAdminService.createAdmin({
            ...raw,
            name: String(raw.name || '').trim(),
            email: String(raw.email || '').trim()
        }, this.token).subscribe({
            next: (res) => {
                this.notifications.notify(res.message || 'Admin created', 'success');
                this.adminForm.reset({
                    name: '',
                    email: '',
                    password: ''
                });
                this.loadAdmins();
            },
            error: (err) => { this.notifications.notify(err?.error?.message || 'Failed to create admin', 'danger'); }
        });
    }

    startEditAdmin(admin: ManagedAdmin) {
        this.editingAdminId = admin._id;
        this.originalAdminSnapshot = JSON.parse(JSON.stringify(admin));
    }

    cancelEditAdmin() {
        if (this.editingAdminId && this.originalAdminSnapshot) {
            const index = this.admins.findIndex((item) => item._id === this.editingAdminId);
            if (index > -1) {
                this.admins[index] = this.originalAdminSnapshot;
            }
        }
        this.editingAdminId = null;
        this.originalAdminSnapshot = null;
    }

    onSaveAdmin(admin: ManagedAdmin) {
        if (!this.token) return;
        const name = String(admin?.name || '').trim();
        const email = String(admin?.email || '').trim();
        if (!name) {
            this.notifications.notify('Admin name is required', 'warning');
            return;
        }
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            this.notifications.notify('Please enter a valid email', 'warning');
            return;
        }

        this.ownerAdminService.updateAdmin(admin._id, {
            name,
            email
        }, this.token).subscribe({
            next: (res) => {
                this.notifications.notify(res.message || 'Admin updated', 'success');
                this.editingAdminId = null;
                this.originalAdminSnapshot = null;
                this.loadAdmins();
            },
            error: (err) => { this.notifications.notify(err?.error?.message || 'Failed to update admin', 'danger'); }
        });
    }

    onToggleAdminBlock(admin: ManagedAdmin) {
        if (!this.token) return;
        this.ownerAdminService.setBlocked(admin._id, !admin.isBlocked, this.token).subscribe({
            next: (res) => {
                this.notifications.notify(res.message || 'Status updated', 'success');
                this.loadAdmins();
            },
            error: (err) => { this.notifications.notify(err?.error?.message || 'Failed to update status', 'danger'); }
        });
    }

    onDeleteAdmin(admin: ManagedAdmin) {
        if (!this.token) return;
        if (!confirm(`Delete admin ${admin.email}?`)) return;
        this.ownerAdminService.deleteAdmin(admin._id, this.token).subscribe({
            next: (res) => {
                this.notifications.notify(res.message || 'Admin deleted', 'success');
                this.loadAdmins();
            },
            error: (err) => { this.notifications.notify(err?.error?.message || 'Failed to delete admin', 'danger'); }
        });
    }

    onToggleUserBlock(user: ManagedUser) {
        if (!this.token) return;
        this.ownerUserService.setBlocked(user._id, !user.isBlocked, this.token).subscribe({
            next: (res) => {
                this.notifications.notify(res.message || 'User status updated', 'success');
                this.loadUsers();
            },
            error: (err) => { this.notifications.notify(err?.error?.message || 'Failed to update user status', 'danger'); }
        });
    }

    onDeleteUser(user: ManagedUser) {
        if (!this.token) return;
        if (!confirm(`Delete user ${user.email}?`)) return;
        this.ownerUserService.deleteUser(user._id, this.token).subscribe({
            next: (res) => {
                this.notifications.notify(res.message || 'User deleted', 'success');
                this.loadUsers();
            },
            error: (err) => { this.notifications.notify(err?.error?.message || 'Failed to delete user', 'danger'); }
        });
    }

    loadContacts() {
        if (!this.token) return;
        this.contactLoading = true;
        this.contactError = '';
        this.ownerContactService.listSubmissions(this.token, {
            page: this.contactPage,
            limit: this.contactLimit,
            q: this.contactSearch || undefined,
            status: this.contactStatus === 'all' ? undefined : this.contactStatus
        }).subscribe({
            next: (res) => {
                this.contactItems = Array.isArray(res?.items) ? res.items : [];
                this.contactTotal = Number(res?.total || 0);
                this.contactLoading = false;
                this.cdr.detectChanges();
            },
            error: (err) => {
                this.contactLoading = false;
                this.contactError = err?.error?.message || 'Failed to load contact submissions';
                this.cdr.detectChanges();
            }
        });
    }

    onContactSearchChange(value: string) {
        this.contactSearch = value;
        this.contactPage = 1;
        this.loadContacts();
    }

    onContactStatusChange(value: 'all' | 'new' | 'read' | 'archived') {
        this.contactStatus = value;
        this.contactPage = 1;
        this.loadContacts();
    }

    goToContactPage(page: number) {
        const maxPage = this.contactTotalPages;
        if (page < 1 || page > maxPage) return;
        this.contactPage = page;
        this.loadContacts();
    }

    setContactItemStatus(item: ContactSubmissionItem, status: 'new' | 'read' | 'archived') {
        if (!this.token) return;
        this.ownerContactService.setSubmissionStatus(this.token, item._id, status).subscribe({
            next: (res) => {
                this.notifications.notify(res?.message || 'Submission status updated', 'success');
                this.loadContacts();
            },
            error: (err) => {
                this.notifications.notify(err?.error?.message || 'Failed to update submission status', 'danger');
            }
        });
    }
}
