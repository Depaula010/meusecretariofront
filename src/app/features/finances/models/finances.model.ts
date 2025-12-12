/**
 * Modelos de Dados do Módulo Finances
 *
 * Tipos TypeScript para transações, contas bancárias e filtros
 */

/**
 * Transação (Receita ou Despesa)
 */
export interface Transaction {
  id: number;
  descricao: string;
  valor: number;
  tipo: 'receita' | 'despesa';
  categoria: string;
  data: string; // ISO 8601 format (YYYY-MM-DD)
  conta_bancaria?: string;
  conta_bancaria_id?: number;
  observacoes?: string;
}

/**
 * Request para criar/editar transação
 */
export interface TransactionRequest {
  descricao: string;
  valor: number;
  tipo: 'receita' | 'despesa';
  categoria: string;
  data: string;
  conta_bancaria_id: number;
  observacoes?: string;
}

/**
 * Filtros para busca de transações
 */
export interface TransactionFilters {
  tipo?: 'receita' | 'despesa';
  categoria?: string;
  data_inicio?: string;
  data_fim?: string;
  limit?: number;
  offset?: number;
}

/**
 * Paginação de transações
 */
export interface TransactionPagination {
  total: number;
  limit: number;
  offset: number;
  has_more: boolean;
}

/**
 * Response da API - Lista de Transações
 */
export interface TransactionsResponse {
  status: 'success' | 'error';
  data?: Transaction[];
  pagination?: TransactionPagination;
  message?: string;
}

/**
 * Response da API - Criar Transação
 */
export interface TransactionCreateResponse {
  status: 'success' | 'error';
  data?: Transaction;
  message?: string;
}

/**
 * Conta Bancária
 */
export interface BankAccount {
  id: number;
  nome: string;
  tipo: 'corrente' | 'poupanca' | 'cartao_credito' | 'investimento';
  saldo: number;
  banco: string;
  cor?: string;
  // Campos específicos para cartão de crédito
  limite?: number;
  dia_vencimento?: number;
  dia_fechamento?: number;
}

/**
 * Request para criar/editar conta bancária
 */
export interface BankAccountRequest {
  nome: string;
  tipo: 'corrente' | 'poupanca' | 'cartao_credito' | 'investimento';
  banco: string;
  saldo: number;
  cor?: string;
  limite?: number;
  dia_vencimento?: number;
  dia_fechamento?: number;
}

/**
 * Response da API - Lista de Contas
 */
export interface BankAccountsResponse {
  status: 'success' | 'error';
  data?: BankAccount[];
  message?: string;
}

/**
 * Response da API - Criar Conta
 */
export interface BankAccountCreateResponse {
  status: 'success' | 'error';
  data?: BankAccount;
  message?: string;
}

/**
 * Estatísticas de Transações (para exibir no topo da lista)
 */
export interface TransactionStats {
  total_receitas: number;
  total_despesas: number;
  saldo_periodo: number;
  quantidade_transacoes: number;
}
