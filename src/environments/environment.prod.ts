/**
 * Environment de Produção
 *
 * Configurações para ambiente de produção.
 * A API será acessada via proxy reverso do Nginx (/api)
 */
export const environment = {
  production: true,
  apiUrl: '', // Vazio porque usaremos proxy reverso do Nginx
  apiPrefix: '/api',
  appName: 'Meu Secretário',
  version: '1.0.0',

  // Configurações de autenticação
  auth: {
    tokenKey: 'meusecretario_token',
    tokenExpiration: 86400, // 24 horas em segundos
  },

  // Configurações de features (feature flags)
  features: {
    enableNotifications: true,
    enableWeatherIntegration: true,
    enableRouteIntegration: true,
    enableGeminiIntegration: true,
  },

  // Configurações de logs
  logging: {
    enableConsoleLog: false,
    enableErrorTracking: true,
  },
};
