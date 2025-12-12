import { inject } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';
import { AuthService } from '../services/auth.service';

/**
 * Auth Guard
 *
 * Protege rotas que requerem autenticação.
 * Redireciona para login se o usuário não estiver autenticado.
 *
 * Usa functional guard (recomendado no Angular 18+)
 */
export const authGuard: CanActivateFn = (route, state) => {
  const router = inject(Router);
  const authService = inject(AuthService);

  // Verificar se há token válido
  const token = authService.getToken();

  if (!token) {
    // Redirecionar para login com returnUrl
    router.navigate(['/auth/login'], {
      queryParams: { returnUrl: state.url }
    });
    return false;
  }

  return true;
};

/**
 * Public Guard
 *
 * Impede que usuários autenticados acessem rotas públicas (login, registro)
 * Redireciona para dashboard se já estiver autenticado
 */
export const publicGuard: CanActivateFn = (route, state) => {
  const router = inject(Router);
  const authService = inject(AuthService);

  // Verificar se há token válido
  const token = authService.getToken();

  if (token) {
    // Já está autenticado, redirecionar para dashboard
    router.navigate(['/dashboard']);
    return false;
  }

  return true;
};
