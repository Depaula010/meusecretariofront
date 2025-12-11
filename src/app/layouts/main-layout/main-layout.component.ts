import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { SidebarComponent } from './sidebar.component';
import { HeaderComponent } from './header.component';

/**
 * Layout Principal da Aplicação
 *
 * Responsável por renderizar a estrutura base:
 * - Sidebar lateral com navegação
 * - Header superior
 * - Content area (router-outlet)
 *
 * Usa Signals para reatividade moderna do Angular 18+
 */
@Component({
  selector: 'app-main-layout',
  standalone: true,
  imports: [CommonModule, RouterOutlet, SidebarComponent, HeaderComponent],
  template: `
    <div class="flex h-screen bg-gray-50 overflow-hidden">
      <!-- Sidebar -->
      <app-sidebar
        [isOpen]="isSidebarOpen()"
        (toggleSidebar)="toggleSidebar()"
      />

      <!-- Main Content -->
      <div class="flex-1 flex flex-col min-w-0 overflow-hidden">
        <!-- Header -->
        <app-header (toggleSidebar)="toggleSidebar()" />

        <!-- Page Content -->
        <main class="flex-1 overflow-x-hidden overflow-y-auto bg-gray-50 p-4 md:p-6">
          <router-outlet />
        </main>
      </div>
    </div>

    <!-- Overlay para mobile quando sidebar está aberta -->
    @if (isSidebarOpen() && isMobile()) {
      <div
        class="fixed inset-0 bg-black bg-opacity-50 z-30 lg:hidden"
        (click)="closeSidebar()"
      ></div>
    }
  `,
  styles: [`
    :host {
      display: block;
      height: 100vh;
    }
  `]
})
export class MainLayoutComponent {
  // Signal para controlar estado da sidebar
  isSidebarOpen = signal(true);

  // Signal para detectar mobile (será atualizado no ngOnInit)
  isMobile = signal(false);

  ngOnInit() {
    // Detectar se é mobile
    this.checkIfMobile();

    // Listener para resize da janela
    if (typeof window !== 'undefined') {
      window.addEventListener('resize', () => this.checkIfMobile());
    }
  }

  /**
   * Toggle sidebar (abrir/fechar)
   */
  toggleSidebar() {
    this.isSidebarOpen.update(value => !value);
  }

  /**
   * Fechar sidebar (usado no overlay mobile)
   */
  closeSidebar() {
    this.isSidebarOpen.set(false);
  }

  /**
   * Verificar se é mobile (< 1024px)
   */
  private checkIfMobile() {
    if (typeof window !== 'undefined') {
      const mobile = window.innerWidth < 1024;
      this.isMobile.set(mobile);

      // Em mobile, sidebar começa fechada
      if (mobile) {
        this.isSidebarOpen.set(false);
      }
    }
  }

  ngOnDestroy() {
    if (typeof window !== 'undefined') {
      window.removeEventListener('resize', () => this.checkIfMobile());
    }
  }
}
