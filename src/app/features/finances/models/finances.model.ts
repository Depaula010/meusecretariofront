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
  tipo: 'Receita' | 'Despesa'; // Alterado de 'receita' | 'despesa'
  categoria: string;
  data: string;
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
  tipo: 'Receita' | 'Despesa';
  data: string;
  subcategoria_id: number;
  conta_id: number;
  observacoes?: string;
  consolidada?: boolean;
}

/**
 * Filtros para busca de transações
 */
export interface TransactionFilters {
  tipo?: 'Receita' | 'Despesa'; // Alterado de 'receita' | 'despesa'
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

// ==========================================
// CATEGORIAS (do backend)
// ==========================================

/**
 * Subcategoria
 */
export interface SubCategory {
  id: number;
  nome: string;
}

/**
 * Categoria com macro e subcategorias
 */
export interface Category {
  grupo: string;
  macro_id: number;
  macro_categoria: string;
  subcategorias: SubCategory[];
}

/**
 * Response da API - Lista de Categorias
 */
export interface CategoriesResponse {
  status: 'success' | 'error';
  data?: Category[];
  message?: string;
}

// ==========================================
// CONTAS MENSAIS (AGENDAMENTOS)
// ==========================================

/**
 * Conta Mensal / Agendamento (água, luz, internet, etc.)
 */
export interface ScheduledBill {
  id: number;
  descricao: string;
  valor_previsto?: number;
  tipo_agendamento: 'FIXO' | 'LEMBRETE_VARIAVEL';
  tipo_transacao: 'Receita' | 'Despesa'; // derivado do grupo da categoria
  grupo?: string;                          // ex: "Renda", "Moradia", "Lazer"
  periodicidade: 'DIARIA' | 'SEMANAL' | 'QUINZENAL' | 'MENSAL' | 'ANUAL';
  dia_execucao: number;
  mes_execucao?: number;
  notificar_antes_dias: number;
  subcategoria_id: number;
  subcategoria_nome?: string;
  macro_categoria_nome?: string;
  conta_id: number;
  conta_nome?: string;
  data_inicio: string;
  incluir_na_reserva?: boolean;
}

/**
 * Request para criar/editar conta mensal
 */
export interface ScheduledBillRequest {
  descricao: string;
  valor_previsto?: number;
  tipo_agendamento: 'FIXO' | 'LEMBRETE_VARIAVEL';
  periodicidade: 'DIARIA' | 'SEMANAL' | 'QUINZENAL' | 'MENSAL' | 'ANUAL';
  dia_execucao: number;
  mes_execucao?: number | null;
  notificar_antes_dias?: number;
  subcategoria_id: number;
  conta_id: number;
  data_inicio?: string;
  incluir_na_reserva?: boolean;
}

/**
 * Response da API - Lista de Contas Mensais
 */
export interface BillsResponse {
  status: 'success' | 'error';
  data?: ScheduledBill[];
  message?: string;
}

/**
 * Response da API - Criar/Atualizar Conta Mensal
 */
export interface BillCreateResponse {
  status: 'success' | 'error';
  data?: ScheduledBill;
  message?: string;
}

/**
 * Reserva de Emergência (calculada pelo backend)
 */
export interface EmergencyReserveInfo {
  meta: number;                    // valor total da reserva ideal
  gasto_mensal_equivalente: number; // custo mensal base
  meses_configurados: number;       // ex: 6 meses
}

/**
 * Resumo financeiro das contas mensais
 */
export interface BillsSummary {
  total_despesas_mensais: number;
  total_despesas_anuais: number;
  total_receitas_mensais: number;
  reserva_emergencia: EmergencyReserveInfo;
}

/**
 * Response da API - Resumo das Contas Mensais
 */
export interface BillsSummaryResponse {
  status: 'success' | 'error';
  data?: BillsSummary;
  message?: string;
}
