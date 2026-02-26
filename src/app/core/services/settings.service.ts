import { Injectable, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap, catchError, of, map } from 'rxjs';
import {
  ApiKeyConfig,
  ApiKeyType,
  ApiResponse,
  FavoriteAddress,
  NotificationConfig,
  ProfileUpdateRequest,
  SettingsResponse,
  UserProfile,
  UserSettings,
} from '../models/settings.model';

/**
 * Settings Service
 *
 * Gerencia configurações do usuário usando Signals do Angular.
 * Todos os endpoints usam JWT para identificar o usuário (sem userId na URL).
 */
@Injectable({ providedIn: 'root' })
export class SettingsService {
  // ==========================================
  // Signals de Estado
  // ==========================================
  private _settings  = signal<UserSettings | null>(null);
  private _profile   = signal<UserProfile | null>(null);
  private _loading   = signal(false);
  private _error     = signal<string | null>(null);

  // Somente leitura para os componentes
  public settings  = this._settings.asReadonly();
  public profile   = this._profile.asReadonly();
  public loading   = this._loading.asReadonly();
  public error     = this._error.asReadonly();

  public apiKeys       = computed(() => this._settings()?.apiKeys ?? []);
  public notifications = computed(() => this._settings()?.notifications);
  public addresses     = computed(() => this._settings()?.addresses ?? []);

  constructor(private http: HttpClient) {}

  // ==========================================
  // Perfil
  // ==========================================

  /** Carrega perfil do usuário autenticado */
  getProfile(): Observable<ApiResponse<UserProfile>> {
    this._loading.set(true);
    return this.http.get<ApiResponse<UserProfile>>('/api/user/profile').pipe(
      tap(res => {
        if (res.status === 'success' && res.data) this._profile.set(res.data);
        this._loading.set(false);
      }),
      catchError(err => {
        this._error.set(err.message ?? 'Erro ao carregar perfil');
        this._loading.set(false);
        return of({ status: 'error' as const, message: err.message });
      })
    );
  }

  /** Atualiza perfil do usuário autenticado */
  updateProfile(data: ProfileUpdateRequest): Observable<ApiResponse<UserProfile>> {
    this._loading.set(true);
    return this.http.put<ApiResponse<UserProfile>>('/api/user/profile', data).pipe(
      tap(res => {
        if (res.status === 'success' && res.data) this._profile.set(res.data);
        this._loading.set(false);
      }),
      catchError(err => {
        this._error.set(err.message ?? 'Erro ao atualizar perfil');
        this._loading.set(false);
        return of({ status: 'error' as const, message: err.message });
      })
    );
  }

  // ==========================================
  // Settings Agregado
  // ==========================================

  /** Carrega configurações completas em uma única chamada */
  loadSettings(): Observable<SettingsResponse> {
    this._loading.set(true);
    this._error.set(null);

    return this.http.get<ApiResponse<any>>('/api/user/settings').pipe(
      tap(res => {
        if (res.status === 'success' && res.data) {
          this._settings.set(this._mapServerSettings(res.data));
        }
        this._loading.set(false);
      }),
      map(res => ({
        status: res.status,
        data: res.data ? this._mapServerSettings(res.data) : undefined,
        message: res.message,
      })),
      catchError(err => {
        this._error.set(err.message ?? 'Erro ao carregar configurações');
        this._loading.set(false);
        return of({ status: 'error' as const, message: err.message });
      })
    );
  }

  // ==========================================
  // API Keys
  // ==========================================

  /** Salva/atualiza uma chave API */
  updateApiKey(apiKey: ApiKeyConfig): Observable<ApiResponse> {
    this._loading.set(true);
    const payload = { type: apiKey.type, useOwnKey: apiKey.useOwnKey, key: apiKey.key };
    return this.http.put<ApiResponse>('/api/user/api-keys', payload).pipe(
      tap(res => {
        if (res.status === 'success') {
          this._settings.update(cur => {
            if (!cur) return cur;
            const updatedKeys = cur.apiKeys.map(k =>
              k.type === apiKey.type ? { ...k, ...apiKey } : k
            );
            return { ...cur, apiKeys: updatedKeys };
          });
        }
        this._loading.set(false);
      }),
      catchError(err => {
        this._error.set(err.message ?? 'Erro ao salvar chave API');
        this._loading.set(false);
        return of({ status: 'error' as const, message: err.message });
      })
    );
  }

  /** Valida uma chave API no servidor */
  validateApiKey(type: ApiKeyType, key: string): Observable<boolean> {
    return this.http.post<ApiResponse<{ is_valid: boolean }>>(
      '/api/user/api-keys/validate',
      { type, key }
    ).pipe(
      map(res => res.status === 'success' && (res.data?.is_valid ?? false)),
      catchError(() => of(false))
    );
  }

  // ==========================================
  // Notificações
  // ==========================================

  /** Atualiza configurações de notificação */
  updateNotifications(notifications: NotificationConfig): Observable<ApiResponse> {
    this._loading.set(true);
    return this.http.put<ApiResponse>('/api/user/notifications', notifications).pipe(
      tap(res => {
        if (res.status === 'success') {
          this._settings.update(cur => cur ? { ...cur, notifications } : cur);
        }
        this._loading.set(false);
      }),
      catchError(err => {
        this._error.set(err.message ?? 'Erro ao salvar notificações');
        this._loading.set(false);
        return of({ status: 'error' as const, message: err.message });
      })
    );
  }

  // ==========================================
  // Endereços
  // ==========================================

  /** Adiciona ou atualiza um endereço favorito */
  saveAddress(address: FavoriteAddress): Observable<ApiResponse> {
    this._loading.set(true);
    return this.http.post<ApiResponse>('/api/user/addresses', address).pipe(
      tap(res => {
        if (res.status === 'success') {
          this._settings.update(cur => {
            if (!cur) return cur;
            const others = cur.addresses.filter(a => a.label !== address.label);
            return { ...cur, addresses: [...others, address] };
          });
        }
        this._loading.set(false);
      }),
      catchError(err => {
        this._error.set(err.message ?? 'Erro ao salvar endereço');
        this._loading.set(false);
        return of({ status: 'error' as const, message: err.message });
      })
    );
  }

  /** Remove endereço favorito pelo label */
  removeAddress(label: string): Observable<ApiResponse> {
    this._loading.set(true);
    return this.http.delete<ApiResponse>(`/api/user/addresses/${label}`).pipe(
      tap(res => {
        if (res.status === 'success') {
          this._settings.update(cur => {
            if (!cur) return cur;
            return { ...cur, addresses: cur.addresses.filter(a => a.label !== label) };
          });
        }
        this._loading.set(false);
      }),
      catchError(err => {
        this._error.set(err.message ?? 'Erro ao remover endereço');
        this._loading.set(false);
        return of({ status: 'error' as const, message: err.message });
      })
    );
  }

  // ==========================================
  // Reset
  // ==========================================
  resetSettings(): void {
    this._settings.set(null);
    this._profile.set(null);
    this._error.set(null);
  }

  // ==========================================
  // Mapeamento Backend → Frontend
  // ==========================================

  /** Converte a resposta aggregada do servidor para o modelo do frontend */
  private _mapServerSettings(raw: any): UserSettings {
    const apiKeys: ApiKeyConfig[] = (raw.apiKeys ?? []).map((k: any) => ({
      type:      (k.provedor ?? k.type) as ApiKeyType,
      useOwnKey: k.usar_chave_propria ?? k.useOwnKey ?? false,
      hasKey:    k.has_key ?? false,
    }));

    // Garante os 3 provedores mesmo se o backend não retornar todos
    const allProviders: ApiKeyType[] = [ApiKeyType.GEMINI, ApiKeyType.WEATHER, ApiKeyType.OPENROUTE];
    const existingTypes = new Set(apiKeys.map(k => k.type));
    for (const prov of allProviders) {
      if (!existingTypes.has(prov)) {
        apiKeys.push({ type: prov, useOwnKey: false, hasKey: false });
      }
    }

    return {
      apiKeys,
      notifications: raw.notifications ?? {
        morningBriefing: { enabled: true, time: '07:00' },
        eveningCheckIn:  { enabled: true, time: '19:00' },
        financialAlerts: { enabled: true, daysBeforeDue: 3 },
      },
      addresses: raw.addresses ?? [],
    };
  }
}
