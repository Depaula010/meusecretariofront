import { Injectable, signal } from '@angular/core';

export interface Toast {
    id: number;
    type: 'success' | 'error' | 'info' | 'warning';
    title: string;
    message?: string;
    duration?: number;
}

@Injectable({ providedIn: 'root' })
export class ToastService {
    private counter = 0;
    toasts = signal<Toast[]>([]);

    private add(toast: Omit<Toast, 'id'>): void {
        const id = ++this.counter;
        const duration = toast.duration ?? 4000;
        this.toasts.update(list => [...list, { ...toast, id }]);
        if (duration > 0) {
            setTimeout(() => this.remove(id), duration);
        }
    }

    success(title: string, message?: string): void {
        this.add({ type: 'success', title, message });
    }

    error(title: string, message?: string): void {
        this.add({ type: 'error', title, message, duration: 6000 });
    }

    info(title: string, message?: string): void {
        this.add({ type: 'info', title, message });
    }

    warning(title: string, message?: string): void {
        this.add({ type: 'warning', title, message });
    }

    remove(id: number): void {
        this.toasts.update(list => list.filter(t => t.id !== id));
    }
}
