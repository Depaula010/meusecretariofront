import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-not-found',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="min-h-screen flex items-center justify-center bg-gray-50">
      <div class="text-center">
        <h1 class="text-9xl font-bold text-primary">404</h1>
        <p class="text-2xl font-semibold text-gray-900 mt-4">Página não encontrada</p>
        <p class="text-gray-600 mt-2 mb-8">A página que você procura não existe.</p>
        <a
          routerLink="/dashboard"
          class="btn-primary inline-block"
        >
          Voltar ao Dashboard
        </a>
      </div>
    </div>
  `
})
export class NotFoundComponent {}
