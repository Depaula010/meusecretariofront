import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import {
  DashboardSummary,
  DashboardCharts,
  RecentTransaction,
  UpcomingAlert,
  DashboardSummaryResponse,
  DashboardChartsResponse,
  RecentTransactionsResponse,
  DashboardAlertsResponse,
} from '../models/dashboard.model';

/**
 * Dashboard Service
 *
 * Endpoints consumidos:
 * - GET /api/dashboard/summary  — KPIs (saldo_total, receitas_mes, despesas_mes)
 * - GET /api/dashboard/charts   — Gastos mensais, por categoria, por dia da semana
 * - GET /api/dashboard/recent   — Últimas 10 transações
 * - GET /api/dashboard/alerts   — Contas a vencer nos próximos 7 dias
 */
@Injectable({
  providedIn: 'root',
})
export class DashboardService {
  constructor(private http: HttpClient) {}

  /** Obtém KPIs: saldo total, receitas e despesas do mês */
  getSummary(): Observable<DashboardSummary> {
    return this.http.get<DashboardSummaryResponse>('/api/dashboard/summary').pipe(
      map(res => {
        if (res.status === 'success' && res.data) return res.data;
        throw new Error(res.message || 'Erro ao carregar resumo');
      }),
      catchError(this.handleError)
    );
  }

  /** Obtém dados para gráficos (gastos mensais, por categoria, por dia da semana) */
  getCharts(meses: number = 6): Observable<DashboardCharts> {
    return this.http
      .get<DashboardChartsResponse>(`/api/dashboard/charts?meses=${meses}`)
      .pipe(
        map(res => {
          if (res.status === 'success' && res.data) return res.data;
          throw new Error(res.message || 'Erro ao carregar gráficos');
        }),
        catchError(this.handleError)
      );
  }

  /** Obtém as últimas 10 transações */
  getRecentTransactions(): Observable<RecentTransaction[]> {
    return this.http.get<RecentTransactionsResponse>('/api/dashboard/recent').pipe(
      map(res => {
        if (res.status === 'success' && res.data) return res.data;
        throw new Error(res.message || 'Erro ao carregar transações');
      }),
      catchError(this.handleError)
    );
  }

  /** Obtém contas agendadas a vencer nos próximos 7 dias */
  getAlerts(): Observable<UpcomingAlert[]> {
    return this.http.get<DashboardAlertsResponse>('/api/dashboard/alerts').pipe(
      map(res => {
        if (res.status === 'success' && res.data) return res.data;
        throw new Error(res.message || 'Erro ao carregar alertas');
      }),
      catchError(this.handleError)
    );
  }

  private handleError(error: HttpErrorResponse): Observable<never> {
    let errorMessage = 'Ocorreu um erro ao carregar os dados.';
    if (error.error instanceof ErrorEvent) {
      errorMessage = `Erro: ${error.error.message}`;
    } else {
      if (error.status === 0)        errorMessage = 'Não foi possível conectar ao servidor.';
      else if (error.status === 401) errorMessage = 'Sessão expirada. Faça login novamente.';
      else if (error.status === 403) errorMessage = 'Você não tem permissão para acessar estes dados.';
      else if (error.status >= 500)  errorMessage = 'Erro no servidor. Tente novamente mais tarde.';
      else if (error.error?.message) errorMessage = error.error.message;
    }
    console.error('Erro no Dashboard Service:', error);
    return throwError(() => new Error(errorMessage));
  }
}
