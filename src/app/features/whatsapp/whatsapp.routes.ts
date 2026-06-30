import { Routes } from '@angular/router';

export const whatsappRoutes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./whatsapp-sessions.component').then(m => m.WhatsappSessionsComponent),
    title: 'WhatsApp - Meu Secretário',
  },
];
