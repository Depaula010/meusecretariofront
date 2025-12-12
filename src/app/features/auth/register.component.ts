import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { LucideAngularModule, Eye, EyeOff, Loader2 } from 'lucide-angular';
import { AuthService } from '../../core/services/auth.service';

/**
 * Register Component
 *
 * Formulário de cadastro integrado com a API
 */
@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule, LucideAngularModule],
  template: `
    <div class="min-h-screen flex items-center justify-center bg-gradient-to-br from-secondary to-primary p-4">
      <div class="bg-white p-6 md:p-8 rounded-2xl shadow-2xl max-w-md w-full">
        <h1 class="text-2xl md:text-3xl font-bold text-gray-900 mb-2">Criar Conta</h1>
        <p class="text-sm md:text-base text-gray-600 mb-6">Comece sua jornada financeira inteligente</p>

        <!-- Mensagem de Erro -->
        @if (authService.error()) {
          <div class="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
            <p class="text-sm text-red-700">{{ authService.error() }}</p>
          </div>
        }

        <!-- Formulário -->
        <form [formGroup]="registerForm" (ngSubmit)="onSubmit()" class="space-y-4">
          <!-- Nome -->
          <div>
            <input
              type="text"
              formControlName="nome"
              placeholder="Nome completo"
              class="input-base"
              [class.border-red-300]="isFieldInvalid('nome')"
            />
            @if (isFieldInvalid('nome')) {
              <p class="mt-1 text-xs text-red-600">
                @if (registerForm.get('nome')?.hasError('required')) {
                  Nome é obrigatório
                }
                @if (registerForm.get('nome')?.hasError('minlength')) {
                  Nome deve ter no mínimo 3 caracteres
                }
              </p>
            }
          </div>

          <!-- WhatsApp -->
          <div>
            <input
              type="tel"
              formControlName="whatsapp"
              placeholder="WhatsApp (com DDD)"
              class="input-base"
              [class.border-red-300]="isFieldInvalid('whatsapp')"
            />
            @if (isFieldInvalid('whatsapp')) {
              <p class="mt-1 text-xs text-red-600">
                @if (registerForm.get('whatsapp')?.hasError('required')) {
                  WhatsApp é obrigatório
                }
                @if (registerForm.get('whatsapp')?.hasError('pattern')) {
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
                @if (registerForm.get('password')?.hasError('required')) {
                  Senha é obrigatória
                }
                @if (registerForm.get('password')?.hasError('minlength')) {
                  Senha deve ter no mínimo 6 caracteres
                }
              </p>
            }
          </div>

          <!-- Dia de Vencimento -->
          <div>
            <input
              type="number"
              formControlName="dia_vencimento"
              placeholder="Dia de vencimento da fatura"
              class="input-base"
              min="1"
              max="31"
              [class.border-red-300]="isFieldInvalid('dia_vencimento')"
            />
            @if (isFieldInvalid('dia_vencimento')) {
              <p class="mt-1 text-xs text-red-600">
                @if (registerForm.get('dia_vencimento')?.hasError('required')) {
                  Dia de vencimento é obrigatório
                }
                @if (registerForm.get('dia_vencimento')?.hasError('min') || registerForm.get('dia_vencimento')?.hasError('max')) {
                  Digite um dia entre 1 e 31
                }
              </p>
            }
          </div>

          <!-- Dia de Fechamento -->
          <div>
            <input
              type="number"
              formControlName="dia_fechamento"
              placeholder="Dia de fechamento da fatura"
              class="input-base"
              min="1"
              max="31"
              [class.border-red-300]="isFieldInvalid('dia_fechamento')"
            />
            @if (isFieldInvalid('dia_fechamento')) {
              <p class="mt-1 text-xs text-red-600">
                @if (registerForm.get('dia_fechamento')?.hasError('required')) {
                  Dia de fechamento é obrigatório
                }
                @if (registerForm.get('dia_fechamento')?.hasError('min') || registerForm.get('dia_fechamento')?.hasError('max')) {
                  Digite um dia entre 1 e 31
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
              <span>Cadastrando...</span>
            } @else {
              <span>Cadastrar</span>
            }
          </button>
        </form>

        <!-- Link para Login -->
        <p class="text-center text-sm text-gray-600 mt-6">
          Já tem conta?
          <a routerLink="/auth/login" class="text-primary hover:underline font-medium">
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
  LoaderIcon = Loader2;

  // Signal para controlar visibilidade da senha
  showPassword = signal(false);

  // Formulário reativo
  registerForm: FormGroup;

  constructor(
    private fb: FormBuilder,
    public authService: AuthService
  ) {
    // Inicializar formulário com validações
    this.registerForm = this.fb.group({
      nome: ['', [
        Validators.required,
        Validators.minLength(3)
      ]],
      whatsapp: ['', [
        Validators.required,
        Validators.pattern(/^55\d{10,11}$/) // Formato: 5511999999999
      ]],
      password: ['', [
        Validators.required,
        Validators.minLength(6)
      ]],
      dia_vencimento: [10, [
        Validators.required,
        Validators.min(1),
        Validators.max(31)
      ]],
      dia_fechamento: [5, [
        Validators.required,
        Validators.min(1),
        Validators.max(31)
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
    const field = this.registerForm.get(fieldName);
    return !!(field && field.invalid && (field.dirty || field.touched));
  }

  /**
   * Submete o formulário de registro
   */
  onSubmit() {
    // Limpar erro anterior
    this.authService.clearError();

    // Marcar todos os campos como tocados para exibir validações
    if (this.registerForm.invalid) {
      Object.keys(this.registerForm.controls).forEach(key => {
        this.registerForm.get(key)?.markAsTouched();
      });
      return;
    }

    // Fazer cadastro
    const userData = this.registerForm.value;
    this.authService.register(userData).subscribe({
      next: (response) => {
        console.log('Cadastro bem-sucedido:', response);
        // O AuthService já redireciona para o dashboard
      },
      error: (error) => {
        console.error('Erro no cadastro:', error);
        // O erro já está sendo tratado pelo AuthService
      }
    });
  }
}
