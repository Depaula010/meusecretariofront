import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LucideAngularModule, Eye, EyeOff } from 'lucide-angular';

/**
 * Register Component (Placeholder)
 *
 * TODO: Implementar wizard de cadastro com:
 * - Step 1: Dados básicos (Nome, WhatsApp)
 * - Step 2: Configuração financeira (Dia fechamento/vencimento)
 * - Step 3: Confirmação
 */
@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, LucideAngularModule],
  template: `
    <div class="min-h-screen flex items-center justify-center bg-gradient-to-br from-secondary to-primary">
      <div class="bg-white p-8 rounded-2xl shadow-2xl max-w-md w-full">
        <h1 class="text-3xl font-bold text-gray-900 mb-2">Criar Conta</h1>
        <p class="text-gray-600 mb-6">Comece sua jornada financeira inteligente</p>

        <div class="space-y-4">
          <input
            type="text"
            placeholder="Nome completo"
            class="input-base"
          />
          <input
            type="tel"
            placeholder="WhatsApp (com DDD)"
            class="input-base"
          />

          <div class="relative">
            <input
              [type]="showPassword() ? 'text' : 'password'"
              placeholder="Senha"
              class="input-base pr-12"
            />
            <button
              type="button"
              (click)="togglePasswordVisibility()"
              class="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 transition-colors"
            >
              <lucide-icon
                [img]="showPassword() ? EyeOffIcon : EyeIcon"
                [size]="20"
              ></lucide-icon>
            </button>
          </div>

          <button class="w-full btn-primary py-3">
            Cadastrar
          </button>
        </div>

        <p class="text-center text-sm text-gray-600 mt-6">
          Já tem conta?
          <a href="/auth/login" class="text-primary hover:underline font-medium">
            Entrar
          </a>
        </p>
      </div>
    </div>
  `
})
export class RegisterComponent {
  // Ícones do Lucide
  EyeIcon = Eye;
  EyeOffIcon = EyeOff;

  // Signal para controlar visibilidade da senha
  showPassword = signal(false);

  /**
   * Toggle password visibility
   */
  togglePasswordVisibility() {
    this.showPassword.update(value => !value);
  }
}
