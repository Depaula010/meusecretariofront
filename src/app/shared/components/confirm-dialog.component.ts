import { Component, EventEmitter, Input, Output, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LucideAngularModule, AlertTriangle, X } from 'lucide-angular';

/**
 * Confirm Dialog Component
 *
 * Dialog reutilizável para confirmações de ações destrutivas.
 * Uso: Confirmação antes de deletar transações, contas, etc.
 */
@Component({
  selector: 'app-confirm-dialog',
  standalone: true,
  imports: [CommonModule, LucideAngularModule],
  template: `
    @if (isOpen()) {
      <div class="fixed inset-0 z-50 overflow-y-auto">
        <div class="flex min-h-full items-center justify-center p-4">
          <!-- Backdrop -->
          <div
            class="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
            (click)="cancel()"
          ></div>

          <!-- Dialog -->
          <div class="relative bg-white rounded-xl shadow-xl max-w-sm w-full p-6 z-10">
            <!-- Header -->
            <div class="flex items-start gap-4 mb-4">
              <div class="p-3 bg-red-100 rounded-full flex-shrink-0">
                <lucide-icon [img]="AlertIcon" [size]="24" class="text-red-600"></lucide-icon>
              </div>
              <div class="flex-1">
                <h3 class="text-lg font-semibold text-gray-900">{{ title }}</h3>
                <p class="text-sm text-gray-600 mt-1">{{ message }}</p>
              </div>
              <button
                (click)="cancel()"
                class="p-1 hover:bg-gray-100 rounded-lg transition-colors flex-shrink-0"
              >
                <lucide-icon [img]="XIcon" [size]="20" class="text-gray-500"></lucide-icon>
              </button>
            </div>

            <!-- Actions -->
            <div class="flex gap-3 mt-6">
              <button
                (click)="cancel()"
                class="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors font-medium text-gray-700"
              >
                Cancelar
              </button>
              <button
                (click)="confirm()"
                class="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium"
              >
                {{ confirmText }}
              </button>
            </div>
          </div>
        </div>
      </div>
    }
  `
})
export class ConfirmDialogComponent {
  @Input() title = 'Confirmar ação';
  @Input() message = 'Tem certeza que deseja continuar?';
  @Input() confirmText = 'Confirmar';

  @Output() confirmed = new EventEmitter<void>();
  @Output() cancelled = new EventEmitter<void>();

  // Icons
  AlertIcon = AlertTriangle;
  XIcon = X;

  // State
  isOpen = signal(false);

  /**
   * Abre o dialog
   */
  open(): void {
    this.isOpen.set(true);
    document.body.style.overflow = 'hidden';
  }

  /**
   * Fecha o dialog
   */
  close(): void {
    this.isOpen.set(false);
    document.body.style.overflow = '';
  }

  /**
   * Confirma a ação e fecha o dialog
   */
  confirm(): void {
    this.confirmed.emit();
    this.close();
  }

  /**
   * Cancela a ação e fecha o dialog
   */
  cancel(): void {
    this.cancelled.emit();
    this.close();
  }
}
