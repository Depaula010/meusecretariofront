import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import { provideRouter, withComponentInputBinding, withViewTransitions } from '@angular/router';
import { provideHttpClient, withInterceptors, withFetch } from '@angular/common/http';
import { provideAnimations } from '@angular/platform-browser/animations';

import { routes } from './app.routes';
import { authInterceptor } from './core/interceptors/auth.interceptor';

/**
 * Configuração da Aplicação Angular 18+
 *
 * Features habilitadas:
 * - Router com Component Input Binding e View Transitions
 * - HttpClient com Fetch API e Interceptors
 * - Zone.js com event coalescing para melhor performance
 * - Auth Interceptor para gerenciar tokens JWT automaticamente
 * - Browser Animations para suporte a transições e animações
 */
export const appConfig: ApplicationConfig = {
  providers: [
    // Zone.js com otimizações
    provideZoneChangeDetection({ eventCoalescing: true }),

    // Suporte a animações do browser
    provideAnimations(),

    // Router com features modernas
    provideRouter(
      routes,
      withComponentInputBinding(), // Permite usar @Input() para route params
      withViewTransitions() // Transições suaves entre rotas
    ),

    // HttpClient com Fetch API e Interceptors
    provideHttpClient(
      withFetch(),
      withInterceptors([authInterceptor]) // Adiciona token JWT automaticamente
    )
  ]
};
