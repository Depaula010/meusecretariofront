import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ToastService, Toast } from '../services/toast.service';
import { LucideAngularModule, CheckCircle, XCircle, AlertTriangle, Info, X } from 'lucide-angular';
import { trigger, transition, style, animate } from '@angular/animations';

@Component({
    selector: 'app-toast-container',
    standalone: true,
    imports: [CommonModule, LucideAngularModule],
    animations: [
        trigger('toastAnim', [
            transition(':enter', [
                style({ opacity: 0, transform: 'translateY(16px) scale(0.95)' }),
                animate('220ms ease-out', style({ opacity: 1, transform: 'translateY(0) scale(1)' })),
            ]),
            transition(':leave', [
                animate('180ms ease-in', style({ opacity: 0, transform: 'translateX(100%) scale(0.95)' })),
            ]),
        ]),
    ],
    template: `
    <div class="fixed bottom-6 right-6 z-[9999] flex flex-col gap-3 max-w-sm w-full pointer-events-none">
      @for (toast of toastService.toasts(); track toast.id) {
        <div
          [@toastAnim]
          class="pointer-events-auto flex items-start gap-3 rounded-2xl shadow-xl px-4 py-3.5 border backdrop-blur-sm transition-all"
          [class]="getClasses(toast)"
        >
          <!-- Ícone -->
          <div class="mt-0.5 shrink-0">
            @switch (toast.type) {
              @case ('success') {
                <lucide-icon [img]="CheckCircleIcon" [size]="20" class="text-emerald-500"></lucide-icon>
              }
              @case ('error') {
                <lucide-icon [img]="XCircleIcon" [size]="20" class="text-red-500"></lucide-icon>
              }
              @case ('warning') {
                <lucide-icon [img]="AlertTriangleIcon" [size]="20" class="text-amber-500"></lucide-icon>
              }
              @default {
                <lucide-icon [img]="InfoIcon" [size]="20" class="text-blue-500"></lucide-icon>
              }
            }
          </div>

          <!-- Conteúdo -->
          <div class="flex-1 min-w-0">
            <p class="text-sm font-semibold leading-snug" [class]="getTitleClass(toast)">
              {{ toast.title }}
            </p>
            @if (toast.message) {
              <p class="text-xs mt-0.5 leading-relaxed" [class]="getMsgClass(toast)">
                {{ toast.message }}
              </p>
            }
          </div>

          <!-- Fechar -->
          <button
            (click)="toastService.remove(toast.id)"
            class="shrink-0 opacity-50 hover:opacity-100 transition-opacity mt-0.5"
          >
            <lucide-icon [img]="XIcon" [size]="16"></lucide-icon>
          </button>
        </div>
      }
    </div>
  `,
})
export class ToastContainerComponent {
    toastService = inject(ToastService);

    CheckCircleIcon = CheckCircle;
    XCircleIcon = XCircle;
    AlertTriangleIcon = AlertTriangle;
    InfoIcon = Info;
    XIcon = X;

    getClasses(toast: Toast): string {
        const map = {
            success: 'bg-white border-emerald-200',
            error: 'bg-white border-red-200',
            warning: 'bg-white border-amber-200',
            info: 'bg-white border-blue-200',
        };
        return map[toast.type];
    }

    getTitleClass(toast: Toast): string {
        const map = {
            success: 'text-emerald-800',
            error: 'text-red-800',
            warning: 'text-amber-800',
            info: 'text-blue-800',
        };
        return map[toast.type];
    }

    getMsgClass(toast: Toast): string {
        const map = {
            success: 'text-emerald-600',
            error: 'text-red-600',
            warning: 'text-amber-600',
            info: 'text-blue-600',
        };
        return map[toast.type];
    }
}
