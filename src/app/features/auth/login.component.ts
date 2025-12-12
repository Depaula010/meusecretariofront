import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { LucideAngularModule, Eye, EyeOff, Loader2 } from 'lucide-angular';
import { AuthService } from '../../core/services/auth.service';

/**
 * Login Component
 *
 * Formulário de login integrado com a API
 */
@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule, LucideAngularModule],
  template: `
    <div class="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary to-secondary p-4">
      <div class="bg-white p-6 md:p-8 rounded-2xl shadow-2xl max-w-md w-full">
        <h1 class="text-2xl md:text-3xl font-bold text-gray-900 mb-2">Bem-vindo!</h1>
        <p class="text-sm md:text-base text-gray-600 mb-6">Entre com sua conta para continuar</p>

        <!-- Mensagem de Erro -->
        @if (authService.error()) {
          <div class="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
            <p class="text-sm text-red-700">{{ authService.error() }}</p>
          </div>
        }

        <!-- Formulário -->
        <form [formGroup]="loginForm" (ngSubmit)="onSubmit()" class="space-y-4">
          <!-- WhatsApp -->
          <div>
            <input
              type="text"
              formControlName="whatsapp"
              placeholder="WhatsApp (com DDD)"
              class="input-base"
              [class.border-red-300]="isFieldInvalid('whatsapp')"
            />
            @if (isFieldInvalid('whatsapp')) {
              <p class="mt-1 text-xs text-red-600">
                @if (loginForm.get('whatsapp')?.hasError('required')) {
                  WhatsApp é obrigatório
                }
                @if (loginForm.get('whatsapp')?.hasError('pattern')) {
                  Digite um WhatsApp válido (ex: 5511999999999)
                }
              </p>
            }
          </div>

          <!-- Senha -->
          <div>
            <div class="relative">
              <input
                [type]="showPassword() ? 'text' : 'password'"
                formControlName="password"
                placeholder="Senha"
                class="input-base pr-12"
                [class.border-red-300]="isFieldInvalid('password')"
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
            @if (isFieldInvalid('password')) {
              <p class="mt-1 text-xs text-red-600">
                @if (loginForm.get('password')?.hasError('required')) {
                  Senha é obrigatória
                }
                @if (loginForm.get('password')?.hasError('minlength')) {
                  Senha deve ter no mínimo 6 caracteres
                }
              </p>
            }
          </div>

          <!-- Botão de Submit -->
          <button
            type="submit"
            [disabled]="authService.isLoading()"
            class="w-full btn-primary py-3 flex items-center justify-center gap-2"
          >
            @if (authService.isLoading()) {
              <lucide-icon [img]="LoaderIcon" [size]="20" class="animate-spin"></lucide-icon>
              <span>Entrando...</span>
            } @else {
              <span>Entrar</span>
            }
          </button>
        </form>

        <!-- Link para Cadastro -->
        <p class="text-center text-sm text-gray-600 mt-6">
          Não tem conta?
          <a routerLink="/auth/register" class="text-primary hover:underline font-medium">
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
  LoaderIcon = Loader2;

  // Signal para controlar visibilidade da senha
  showPassword = signal(false);

  // Formulário reativo
  loginForm: FormGroup;

  constructor(
    private fb: FormBuilder,
    public authService: AuthService
  ) {
    // Inicializar formulário com validações
    this.loginForm = this.fb.group({
      whatsapp: ['', [
        Validators.required,
        Validators.pattern(/^55\d{10,11}$/) // Formato: 5511999999999
      ]],
      password: ['', [
        Validators.required,
        Validators.minLength(6)
      ]]
    });
  }

  /**
   * Toggle password visibility
   */
  togglePasswordVisibility() {
    this.showPassword.update(value => !value);
  }

  /**
   * Verifica se um campo é inválido e foi tocado
   */
  isFieldInvalid(fieldName: string): boolean {
    const field = this.loginForm.get(fieldName);
    return !!(field && field.invalid && (field.dirty || field.touched));
  }

  /**
   * Submete o formulário de login
   */
  onSubmit() {
    // Limpar erro anterior
    this.authService.clearError();

    // Marcar todos os campos como tocados para exibir validações
    if (this.loginForm.invalid) {
      Object.keys(this.loginForm.controls).forEach(key => {
        this.loginForm.get(key)?.markAsTouched();
      });
      return;
    }

    // Fazer login
    const credentials = this.loginForm.value;
    this.authService.login(credentials).subscribe({
      next: (response) => {
        console.log('Login bem-sucedido:', response);
        // O AuthService já redireciona para o dashboard
      },
      error: (error) => {
        console.error('Erro no login:', error);
        // O erro já está sendo tratado pelo AuthService
      }
    });
  }
}
