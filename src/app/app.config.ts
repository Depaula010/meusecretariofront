import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import { provideRouter, withComponentInputBinding, withViewTransitions } from '@angular/router';
import { provideHttpClient, withInterceptors, withFetch } from '@angular/common/http';

import { routes } from './app.routes';

/**
 * Configuração da Aplicação Angular 18+
 *
 * Features habilitadas:
 * - Router com Component Input Binding e View Transitions
 * - HttpClient com Fetch API e Interceptors
 * - Zone.js com event coalescing para melhor performance
 */
export const appConfig: ApplicationConfig = {
  providers: [
    // Zone.js com otimizações
    provideZoneChangeDetection({ eventCoalescing: true }),

    // Router com features modernas
    provideRouter(
      routes,
      withComponentInputBinding(), // Permite usar @Input() para route params
      withViewTransitions() // Transições suaves entre rotas
    ),

    // HttpClient com Fetch API (melhor que XMLHttpRequest)
    provideHttpClient(
      withFetch(),
      // TODO: Adicionar interceptors aqui quando necessário
      // withInterceptors([authInterceptor, errorInterceptor])
    )
  ]
};
