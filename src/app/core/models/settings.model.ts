/**
 * Models para Configurações da Aplicação
 */

/** Tipos de API Keys disponíveis */
export enum ApiKeyType {
  GEMINI = 'gemini',
  WEATHER = 'weather',
  OPENROUTE = 'openroute',
}

/** Configuração de uma API Key */
export interface ApiKeyConfig {
  type: ApiKeyType;
  useOwnKey: boolean;
  key?: string;
  hasKey?: boolean;
  isValid?: boolean;
  lastValidated?: Date;
}

/** Configuração de Notificações */
export interface NotificationConfig {
  morningBriefing: { enabled: boolean; time: string };
  eveningCheckIn:  { enabled: boolean; time: string };
  financialAlerts: { enabled: boolean; daysBeforeDue: number };
}

/** Endereço Favorito */
export interface FavoriteAddress {
  id?: string;
  label: string; // "casa" | "trabalho" | "outro"
  address: string;
  coordinates?: { lat: number; lng: number };
}

/** Perfil do Usuário */
export interface UserProfile {
  id: number;
  nome: string;
  email?: string;
  numero_whatsapp: string;
  cidade?: string;
  estado?: string;
  fuso_horario: string;
  meses_reserva_emergencia: number;
}

/** Request para atualização de perfil */
export interface ProfileUpdateRequest {
  nome?: string;
  email?: string;
  cidade?: string;
  estado?: string;
  fuso_horario?: string;
  meses_reserva_emergencia?: number;
}

/** Configurações Completas do Usuário */
export interface UserSettings {
  apiKeys: ApiKeyConfig[];
  notifications: NotificationConfig;
  addresses: FavoriteAddress[];
}

/** Response genérica da API */
export interface ApiResponse<T = unknown> {
  status: 'success' | 'error';
  data?: T;
  message?: string;
}

/** Aliases de conveniência */
export type SettingsResponse = ApiResponse<UserSettings>;
export type ProfileResponse  = ApiResponse<UserProfile>;
