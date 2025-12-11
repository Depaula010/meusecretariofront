import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

/**
 * Subscription Component (Placeholder)
 *
 * TODO: Implementar:
 * - Cards de planos (Bronze, Prata, Ouro)
 * - Visualização de consumo de cota
 * - Progress bars para requisições API
 */
@Component({
  selector: 'app-subscription',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="max-w-7xl mx-auto">
      <h1 class="text-3xl font-bold text-gray-900 mb-8">Assinatura</h1>
      <div class="text-center py-20 text-gray-500">
        <p class="text-xl">Módulo em desenvolvimento...</p>
        <p class="mt-2">Planos e Cotas em breve!</p>
      </div>
    </div>
  `
})
export class SubscriptionComponent {}
