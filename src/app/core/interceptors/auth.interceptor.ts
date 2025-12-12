import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';
import { environment } from '../../../environments/environment';

/**
 * Auth Interceptor (Funcional - Angular 18+)
 *
 * Intercepta todas as requisições HTTP para:
 * 1. Adicionar o token JWT no header Authorization
 * 2. Tratar erros 401 (não autorizado) globalmente
 * 3. Redirecionar para login quando token expirar
 */
export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const router = inject(Router);
  const TOKEN_KEY = environment.auth.tokenKey;

  // Obter token do localStorage
  const token = localStorage.getItem(TOKEN_KEY);

  // Clonar a requisição e adicionar o header Authorization se houver token
  let authReq = req;
  if (token) {
    authReq = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`
      }
    });
  }

  // Enviar a requisição e tratar erros
  return next(authReq).pipe(
    catchError((error: HttpErrorResponse) => {
      // Tratar erro 401 (não autorizado) globalmente
      if (error.status === 401) {
        // Limpar autenticação
        localStorage.removeItem(TOKEN_KEY);
        localStorage.removeItem('meusecretario_user');

        // Redirecionar para login apenas se não estiver na rota de auth
        const currentUrl = router.url;
        if (!currentUrl.includes('/auth/')) {
          console.warn('Token expirado ou inválido. Redirecionando para login...');
          router.navigate(['/auth/login'], {
            queryParams: { returnUrl: currentUrl }
          });
        }
      }

      // Repassar o erro para ser tratado pelo serviço
      return throwError(() => error);
    })
  );
};
