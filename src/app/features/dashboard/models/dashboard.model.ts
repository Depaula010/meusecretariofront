/**
 * Modelos de Dados do Dashboard
 *
 * Tipos TypeScript para os dados consumidos da API de Dashboard
 */

/**
 * Resumo/Summary do Dashboard (KPIs)
 */
export interface DashboardSummary {
  saldo_atual: number;
  total_receitas: number;
  total_despesas: number;
  cartao_de_credito: number;
  periodo: string;
}

/**
 * Dados de Gráficos
 */
export interface DashboardCharts {
  evolucao_saldo: {
    labels: string[];
    valores: number[];
  };
  receitas_despesas: {
    labels: string[];
    receitas: number[];
    despesas: number[];
  };
  distribuicao_categorias: {
    categorias: string[];
    valores: number[];
  };
}

/**
 * Transação Recente
 */
export interface RecentTransaction {
  id: number;
  descricao: string;
  valor: number;
  tipo: 'receita' | 'despesa';
  categoria: string;
  data: string;
  conta_bancaria?: string;
}

/**
 * Alerta Financeiro
 */
export interface FinancialAlert {
  id: string;
  title: string;
  description: string;
  type: 'warning' | 'info' | 'danger';
  date: Date;
  value?: number;
}

/**
 * Response da API - Summary
 */
export interface DashboardSummaryResponse {
  status: 'success' | 'error';
  data?: DashboardSummary;
  message?: string;
}

/**
 * Response da API - Charts
 */
export interface DashboardChartsResponse {
  status: 'success' | 'error';
  data?: DashboardCharts;
  message?: string;
}

/**
 * Response da API - Recent Transactions
 */
export interface RecentTransactionsResponse {
  status: 'success' | 'error';
  data?: RecentTransaction[];
  message?: string;
}
