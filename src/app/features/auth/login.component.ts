import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

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
  imports: [CommonModule],
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
          <input
            type="password"
            placeholder="Senha"
            class="input-base"
          />
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
export class LoginComponent {}
