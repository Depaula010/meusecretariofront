import { Routes } from '@angular/router';
// import { authGuard, publicGuard } from './core/guards/auth.guard'; // COMENTADO TEMPORARIAMENTE
import { MainLayoutComponent } from './layouts/main-layout/main-layout.component';

/**
 * Rotas da Aplicação
 *
 * GUARDS DESABILITADOS TEMPORARIAMENTE PARA DESENVOLVIMENTO
 * Para reabilitar: descomente a importação acima e as linhas com canActivate
 *
 * Estrutura:
 * - / → Redireciona para /dashboard (se autenticado) ou /auth/login
 * - /auth → Rotas públicas (Login, Cadastro) com lazy loading
 * - Rotas privadas (Dashboard, Finanças, etc.) com MainLayout e authGuard
 */
export const routes: Routes = [
  // Redirect raiz para dashboard
  {
    path: '',
    redirectTo: 'dashboard',
    pathMatch: 'full'
  },

  // ==========================================
  // Rotas Públicas (Auth)
  // ==========================================
  {
    path: 'auth',
    // canActivate: [publicGuard], // COMENTADO - reabilite quando implementar autenticação
    children: [
      {
        path: 'login',
        loadComponent: () =>
          import('./features/auth/login.component').then(m => m.LoginComponent),
        title: 'Login - Meu Secretário'
      },
      {
        path: 'register',
        loadComponent: () =>
          import('./features/auth/register.component').then(m => m.RegisterComponent),
        title: 'Cadastro - Meu Secretário'
      },
      {
        path: '',
        redirectTo: 'login',
        pathMatch: 'full'
      }
    ]
  },

  // ==========================================
  // Rotas Privadas (Com Layout Principal)
  // ==========================================
  {
    path: '',
    component: MainLayoutComponent,
    // canActivate: [authGuard], // COMENTADO - reabilite quando implementar autenticação
    children: [
      {
        path: 'dashboard',
        loadComponent: () =>
          import('./features/dashboard/dashboard.component').then(m => m.DashboardComponent),
        title: 'Dashboard - Meu Secretário'
      },
      {
        path: 'finances',
        loadChildren: () =>
          import('./features/finances/finances.routes').then(m => m.financesRoutes),
        title: 'Minhas Finanças - Meu Secretário'
      },
      {
        path: 'settings',
        loadComponent: () =>
          import('./features/settings/settings.component').then(m => m.SettingsComponent),
        title: 'Configurações - Meu Secretário'
      },
      {
        path: 'subscription',
        loadComponent: () =>
          import('./features/subscription/subscription.component').then(m => m.SubscriptionComponent),
        title: 'Assinatura - Meu Secretário'
      }
    ]
  },

  // ==========================================
  // 404 - Not Found
  // ==========================================
  {
    path: '**',
    loadComponent: () =>
      import('./shared/components/not-found.component').then(m => m.NotFoundComponent),
    title: 'Página não encontrada'
  }
];
