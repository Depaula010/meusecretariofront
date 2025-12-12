import { Component, OnInit, signal, computed } from '@angular/core';
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
} from 'lucide-angular';
import { FinancesService } from './services/finances.service';
import { Transaction, TransactionFilters } from './models/finances.model';

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
  imports: [CommonModule, FormsModule, LucideAngularModule],
  templateUrl: './transactions.component.html',
  styleUrls: ['./transactions.component.scss']
})
export class TransactionsComponent implements OnInit {
  // Ícones
  TrendingUpIcon = TrendingUp;
  TrendingDownIcon = TrendingDown;
  FilterIcon = Filter;
  PlusIcon = Plus;
  CalendarIcon = Calendar;
  DollarSignIcon = DollarSign;

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

  // Computed: Estatísticas
  totalReceitas = computed(() => {
    return this.transactions()
      .filter(t => t.tipo === 'receita')
      .reduce((sum, t) => sum + t.valor, 0);
  });

  totalDespesas = computed(() => {
    return this.transactions()
      .filter(t => t.tipo === 'despesa')
      .reduce((sum, t) => sum + t.valor, 0);
  });

  saldoPeriodo = computed(() => {
    return this.totalReceitas() - this.totalDespesas();
  });

  constructor(private financesService: FinancesService) {}

  ngOnInit(): void {
    this.loadTransactions();
  }

  /**
   * Carregar transações do backend
   */
  loadTransactions(): void {
    this.loading.set(true);
    this.error.set(null);

    this.financesService.getTransactions(this.filters()).subscribe({
      next: (response) => {
        this.transactions.set(response.data || []);
        if (response.pagination) {
          this.pagination.set(response.pagination);
        }
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
  applyFilters(tipo?: 'receita' | 'despesa'): void {
    this.filters.update(f => ({
      ...f,
      tipo,
      offset: 0 // Reset paginação
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

  /**
   * Formatar data (YYYY-MM-DD -> DD/MM/YYYY)
   */
  formatDate(dateString: string): string {
    const date = new Date(dateString + 'T00:00:00');
    return date.toLocaleDateString('pt-BR');
  }

  /**
   * Obter cor da badge de tipo
   */
  getTypeBadgeClass(tipo: 'receita' | 'despesa'): string {
    return tipo === 'receita'
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
}
