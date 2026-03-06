import { ChangeDetectorRef, Component, OnDestroy, NgZone } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NotificationAlert, NotificationService } from '../../shared/services/notification.service';
import { Subscription } from 'rxjs';

@Component({
    selector: 'app-alerts',
    standalone: true,
    imports: [CommonModule],
    template: `
        <div
            class="alerts-container position-fixed top-0 end-0 p-3"
            style="z-index: 1200;"
            role="status"
            aria-live="polite"
            aria-atomic="true">
            @for (alert of alerts; track alert.id) {
                <div
                    class="alert alert-{{ alert.type }} alert-dismissible fade show mb-2 shadow"
                    role="alert"
                    [attr.data-severity]="alert.type">
                    <div class="d-flex align-items-start justify-content-between gap-3">
                        <div class="flex-grow-1">
                            {{ alert.message }}
                        </div>
                        <button
                            type="button"
                            class="btn-close"
                            aria-label="Close"
                            (click)="dismiss(alert)">
                        </button>
                    </div>
                </div>
            }
        </div>
    `,
    styles: [`
        :host {
            --alerts-max-width: 360px;
            --alert-success-border: #198754;
            --alert-danger-border: #dc3545;
            --alert-warning-border: #ffc107;
            --alert-info-border: #0dcaf0;
        }
        .alerts-container {
            max-width: var(--alerts-max-width);
        }
        .alert {
            border-left-width: 4px;
            border-left-style: solid;
            border-left-color: transparent;
            opacity: 0;
            transform: translateY(-8px);
            animation: slideIn 0.3s ease forwards;
        }
        .alert[data-severity="success"] {
            border-left-color: var(--alert-success-border);
        }
        .alert[data-severity="danger"] {
            border-left-color: var(--alert-danger-border);
        }
        .alert[data-severity="warning"] {
            border-left-color: var(--alert-warning-border);
        }
        .alert[data-severity="info"] {
            border-left-color: var(--alert-info-border);
        }
        @keyframes slideIn {
            from {
                opacity: 0;
                transform: translateY(-8px);
            }
            to {
                opacity: 1;
                transform: translateY(0);
            }
        }
        @media (max-width: 640px) {
            .alerts-container {
                width: calc(100% - 1.5rem);
                left: 0.75rem;
                right: 0.75rem;
            }
        }
        @media (prefers-reduced-motion: reduce) {
            .alert {
                animation: none;
                transition: none;
            }
        }
    `]
})
export class AlertsComponent implements OnDestroy {
    alerts: NotificationAlert[] = [];
    private subscription: Subscription;

    constructor(
        private notificationService: NotificationService,
        private cdr: ChangeDetectorRef,
        private ngZone: NgZone
    ) {
        this.subscription = this.notificationService.alerts$.subscribe((items) => {
            this.ngZone.run(() => {
                this.alerts = [...items];
                this.cdr.markForCheck();
            });
        });
    }

    dismiss(alert: NotificationAlert): void {
        this.notificationService.dismiss(alert.id);
    }

    ngOnDestroy(): void {
        this.subscription.unsubscribe();
    }
}
