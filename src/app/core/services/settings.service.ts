import { Injectable, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap, catchError, of, map } from 'rxjs';
import { environment } from '../../../environments/environment';
import {
  UserSettings,
  ApiKeyConfig,
  NotificationConfig,
  FavoriteAddress,
  ApiKeyType,
  SettingsResponse,
} from '../models/settings.model';

/**
 * Settings Service
 *
 * Gerencia todas as configurações do usuário usando Signals do Angular 18+
 * - API Keys (BYOK - Bring Your Own Key)
 * - Notificações
 * - Endereços Favoritos
 * - Preferências gerais
 *
 * Usa Signals para reatividade automática em toda a aplicação
 */
@Injectable({
  providedIn: 'root'
})
export class SettingsService {
  private readonly apiUrl = `${environment.apiUrl}${environment.apiPrefix}`;

  // ==========================================
  // Signals de Estado
  // ==========================================

  /**
   * Configurações completas do usuário
   */
  private _settings = signal<UserSettings | null>(null);

  /**
   * Loading state
   */
  private _loading = signal(false);

  /**
   * Error state
   */
  private _error = signal<string | null>(null);

  // ==========================================
  // Computed Signals
  // ==========================================

  /**
   * Configurações públicas (somente leitura)
   */
  public settings = this._settings.asReadonly();

  /**
   * Loading state público
   */
  public loading = this._loading.asReadonly();

  /**
   * Error state público
   */
  public error = this._error.asReadonly();

  /**
   * API Keys computadas
   */
  public apiKeys = computed(() => this._settings()?.apiKeys || []);

  /**
   * Notificações computadas
   */
  public notifications = computed(() => this._settings()?.notifications);

  /**
   * Endereços computados
   */
  public addresses = computed(() => this._settings()?.addresses || []);

  /**
   * Verifica se pelo menos uma API Key própria está configurada
   */
  public hasOwnApiKeys = computed(() => {
    const keys = this.apiKeys();
    return keys.some(key => key.useOwnKey && key.key);
  });

  /**
   * Verifica se todas as notificações estão desabilitadas
   */
  public allNotificationsDisabled = computed(() => {
    const notif = this.notifications();
    if (!notif) return true;
    return !notif.morningBriefing.enabled &&
           !notif.eveningCheckIn.enabled &&
           !notif.financialAlerts.enabled;
  });

  constructor(private http: HttpClient) {}

  // ==========================================
  // Métodos Públicos
  // ==========================================

  /**
   * Carregar configurações do usuário
   */
  loadSettings(userId: string): Observable<SettingsResponse> {
    this._loading.set(true);
    this._error.set(null);

    return this.http.get<SettingsResponse>(`${this.apiUrl}/settings/${userId}`).pipe(
      tap(response => {
        if (response.success && response.data) {
          this._settings.set(response.data);
        }
        this._loading.set(false);
      }),
      catchError(error => {
        this._error.set(error.message || 'Erro ao carregar configurações');
        this._loading.set(false);
        return of({ success: false, message: error.message });
      })
    );
  }

  /**
   * Atualizar uma API Key
   */
  updateApiKey(userId: string, apiKey: ApiKeyConfig): Observable<SettingsResponse> {
    this._loading.set(true);
    this._error.set(null);

    return this.http.post<SettingsResponse>(
      `${this.apiUrl}/api-keys/preferencias/${userId}`,
      apiKey
    ).pipe(
      tap(response => {
        if (response.success) {
          // Atualizar estado local
          this._settings.update(current => {
            if (!current) return current;

            const updatedKeys = current.apiKeys.map(key =>
              key.type === apiKey.type ? { ...key, ...apiKey } : key
            );

            return { ...current, apiKeys: updatedKeys };
          });
        }
        this._loading.set(false);
      }),
      catchError(error => {
        this._error.set(error.message || 'Erro ao atualizar API Key');
        this._loading.set(false);
        return of({ success: false, message: error.message });
      })
    );
  }

  /**
   * Atualizar configurações de notificações
   */
  updateNotifications(userId: string, notifications: NotificationConfig): Observable<SettingsResponse> {
    this._loading.set(true);
    this._error.set(null);

    return this.http.post<SettingsResponse>(
      `${this.apiUrl}/calendar-alerts/config/${userId}`,
      notifications
    ).pipe(
      tap(response => {
        if (response.success) {
          this._settings.update(current => {
            if (!current) return current;
            return { ...current, notifications };
          });
        }
        this._loading.set(false);
      }),
      catchError(error => {
        this._error.set(error.message || 'Erro ao atualizar notificações');
        this._loading.set(false);
        return of({ success: false, message: error.message });
      })
    );
  }

  /**
   * Adicionar endereço favorito
   */
  addAddress(userId: string, address: FavoriteAddress): Observable<SettingsResponse> {
    this._loading.set(true);
    this._error.set(null);

    return this.http.post<SettingsResponse>(
      `${this.apiUrl}/addresses/${userId}`,
      address
    ).pipe(
      tap(response => {
        if (response.success) {
          this._settings.update(current => {
            if (!current) return current;
            return {
              ...current,
              addresses: [...current.addresses, address]
            };
          });
        }
        this._loading.set(false);
      }),
      catchError(error => {
        this._error.set(error.message || 'Erro ao adicionar endereço');
        this._loading.set(false);
        return of({ success: false, message: error.message });
      })
    );
  }

  /**
   * Remover endereço favorito
   */
  removeAddress(userId: string, addressId: string): Observable<SettingsResponse> {
    this._loading.set(true);
    this._error.set(null);

    return this.http.delete<SettingsResponse>(
      `${this.apiUrl}/addresses/${userId}/${addressId}`
    ).pipe(
      tap(response => {
        if (response.success) {
          this._settings.update(current => {
            if (!current) return current;
            return {
              ...current,
              addresses: current.addresses.filter(addr => addr.id !== addressId)
            };
          });
        }
        this._loading.set(false);
      }),
      catchError(error => {
        this._error.set(error.message || 'Erro ao remover endereço');
        this._loading.set(false);
        return of({ success: false, message: error.message });
      })
    );
  }

  /**
   * Validar uma API Key
   */
  validateApiKey(type: ApiKeyType, key: string): Observable<boolean> {
    return this.http.post<{ valid: boolean }>(
      `${this.apiUrl}/api-keys/validate`,
      { type, key }
    ).pipe(
      tap(response => {
        if (response.valid) {
          // Atualizar status de validação no estado
          this._settings.update(current => {
            if (!current) return current;

            const updatedKeys = current.apiKeys.map(apiKey =>
              apiKey.type === type
                ? { ...apiKey, isValid: true, lastValidated: new Date() }
                : apiKey
            );

            return { ...current, apiKeys: updatedKeys };
          });
        }
      }),
      map(response => response.valid),
      catchError(() => of(false))
    );
  }

  /**
   * Resetar configurações para padrão
   */
  resetSettings(): void {
    this._settings.set(null);
    this._error.set(null);
  }
}
