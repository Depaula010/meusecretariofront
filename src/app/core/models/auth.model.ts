/**
 * Modelos de Autenticação
 *
 * Tipos TypeScript para requests e responses da API de autenticação.
 */

/**
 * Modelo de Usuário
 */
export interface User {
  id?: number;
  nome: string;
  whatsapp: string;
  dia_vencimento?: number;
  dia_fechamento?: number;
  created_at?: string;
  updated_at?: string;
}

/**
 * Request de Login
 */
export interface LoginRequest {
  whatsapp: string;
  password: string;
}

/**
 * Response de Login
 */
export interface LoginResponse {
  status: 'success' | 'error';
  token?: string;
  user?: User;
  message?: string;
}

/**
 * Request de Registro
 */
export interface RegisterRequest {
  nome: string;
  whatsapp: string;
  password: string;
  dia_vencimento: number;
  dia_fechamento: number;
}

/**
 * Response de Registro
 */
export interface RegisterResponse {
  status: 'success' | 'error';
  token?: string;
  user?: User;
  message?: string;
}

/**
 * Response de Erro da API
 */
export interface ApiError {
  status: 'error';
  message: string;
  errors?: Record<string, string[]>;
}
