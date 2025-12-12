import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { environment } from '../../../../environments/environment';
import {
  DashboardSummary,
  DashboardCharts,
  RecentTransaction,
  DashboardSummaryResponse,
  DashboardChartsResponse,
  RecentTransactionsResponse,
} from '../models/dashboard.model';

/**
 * Dashboard Service
 *
 * Serviço responsável por consumir os endpoints do dashboard do backend:
 * - GET /api/dashboard/summary - Retorna KPIs (saldo, receitas, despesas, cartão)
 * - GET /api/dashboard/charts - Retorna dados para gráficos
 * - GET /api/dashboard/recent-transactions - Retorna últimas transações
 *
 * Todos os endpoints exigem autenticação (token JWT via interceptor)
 */
@Injectable({
  providedIn: 'root',
})
export class DashboardService {
  private readonly API_URL = `${environment.apiUrl}${environment.apiPrefix}`;

  constructor(private http: HttpClient) {}

  /**
   * Obtém o resumo/summary do dashboard (KPIs)
   *
   * Endpoint: GET /api/dashboard/summary
   *
   * Retorna:
   * - saldo_atual: Saldo total de todas as contas
   * - total_receitas: Total de receitas do mês atual
   * - total_despesas: Total de despesas do mês atual
   * - cartao_de_credito: Fatura do cartão de crédito
   * - periodo: Descrição do período (ex: "Dezembro 2024")
   */
  getSummary(): Observable<DashboardSummary> {
    return this.http
      .get<DashboardSummaryResponse>(`${this.API_URL}/api/dashboard/summary`)
      .pipe(
        map((response) => {
          if (response.status === 'success' && response.data) {
            return response.data;
          }
          throw new Error(response.message || 'Erro ao carregar resumo');
        }),
        catchError(this.handleError)
      );
  }

  /**
   * Obtém dados para os gráficos do dashboard
   *
   * Endpoint: GET /api/dashboard/charts
   *
   * Retorna:
   * - evolucao_saldo: Evolução do saldo nos últimos 6 meses
   * - receitas_despesas: Comparativo receitas vs despesas dos últimos 6 meses
   * - distribuicao_categorias: Distribuição de despesas por categoria (mês atual)
   */
  getCharts(): Observable<DashboardCharts> {
    return this.http
      .get<DashboardChartsResponse>(`${this.API_URL}/api/dashboard/charts`)
      .pipe(
        map((response) => {
          if (response.status === 'success' && response.data) {
            return response.data;
          }
          throw new Error(response.message || 'Erro ao carregar gráficos');
        }),
        catchError(this.handleError)
      );
  }

  /**
   * Obtém as transações recentes (últimas 10)
   *
   * Endpoint: GET /api/dashboard/recent-transactions
   *
   * Retorna array de transações com:
   * - id, descricao, valor, tipo, categoria, data, conta_bancaria
   */
  getRecentTransactions(): Observable<RecentTransaction[]> {
    return this.http
      .get<RecentTransactionsResponse>(
        `${this.API_URL}/api/dashboard/recent-transactions`
      )
      .pipe(
        map((response) => {
          if (response.status === 'success' && response.data) {
            return response.data;
          }
          throw new Error(response.message || 'Erro ao carregar transações');
        }),
        catchError(this.handleError)
      );
  }

  /**
   * Manipula erros HTTP
   */
  private handleError(error: HttpErrorResponse): Observable<never> {
    let errorMessage = 'Ocorreu um erro ao carregar os dados.';

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
        errorMessage = 'Você não tem permissão para acessar estes dados.';
      } else if (error.status >= 500) {
        errorMessage = 'Erro no servidor. Tente novamente mais tarde.';
      } else if (error.error?.message) {
        errorMessage = error.error.message;
      }
    }

    console.error('Erro no Dashboard Service:', error);
    return throwError(() => new Error(errorMessage));
  }
}
