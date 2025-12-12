import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpParams } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { environment } from '../../../../environments/environment';
import {
  Transaction,
  TransactionRequest,
  TransactionFilters,
  TransactionsResponse,
  TransactionCreateResponse,
  BankAccount,
  BankAccountRequest,
  BankAccountsResponse,
  BankAccountCreateResponse,
} from '../models/finances.model';

/**
 * Finances Service
 *
 * Serviço responsável por gerenciar transações e contas bancárias:
 * - GET /api/finances/transactions - Lista transações com filtros
 * - POST /api/finances/transactions - Cria nova transação
 * - GET /api/finances/accounts - Lista contas bancárias
 * - POST /api/finances/accounts - Cria nova conta bancária
 *
 * Todos os endpoints exigem autenticação (token JWT via interceptor)
 */
@Injectable({
  providedIn: 'root',
})
export class FinancesService {
  private readonly API_URL = `${environment.apiUrl}${environment.apiPrefix}`;

  constructor(private http: HttpClient) {}

  // ==========================================
  // TRANSAÇÕES
  // ==========================================

  /**
   * Obtém lista de transações com filtros opcionais
   *
   * Endpoint: GET /api/finances/transactions
   *
   * @param filters - Filtros opcionais (tipo, categoria, período, paginação)
   * @returns Observable com array de transações e paginação
   */
  getTransactions(filters?: TransactionFilters): Observable<TransactionsResponse> {
    let params = new HttpParams();

    if (filters) {
      if (filters.tipo) params = params.set('tipo', filters.tipo);
      if (filters.categoria) params = params.set('categoria', filters.categoria);
      if (filters.data_inicio) params = params.set('data_inicio', filters.data_inicio);
      if (filters.data_fim) params = params.set('data_fim', filters.data_fim);
      if (filters.limit) params = params.set('limit', filters.limit.toString());
      if (filters.offset) params = params.set('offset', filters.offset.toString());
    }

    return this.http
      .get<TransactionsResponse>(`${this.API_URL}/api/finances/transactions`, { params })
      .pipe(
        map((response) => {
          if (response.status === 'success') {
            return response;
          }
          throw new Error(response.message || 'Erro ao carregar transações');
        }),
        catchError(this.handleError)
      );
  }

  /**
   * Cria nova transação (receita ou despesa)
   *
   * Endpoint: POST /api/finances/transactions
   *
   * @param transaction - Dados da transação
   * @returns Observable com transação criada
   */
  createTransaction(transaction: TransactionRequest): Observable<Transaction> {
    return this.http
      .post<TransactionCreateResponse>(`${this.API_URL}/api/finances/transactions`, transaction)
      .pipe(
        map((response) => {
          if (response.status === 'success' && response.data) {
            return response.data;
          }
          throw new Error(response.message || 'Erro ao criar transação');
        }),
        catchError(this.handleError)
      );
  }

  /**
   * Atualiza transação existente
   *
   * Endpoint: PUT /api/finances/transactions/:id
   *
   * @param id - ID da transação
   * @param transaction - Dados atualizados
   * @returns Observable com transação atualizada
   */
  updateTransaction(id: number, transaction: Partial<TransactionRequest>): Observable<Transaction> {
    return this.http
      .put<TransactionCreateResponse>(`${this.API_URL}/api/finances/transactions/${id}`, transaction)
      .pipe(
        map((response) => {
          if (response.status === 'success' && response.data) {
            return response.data;
          }
          throw new Error(response.message || 'Erro ao atualizar transação');
        }),
        catchError(this.handleError)
      );
  }

  /**
   * Deleta transação
   *
   * Endpoint: DELETE /api/finances/transactions/:id
   *
   * @param id - ID da transação
   * @returns Observable void
   */
  deleteTransaction(id: number): Observable<void> {
    return this.http
      .delete<{ status: string; message?: string }>(`${this.API_URL}/api/finances/transactions/${id}`)
      .pipe(
        map((response) => {
          if (response.status === 'success') {
            return;
          }
          throw new Error(response.message || 'Erro ao deletar transação');
        }),
        catchError(this.handleError)
      );
  }

  // ==========================================
  // CONTAS BANCÁRIAS
  // ==========================================

  /**
   * Obtém lista de contas bancárias
   *
   * Endpoint: GET /api/finances/accounts
   *
   * @returns Observable com array de contas bancárias
   */
  getAccounts(): Observable<BankAccount[]> {
    return this.http
      .get<BankAccountsResponse>(`${this.API_URL}/api/finances/accounts`)
      .pipe(
        map((response) => {
          if (response.status === 'success' && response.data) {
            return response.data;
          }
          throw new Error(response.message || 'Erro ao carregar contas');
        }),
        catchError(this.handleError)
      );
  }

  /**
   * Cria nova conta bancária
   *
   * Endpoint: POST /api/finances/accounts
   *
   * @param account - Dados da conta
   * @returns Observable com conta criada
   */
  createAccount(account: BankAccountRequest): Observable<BankAccount> {
    return this.http
      .post<BankAccountCreateResponse>(`${this.API_URL}/api/finances/accounts`, account)
      .pipe(
        map((response) => {
          if (response.status === 'success' && response.data) {
            return response.data;
          }
          throw new Error(response.message || 'Erro ao criar conta');
        }),
        catchError(this.handleError)
      );
  }

  /**
   * Atualiza conta bancária
   *
   * Endpoint: PUT /api/finances/accounts/:id
   *
   * @param id - ID da conta
   * @param account - Dados atualizados
   * @returns Observable com conta atualizada
   */
  updateAccount(id: number, account: Partial<BankAccountRequest>): Observable<BankAccount> {
    return this.http
      .put<BankAccountCreateResponse>(`${this.API_URL}/api/finances/accounts/${id}`, account)
      .pipe(
        map((response) => {
          if (response.status === 'success' && response.data) {
            return response.data;
          }
          throw new Error(response.message || 'Erro ao atualizar conta');
        }),
        catchError(this.handleError)
      );
  }

  /**
   * Deleta conta bancária
   *
   * Endpoint: DELETE /api/finances/accounts/:id
   *
   * @param id - ID da conta
   * @returns Observable void
   */
  deleteAccount(id: number): Observable<void> {
    return this.http
      .delete<{ status: string; message?: string }>(`${this.API_URL}/api/finances/accounts/${id}`)
      .pipe(
        map((response) => {
          if (response.status === 'success') {
            return;
          }
          throw new Error(response.message || 'Erro ao deletar conta');
        }),
        catchError(this.handleError)
      );
  }

  // ==========================================
  // ERROR HANDLING
  // ==========================================

  /**
   * Manipula erros HTTP
   */
  private handleError(error: HttpErrorResponse): Observable<never> {
    let errorMessage = 'Ocorreu um erro ao processar a requisição.';

    if (error.error instanceof ErrorEvent) {
      // Erro do lado do cliente
      errorMessage = `Erro: ${error.error.message}`;
    } else {
      // Erro do lado do servidor
      if (error.status === 0) {
        errorMessage = 'Não foi possível conectar ao servidor.';
      } else if (error.status === 401) {
        errorMessage = 'Sessão expirada. Faça login novamente.';
      } else if (error.status === 403) {
        errorMessage = 'Você não tem permissão para realizar esta ação.';
      } else if (error.status === 404) {
        errorMessage = 'Recurso não encontrado.';
      } else if (error.status >= 500) {
        errorMessage = 'Erro no servidor. Tente novamente mais tarde.';
      } else if (error.error?.message) {
        errorMessage = error.error.message;
      }
    }

    console.error('Erro no Finances Service:', error);
    return throwError(() => new Error(errorMessage));
  }
}
