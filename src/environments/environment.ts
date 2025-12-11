/**
 * Environment de Desenvolvimento
 *
 * Configurações para ambiente local de desenvolvimento.
 * A API deve estar rodando em http://localhost:5000
 */
export const environment = {
  production: false,
  apiUrl: 'http://localhost:5000',
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
    enableConsoleLog: true,
    enableErrorTracking: false,
  },
};
