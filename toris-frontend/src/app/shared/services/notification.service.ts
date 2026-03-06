import { Injectable, NgZone } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export type NotificationType = 'success' | 'danger' | 'warning' | 'info';

export interface NotificationMessage {
    message: string;
    type: NotificationType;
}

export interface NotificationAlert extends NotificationMessage {
    id: number;
    duration: number;
}

@Injectable({
    providedIn: 'root'
})
export class NotificationService {
    private readonly alerts$Subject = new BehaviorSubject<NotificationAlert[]>([]);
    private readonly timers = new Map<number, ReturnType<typeof setTimeout>>();
    private nextId = 1;
    constructor(private ngZone: NgZone) { }

    get alerts$() {
        return this.alerts$Subject.asObservable();
    }

    notify(message: string, type: NotificationType = 'info', duration = 4000): void {
        this.ngZone.run(() => {
            const alert: NotificationAlert = {
                id: this.nextId++,
                message,
                type,
                duration
            };
            const current = this.alerts$Subject.value;
            this.alerts$Subject.next([...current, alert]);

            if (duration > 0) {
                const timer = setTimeout(() => {
                    this.ngZone.run(() => this.dismiss(alert.id));
                }, duration);
                this.timers.set(alert.id, timer);
            }
        });
    }

    dismiss(id: number): void {
        this.ngZone.run(() => {
            const remaining = this.alerts$Subject.value.filter((alert) => alert.id !== id);
            this.alerts$Subject.next(remaining);
            const timer = this.timers.get(id);
            if (timer) {
                clearTimeout(timer);
                this.timers.delete(id);
            }
        });
    }
}
