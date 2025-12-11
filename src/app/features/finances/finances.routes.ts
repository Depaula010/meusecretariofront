import { Routes } from '@angular/router';

/**
 * Rotas do módulo de Finanças
 *
 * TODO: Implementar componentes:
 * - Extrato (datagrid com filtros)
 * - Contas (CRUD de contas bancárias)
 * - Categorias (gerenciamento de categorias)
 */
export const financesRoutes: Routes = [
  {
    path: '',
    redirectTo: 'transactions',
    pathMatch: 'full'
  },
  {
    path: 'transactions',
    loadComponent: () =>
      import('./transactions.component').then(m => m.TransactionsComponent),
    title: 'Extrato - Meu Secretário'
  },
  {
    path: 'accounts',
    loadComponent: () =>
      import('./accounts.component').then(m => m.AccountsComponent),
    title: 'Contas - Meu Secretário'
  }
];
