import { Component, OnInit, signal, computed, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  LucideAngularModule,
  TrendingUp,
  TrendingDown,
  Filter,
  Plus,
  Calendar,
  DollarSign,
  Pencil,
  Trash2,
} from 'lucide-angular';
import { FinancesService } from './services/finances.service';
import { Transaction, TransactionFilters } from './models/finances.model';
import { TransactionModalComponent } from './components/transaction-modal.component';
import { ConfirmDialogComponent } from '../../shared/components/confirm-dialog.component';
import { finalize } from 'rxjs/operators';

/**
 * Transactions Component
 *
 * Lista completa de transações (receitas e despesas) com:
 * - Filtros por tipo, categoria e período
 * - Paginação
 * - Cards de resumo (total receitas, despesas, saldo)
 * - Tabela responsiva com dados da API
 */
@Component({
  selector: 'app-transactions',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    LucideAngularModule,
    TransactionModalComponent,
    ConfirmDialogComponent
  ],
  templateUrl: './transactions.component.html',
  styleUrls: ['./transactions.component.scss']
})
export class TransactionsComponent implements OnInit {
  // ViewChild para modais
  @ViewChild('transactionModal') transactionModal!: TransactionModalComponent;
  @ViewChild('confirmDialog') confirmDialog!: ConfirmDialogComponent;

  // Ícones
  TrendingUpIcon = TrendingUp;
  TrendingDownIcon = TrendingDown;
  FilterIcon = Filter;
  PlusIcon = Plus;
  CalendarIcon = Calendar;
  DollarSignIcon = DollarSign;
  PencilIcon = Pencil;
  TrashIcon = Trash2;

  // Estado para edição/exclusão
  selectedTransaction = signal<Transaction | null>(null);
  transactionToDelete = signal<Transaction | null>(null);

  // Math para usar no template
  Math = Math;

  // Signals de Estado
  loading = signal(true);
  error = signal<string | null>(null);
  transactions = signal<Transaction[]>([]);
  showFilters = signal(false);

  // Filtros
  filters = signal<TransactionFilters>({
    limit: 50,
    offset: 0
  });

  // Paginação
  pagination = signal({
    total: 0,
    limit: 50,
    offset: 0,
    has_more: false
  });

  // Computed: Estatísticas ajustadas para bater com o padrão do Backend
  totalReceitas = computed(() => {
    const list = this.transactions();
    if (!Array.isArray(list)) return 0;

    // Procura por 'Receita' com R maiúsculo
    return list
      .filter(t => t.tipo === 'Receita')
      .reduce((sum, t) => sum + t.valor, 0);
  });

  totalDespesas = computed(() => {
    const list = this.transactions();
    if (!Array.isArray(list)) return 0;

    // Procura por 'Despesa' com D maiúsculo
    return list
      .filter(t => t.tipo === 'Despesa')
      .reduce((sum, t) => sum + t.valor, 0);
  });

  saldoPeriodo = computed(() => {
    return this.totalReceitas() - this.totalDespesas();
  });

  constructor(private financesService: FinancesService) { }

  ngOnInit(): void {
    this.loadTransactions();
  }

  /**
   * Carregar transações do backend
   */
  // No transactions.component.ts
  loadTransactions(): void {
    this.loading.set(true);
    this.error.set(null);

    this.financesService.getTransactions(this.filters()).subscribe({
      next: (response: any) => {
        // De acordo com o log, os dados reais estão em response.data
        const apiData = response.data;

        // 1. Extraímos a lista de transações (que é o Array(50) do print)
        const transactionsList = apiData?.transactions || [];
        this.transactions.set(transactionsList);

        // 2. Extraímos a paginação que também está dentro de 'data'
        this.pagination.set({
          total: apiData?.total || 0,
          limit: apiData?.limit || 50,
          offset: apiData?.offset || 0,
          has_more: (apiData?.offset + (apiData?.limit || 0)) < (apiData?.total || 0)
        });

        this.loading.set(false);
      },
      error: (err) => {
        console.error('Erro ao carregar transações:', err);
        this.error.set('Erro ao carregar transações. Tente novamente.');
        this.loading.set(false);
      }
    });
  }

  /**
   * Aplicar filtros
   */


  applyFilters(tipo?: 'Receita' | 'Despesa'): void {
    this.filters.update(f => ({
      ...f,
      tipo,
      offset: 0
    }));
    this.loadTransactions();
  }

  /**
   * Limpar filtros
   */
  clearFilters(): void {
    this.filters.set({ limit: 50, offset: 0 });
    this.loadTransactions();
  }

  /**
   * Toggle exibição de filtros
   */
  toggleFilters(): void {
    this.showFilters.update(v => !v);
  }

  /**
   * Formatar valor monetário
   */
  formatCurrency(value: number): string {
    return value.toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    });
  }


  formatDate(dateString: any): string {
    if (!dateString) return '-';

    try {
      const date = new Date(dateString + 'T00:00:00');
      if (isNaN(date.getTime())) {
        return '-';
      }

      return date.toLocaleDateString('pt-BR');
    } catch (e) {
      return '-';
    }
  }

  /**
   * Obter cor da badge de tipo
   */
  getTypeBadgeClass(tipo: string): string {
    return tipo === 'Receita'
      ? 'bg-green-100 text-green-800 border-green-200'
      : 'bg-red-100 text-red-800 border-red-200';
  }

  /**
   * Paginação: Próxima página
   */
  nextPage(): void {
    const pag = this.pagination();
    if (pag.has_more) {
      this.filters.update(f => ({
        ...f,
        offset: f.offset! + pag.limit
      }));
      this.loadTransactions();
    }
  }

  /**
   * Paginação: Página anterior
   */
  previousPage(): void {
    const pag = this.pagination();
    if (pag.offset > 0) {
      this.filters.update(f => ({
        ...f,
        offset: Math.max(0, f.offset! - pag.limit)
      }));
      this.loadTransactions();
    }
  }

  // ==========================================
  // CRUD OPERATIONS
  // ==========================================

  /**
   * Abre modal para criar nova transação
   */
  openNewTransaction(tipo?: 'receita' | 'despesa'): void {
    this.selectedTransaction.set(null);
    this.transactionModal.open(tipo);
  }

  /**
   * Abre modal para editar transação existente
   */
  editTransaction(transaction: Transaction): void {
    this.selectedTransaction.set(transaction);
    this.transactionModal.open();
  }

  /**
   * Abre dialog de confirmação para deletar
   */
  confirmDelete(transaction: Transaction): void {
    this.transactionToDelete.set(transaction);
    this.confirmDialog.open();
  }

  /**
   * Deleta transação após confirmação
   */
  deleteTransaction(): void {
    const transaction = this.transactionToDelete();
    if (!transaction) return;

    this.loading.set(true);
    this.financesService.deleteTransaction(transaction.id).pipe(
      finalize(() => {
        this.loading.set(false);
        this.transactionToDelete.set(null);
      })
    ).subscribe({
      next: () => {
        this.loadTransactions();
      },
      error: (err) => {
        this.error.set(err.message || 'Erro ao excluir transação');
      }
    });
  }

  /**
   * Callback quando transação é salva (criar ou editar)
   */
  onTransactionSaved(transaction: Transaction): void {
    this.loadTransactions();
  }
}
