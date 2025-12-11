import { Component, Output, EventEmitter, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  LucideAngularModule,
  Menu,
  Bell,
  User,
  ChevronDown,
} from 'lucide-angular';

/**
 * Header Component
 *
 * Barra superior da aplicação com:
 * - Botão de toggle da sidebar (mobile)
 * - Notificações
 * - Dropdown de usuário
 */
@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, LucideAngularModule],
  template: `
    <header class="bg-white border-b border-gray-200 px-6 py-4">
      <div class="flex items-center justify-between">
        <!-- Left side: Menu toggle (mobile) -->
        <button
          (click)="toggleSidebar.emit()"
          class="lg:hidden flex items-center justify-center w-10 h-10 rounded-lg hover:bg-gray-100 transition-colors"
        >
          <lucide-icon [img]="MenuIcon" [size]="24" class="text-gray-600"></lucide-icon>
        </button>

        <!-- Center: Page title (opcional) -->
        <div class="hidden lg:block">
          <h2 class="text-xl font-semibold text-gray-900">{{ pageTitle() }}</h2>
        </div>

        <!-- Right side: Notifications & User -->
        <div class="flex items-center space-x-4">
          <!-- Notifications -->
          <div class="relative">
            <button
              class="relative flex items-center justify-center w-10 h-10 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <lucide-icon [img]="BellIcon" [size]="20" class="text-gray-600"></lucide-icon>

              <!-- Badge de notificações -->
              @if (notificationCount() > 0) {
                <span class="absolute top-1 right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                  {{ notificationCount() }}
                </span>
              }
            </button>
          </div>

          <!-- User Dropdown -->
          <div class="relative">
            <button
              (click)="toggleUserMenu()"
              class="flex items-center space-x-3 px-3 py-2 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <div class="w-8 h-8 bg-gradient-to-br from-primary to-secondary rounded-full flex items-center justify-center">
                <lucide-icon [img]="UserIcon" [size]="16" class="text-white"></lucide-icon>
              </div>
              <div class="hidden md:block text-left">
                <p class="text-sm font-medium text-gray-900">{{ userName() }}</p>
                <p class="text-xs text-gray-500">{{ userPlan() }}</p>
              </div>
              <lucide-icon
                [img]="ChevronDownIcon"
                [size]="16"
                class="text-gray-600"
                [class.rotate-180]="isUserMenuOpen()"
              ></lucide-icon>
            </button>

            <!-- Dropdown Menu -->
            @if (isUserMenuOpen()) {
              <div class="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50">
                <a
                  href="#"
                  class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                >
                  Meu Perfil
                </a>
                <a
                  href="#"
                  class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                >
                  Configurações
                </a>
                <hr class="my-2 border-gray-200" />
                <a
                  href="#"
                  class="block px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                >
                  Sair
                </a>
              </div>
            }
          </div>
        </div>
      </div>
    </header>
  `,
  styles: []
})
export class HeaderComponent {
  @Output() toggleSidebar = new EventEmitter<void>();

  // Ícones do Lucide
  MenuIcon = Menu;
  BellIcon = Bell;
  UserIcon = User;
  ChevronDownIcon = ChevronDown;

  // Signals
  isUserMenuOpen = signal(false);
  pageTitle = signal('Dashboard');
  notificationCount = signal(3);
  userName = signal('Usuário Demo');
  userPlan = signal('Plano Prata');

  /**
   * Toggle user dropdown menu
   */
  toggleUserMenu() {
    this.isUserMenuOpen.update(value => !value);
  }
}
