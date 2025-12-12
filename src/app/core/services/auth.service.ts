import { Injectable, signal, computed } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, throwError, BehaviorSubject } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import {
  User,
  LoginRequest,
  LoginResponse,
  RegisterRequest,
  RegisterResponse,
  ApiError,
} from '../models/auth.model';

/**
 * Serviço de Autenticação
 *
 * Gerencia login, registro, logout e estado de autenticação do usuário.
 * Utiliza Angular Signals para estado reativo.
 */
@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private readonly TOKEN_KEY = environment.auth.tokenKey;
  private readonly API_URL = `${environment.apiUrl}${environment.apiPrefix}`;

  // Signals para estado reativo
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();

  isAuthenticated = signal<boolean>(false);
  currentUser = signal<User | null>(null);
  isLoading = signal<boolean>(false);
  error = signal<string | null>(null);

  // Computed signal para verificar se usuário está logado
  isLoggedIn = computed(() => this.isAuthenticated());

  constructor(private http: HttpClient, private router: Router) {
    // Verificar se há token salvo ao inicializar o serviço
    this.checkAuthentication();
  }

  /**
   * Verifica se há um token salvo e carrega os dados do usuário
   */
  private checkAuthentication(): void {
    const token = this.getToken();
    if (token) {
      // TODO: Validar token com o backend
      // Por enquanto, apenas marca como autenticado se houver token
      this.isAuthenticated.set(true);

      // Tentar carregar dados do usuário do localStorage
      const userDataStr = localStorage.getItem('meusecretario_user');
      if (userDataStr) {
        try {
          const userData = JSON.parse(userDataStr);
          this.currentUser.set(userData);
          this.currentUserSubject.next(userData);
        } catch (e) {
          console.error('Erro ao parsear dados do usuário:', e);
        }
      }
    }
  }

  /**
   * Realiza o login do usuário
   */
  login(credentials: LoginRequest): Observable<LoginResponse> {
    this.isLoading.set(true);
    this.error.set(null);

    // Limpar formatação do WhatsApp (apenas números)
    const cleanCredentials = {
      ...credentials,
      whatsapp: this.cleanWhatsApp(credentials.whatsapp)
    };

    return this.http
      .post<LoginResponse>(`${this.API_URL}/auth/login`, cleanCredentials)
      .pipe(
        tap((response) => {
          if (response.status === 'success' && response.token && response.user) {
            this.handleAuthSuccess(response.token, response.user);
          } else {
            this.error.set(response.message || 'Erro ao fazer login');
          }
          this.isLoading.set(false);
        }),
        catchError((error) => this.handleError(error))
      );
  }

  /**
   * Realiza o registro de novo usuário
   */
  register(userData: RegisterRequest): Observable<RegisterResponse> {
    this.isLoading.set(true);
    this.error.set(null);

    // Limpar formatação do WhatsApp (apenas números)
    const cleanUserData = {
      ...userData,
      whatsapp: this.cleanWhatsApp(userData.whatsapp)
    };

    return this.http
      .post<RegisterResponse>(`${this.API_URL}/auth/register`, cleanUserData)
      .pipe(
        tap((response) => {
          if (response.status === 'success' && response.token && response.user) {
            this.handleAuthSuccess(response.token, response.user);
          } else {
            this.error.set(response.message || 'Erro ao criar conta');
          }
          this.isLoading.set(false);
        }),
        catchError((error) => this.handleError(error))
      );
  }

  /**
   * Realiza o logout do usuário
   */
  logout(): void {
    // Limpar token e dados do usuário
    localStorage.removeItem(this.TOKEN_KEY);
    localStorage.removeItem('meusecretario_user');

    // Resetar signals
    this.isAuthenticated.set(false);
    this.currentUser.set(null);
    this.currentUserSubject.next(null);
    this.error.set(null);

    // Redirecionar para login
    this.router.navigate(['/auth/login']);
  }

  /**
   * Obtém o token JWT armazenado
   */
  getToken(): string | null {
    return localStorage.getItem(this.TOKEN_KEY);
  }

  /**
   * Obtém os dados do usuário atual
   */
  getCurrentUser(): User | null {
    return this.currentUser();
  }

  /**
   * Manipula sucesso de autenticação (login/registro)
   */
  private handleAuthSuccess(token: string, user: User): void {
    // Salvar token e dados do usuário
    localStorage.setItem(this.TOKEN_KEY, token);
    localStorage.setItem('meusecretario_user', JSON.stringify(user));

    // Atualizar signals
    this.isAuthenticated.set(true);
    this.currentUser.set(user);
    this.currentUserSubject.next(user);

    // Redirecionar para dashboard
    this.router.navigate(['/dashboard']);
  }

  /**
   * Manipula erros HTTP
   */
  private handleError(error: HttpErrorResponse): Observable<never> {
    this.isLoading.set(false);

    let errorMessage = 'Ocorreu um erro. Tente novamente.';

    if (error.error instanceof ErrorEvent) {
      // Erro do lado do cliente
      errorMessage = `Erro: ${error.error.message}`;
    } else {
      // Erro do lado do servidor
      if (error.error && error.error.message) {
        errorMessage = error.error.message;
      } else if (error.status === 0) {
        errorMessage = 'Não foi possível conectar ao servidor. Verifique sua conexão.';
      } else if (error.status === 401) {
        errorMessage = 'WhatsApp ou senha incorretos.';
      } else if (error.status === 400) {
        errorMessage = error.error?.message || 'Dados inválidos. Verifique os campos.';
      } else if (error.status === 409) {
        errorMessage = 'Este WhatsApp já está cadastrado.';
      } else if (error.status >= 500) {
        errorMessage = 'Erro no servidor. Tente novamente mais tarde.';
      }
    }

    this.error.set(errorMessage);
    console.error('Erro na autenticação:', error);

    return throwError(() => new Error(errorMessage));
  }

  /**
   * Limpa mensagens de erro
   */
  clearError(): void {
    this.error.set(null);
  }

  /**
   * Remove formatação do WhatsApp (deixa apenas números)
   */
  private cleanWhatsApp(whatsapp: string): string {
    return whatsapp.replace(/\D/g, '');
  }
}
