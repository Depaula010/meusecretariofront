import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive } from '@angular/router';
import {
  LucideAngularModule,
  LayoutDashboard,
  Wallet,
  Settings,
  CreditCard,
  LogOut,
  ChevronLeft,
} from 'lucide-angular';

interface NavItem {
  label: string;
  route: string;
  icon: any;
}

/**
 * Sidebar Component
 *
 * Navegação lateral da aplicação com:
 * - Menu de navegação principal
 * - Ícones usando Lucide
 * - Responsividade (overlay em mobile)
 * - Animações suaves
 */
@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive, LucideAngularModule],
  template: `
    <aside
      [class]="sidebarClasses()"
    >
      <!-- Logo e Título -->
      <div class="flex items-center justify-between p-6 border-b border-gray-200">
        <div class="flex items-center space-x-3">
          <div class="w-10 h-10 bg-gradient-to-br from-primary to-secondary rounded-xl flex items-center justify-center">
            <span class="text-white font-bold text-lg">MS</span>
          </div>
          <div [class.hidden]="!isOpen">
            <h1 class="text-xl font-bold text-gray-900">Meu Secretário</h1>
            <p class="text-xs text-gray-500">Gestão Inteligente</p>
          </div>
        </div>

        <!-- Botão de fechar (apenas desktop) -->
        <button
          (click)="toggle.emit()"
          class="hidden lg:flex items-center justify-center w-8 h-8 rounded-lg hover:bg-gray-100 transition-colors"
          [class.rotate-180]="!isOpen"
        >
          <lucide-icon [img]="ChevronLeftIcon" [size]="20" class="text-gray-600"></lucide-icon>
        </button>
      </div>

      <!-- Navigation Menu -->
      <nav class="flex-1 px-4 py-6 space-y-1">
        @for (item of navItems; track item.route) {
          <a
            [routerLink]="item.route"
            routerLinkActive="bg-primary text-white"
            [routerLinkActiveOptions]="{ exact: item.route === '/dashboard' }"
            class="flex items-center space-x-3 px-4 py-3 rounded-lg transition-all hover:bg-gray-100 text-gray-700 group"
            [class.justify-center]="!isOpen"
          >
            <lucide-icon
              [img]="item.icon"
              [size]="20"
              class="group-[.bg-primary]:text-white"
            ></lucide-icon>
            <span [class.hidden]="!isOpen" class="font-medium">{{ item.label }}</span>
          </a>
        }
      </nav>

      <!-- Footer - Logout -->
      <div class="p-4 border-t border-gray-200">
        <button
          (click)="handleLogout()"
          class="flex items-center space-x-3 px-4 py-3 rounded-lg transition-all hover:bg-red-50 text-red-600 w-full"
          [class.justify-center]="!isOpen"
        >
          <lucide-icon [img]="LogOutIcon" [size]="20"></lucide-icon>
          <span [class.hidden]="!isOpen" class="font-medium">Sair</span>
        </button>
      </div>
    </aside>
  `,
  styles: []
})
export class SidebarComponent {
  @Input() isOpen = true;
  @Output() toggle = new EventEmitter<void>();

  // Ícones do Lucide
  ChevronLeftIcon = ChevronLeft;
  LogOutIcon = LogOut;

  // Itens de navegação
  navItems: NavItem[] = [
    {
      label: 'Dashboard',
      route: '/dashboard',
      icon: LayoutDashboard,
    },
    {
      label: 'Minhas Finanças',
      route: '/finances',
      icon: Wallet,
    },
    {
      label: 'Assinatura',
      route: '/subscription',
      icon: CreditCard,
    },
    {
      label: 'Configurações',
      route: '/settings',
      icon: Settings,
    },
  ];

  /**
   * Classes dinâmicas da sidebar
   */
  sidebarClasses() {
    const baseClasses = 'fixed lg:static inset-y-0 left-0 z-40 flex flex-col bg-white border-r border-gray-200 transition-all duration-300';
    const widthClasses = this.isOpen ? 'w-64' : 'w-20';
    const mobileClasses = this.isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0';

    return `${baseClasses} ${widthClasses} ${mobileClasses}`;
  }

  /**
   * Handler para logout
   */
  handleLogout() {
    // TODO: Implementar logout via AuthService
    console.log('Logout clicked');
  }
}
