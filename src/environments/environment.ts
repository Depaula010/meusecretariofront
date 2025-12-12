/**
 * Environment de Desenvolvimento
 *
 * Configurações para ambiente local de desenvolvimento.
 * Aponta para a API remota em produção durante o desenvolvimento.
 * Para usar API local, altere apiUrl para 'http://localhost:5000'
 */
export const environment = {
  production: false,
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
    enableConsoleLog: true,
    enableErrorTracking: false,
  },
};
