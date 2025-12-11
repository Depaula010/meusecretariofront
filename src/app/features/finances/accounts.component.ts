import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-accounts',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="max-w-7xl mx-auto">
      <h1 class="text-3xl font-bold text-gray-900 mb-8">Contas Bancárias</h1>
      <div class="text-center py-20 text-gray-500">
        <p class="text-xl">Módulo em desenvolvimento...</p>
      </div>
    </div>
  `
})
export class AccountsComponent {}
