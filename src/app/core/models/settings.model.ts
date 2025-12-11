/**
 * Models para Configurações da Aplicação
 */

/**
 * Tipos de API Keys disponíveis
 */
export enum ApiKeyType {
  GEMINI = 'gemini',
  WEATHER = 'weather',
  OPENROUTE = 'openroute',
}

/**
 * Configuração de uma API Key
 */
export interface ApiKeyConfig {
  type: ApiKeyType;
  useOwnKey: boolean;
  key?: string;
  isValid?: boolean;
  lastValidated?: Date;
}

/**
 * Configuração de Notificações
 */
export interface NotificationConfig {
  morningBriefing: {
    enabled: boolean;
    time: string; // HH:mm format
  };
  eveningCheckIn: {
    enabled: boolean;
    time: string;
  };
  financialAlerts: {
    enabled: boolean;
    daysBeforeDue: number;
  };
}

/**
 * Endereço Favorito
 */
export interface FavoriteAddress {
  id?: string;
  label: string; // "Casa", "Trabalho", etc.
  address: string;
  coordinates?: {
    lat: number;
    lng: number;
  };
  isDefault?: boolean;
}

/**
 * Configurações Completas do Usuário
 */
export interface UserSettings {
  userId: string;
  apiKeys: ApiKeyConfig[];
  notifications: NotificationConfig;
  addresses: FavoriteAddress[];
  preferences: {
    language: string;
    timezone: string;
    currency: string;
  };
}

/**
 * Response da API de Configurações
 */
export interface SettingsResponse {
  success: boolean;
  data?: UserSettings;
  message?: string;
}
