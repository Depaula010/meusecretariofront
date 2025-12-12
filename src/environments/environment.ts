/**
 * Environment de Desenvolvimento
 *
 * Configurações para ambiente local de desenvolvimento.
 * Usa proxy reverso configurado em proxy.conf.json para evitar problemas de CORS.
 * O proxy redireciona chamadas de /api/* e /auth/* para http://212.47.65.37
 */
export const environment = {
  production: false,
  apiUrl: '', // Vazio para usar o proxy local (evita CORS)
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
