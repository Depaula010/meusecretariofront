/**
 * Modelos de Dados do Dashboard
 *
 * Tipos TypeScript alinhados com os campos reais retornados pela API backend.
 */

/**
 * Resumo/Summary do Dashboard (KPIs)
 * Endpoint: GET /api/dashboard/summary
 * Backend retorna: saldo_total, receitas_mes, despesas_mes, saldo_mes, mes_referencia
 */
export interface DashboardSummary {
  saldo_total: number;
  receitas_mes: number;
  despesas_mes: number;
  saldo_mes: number;
  mes_referencia: string;
}

/**
 * Dados de gráficos
 * Endpoint: GET /api/dashboard/charts?meses=3
 * Backend retorna: gastos_mensais, gastos_categoria, gastos_dia_semana
 */
export interface DashboardCharts {
  gastos_mensais: { mes: string; total: number }[];
  gastos_categoria: { macro_categoria: string; subcategoria: string; total: number; quantidade: number }[];
  gastos_dia_semana: { dia: string; total: number; quantidade: number }[];
}

/**
 * Transação Recente
 * Endpoint: GET /api/dashboard/recent
 * Backend retorna tipo como "Renda"/"Despesa" (capitalizado) e campo "conta"
 */
export interface RecentTransaction {
  id: number;
  descricao: string;
  valor: number;
  tipo: 'Renda' | 'Despesa' | 'Transferência' | 'Pagamento Fatura';
  categoria: string;
  data: string;
  conta?: string;
}

/**
 * Alerta de conta a vencer
 * Endpoint: GET /api/dashboard/alerts
 */
export interface UpcomingAlert {
  id: string;
  descricao: string;
  subcategoria: string | null;
  valor_previsto: number | null;
  dia_execucao: number;
  dias_restantes: number;
  data_vencimento: string;
  tipo: 'danger' | 'warning' | 'info';
  tipo_agendamento: 'FIXO' | 'PARCELADO' | 'LEMBRETE_VARIAVEL';
}

// ==========================================
// Response Wrappers
// ==========================================

export interface DashboardSummaryResponse {
  status: 'success' | 'error';
  data?: DashboardSummary;
  message?: string;
}

export interface DashboardChartsResponse {
  status: 'success' | 'error';
  data?: DashboardCharts;
  message?: string;
}

export interface RecentTransactionsResponse {
  status: 'success' | 'error';
  data?: RecentTransaction[];
  message?: string;
}

export interface DashboardAlertsResponse {
  status: 'success' | 'error';
  data?: UpcomingAlert[];
  message?: string;
}
