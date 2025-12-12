/**
 * Environment de Produção
 *
 * Configurações para ambiente de produção.
 * Aponta para a API de produção.
 */
export const environment = {
  production: true,
  apiUrl: 'http://212.47.65.37',
  apiPrefix: '',
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
