import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LucideAngularModule, Eye, EyeOff } from 'lucide-angular';

/**
 * Login Component (Placeholder)
 *
 * TODO: Implementar formulário de login com:
 * - Input de WhatsApp/Email
 * - Input de senha
 * - Validações
 * - Integração com AuthService
 */
@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, LucideAngularModule],
  template: `
    <div class="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary to-secondary">
      <div class="bg-white p-8 rounded-2xl shadow-2xl max-w-md w-full">
        <h1 class="text-3xl font-bold text-gray-900 mb-2">Bem-vindo!</h1>
        <p class="text-gray-600 mb-6">Entre com sua conta para continuar</p>

        <div class="space-y-4">
          <input
            type="text"
            placeholder="WhatsApp ou Email"
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
            Entrar
          </button>
        </div>

        <p class="text-center text-sm text-gray-600 mt-6">
          Não tem conta?
          <a href="/auth/register" class="text-primary hover:underline font-medium">
            Cadastre-se
          </a>
        </p>
      </div>
    </div>
  `
})
export class LoginComponent {
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
