import { Component, OnInit, signal, computed, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  LucideAngularModule,
  Plus,
  Pencil,
  Trash2,
  Receipt,
  Wallet,
  TrendingUp,
  TrendingDown,
  ChevronDown,
  ChevronUp,
  ArrowUpRight,
  ArrowDownRight,
  ShieldCheck,
  CalendarDays,
  BarChart2,
  Info,
  X,
  Search,
  Filter,
  ArrowUpDown,
  XCircle,
} from 'lucide-angular';
import { forkJoin } from 'rxjs';
import { finalize } from 'rxjs/operators';
import { FinancesService } from './services/finances.service';
import { ScheduledBill, BillsSummary, BankAccount } from './models/finances.model';
import { BillModalComponent } from './components/bill-modal.component';
import { ToastService } from '../../shared/services/toast.service';

/**
 * Bills Component
 *
 * Tela de gerenciamento de contas mensais (água, luz, internet, salário, etc.)
 * Layout de lista agrupada + 4 cards informativos no topo e filtros.
 */
@Component({
  selector: 'app-bills',
  standalone: true,
  imports: [CommonModule, FormsModule, LucideAngularModule, BillModalComponent],
  templateUrl: './bills.component.html',
})
export class BillsComponent implements OnInit {
  @ViewChild('billModal') billModal!: BillModalComponent;

  // ── Ícones ──
  PlusIcon = Plus;
  PencilIcon = Pencil;
  Trash2Icon = Trash2;
  ReceiptIcon = Receipt;
  WalletIcon = Wallet;
  TrendingUpIcon = TrendingUp;
  TrendingDownIcon = TrendingDown;
  ChevronDownIcon = ChevronDown;
  ChevronUpIcon = ChevronUp;
  ArrowUpIcon = ArrowUpRight;
  ArrowDownIcon = ArrowDownRight;
  ShieldIcon = ShieldCheck;
  CalendarIcon = CalendarDays;
  BarChartIcon = BarChart2;
  InfoIcon = Info;
  XIcon = X;
  SearchIcon = Search;
  FilterIcon = Filter;
  SortIcon = ArrowUpDown;
  ClearIcon = XCircle;

  // ── Signals de estado ──
  loading = signal(true);
  error = signal<string | null>(null);
  bills = signal<ScheduledBill[]>([]);
  summary = signal<BillsSummary | null>(null);
  accounts = signal<BankAccount[]>([]); // Contas bancárias para o filtro

  selectedBill = signal<ScheduledBill | null>(null);
  showDeleteDialog = signal(false);
  deleting = signal(false);
  showReserveDetails = signal(false);

  // ── Filtros e Ordenação ──
  searchTerm = signal('');
  selectedContaId = signal<number | null>(null);
  sortField = signal<'dia_execucao' | 'valor_previsto' | 'descricao'>('dia_execucao');
  sortDirection = signal<'asc' | 'desc'>('asc');

  // ── Seções colapsáveis ──
  despesasExpanded = signal(true);
  receitasExpanded = signal(true);

  // ── Helper de Filtro e Ordenação ──
  private applyFilters(items: ScheduledBill[]): ScheduledBill[] {
    let result = [...items];

    // 1. Filtro de Texto (Nome, Categoria, Subcategoria)
    const term = this.searchTerm().toLowerCase().trim();
    if (term) {
      result = result.filter(b =>
        b.descricao.toLowerCase().includes(term) ||
        b.subcategoria_nome?.toLowerCase().includes(term) ||
        b.macro_categoria_nome?.toLowerCase().includes(term)
      );
    }

    // 2. Filtro de Conta
    const contaId = this.selectedContaId();
    if (contaId) {
      result = result.filter(b => b.conta_id === contaId);
    }

    // 3. Ordenação
    const field = this.sortField();
    const direction = this.sortDirection() === 'asc' ? 1 : -1;

    result.sort((a, b) => {
      let valA = a[field];
      let valB = b[field];

      // Tratamento para nulos (ficam no final)
      if (valA === null || valA === undefined) return 1;
      if (valB === null || valB === undefined) return -1;

      // Tratamento específico para texto
      if (typeof valA === 'string') valA = valA.toLowerCase();
      if (typeof valB === 'string') valB = valB.toLowerCase();

      if (valA < valB) return -1 * direction;
      if (valA > valB) return 1 * direction;
      return 0;
    });

    return result;
  }

  // ── Computed: separação por tipo com filtros aplicados ──
  despesas = computed(() => {
    const raw = this.bills().filter(b => b.tipo_transacao === 'Despesa');
    return this.applyFilters(raw);
  });

  receitas = computed(() => {
    const raw = this.bills().filter(b => b.tipo_transacao === 'Receita');
    return this.applyFilters(raw);
  });

  // ── Computed: contas da reserva ──
  contasReserva = computed(() =>
    this.bills().filter(b => b.incluir_na_reserva === true)
  );

  // ── Computed: contas sem estimativa ──
  contasSemValor = computed(() =>
    this.bills().filter(b => b.tipo_agendamento === 'LEMBRETE_VARIAVEL' && !b.valor_previsto).length
  );

  // ── Computed: saldo previsto (do summary, mais preciso) ──
  saldoPrevisto = computed(() => {
    const s = this.summary();
    if (!s) return 0;
    return s.total_receitas_mensais - s.total_despesas_mensais;
  });

  // Labels de periodicidade
  private periodicidadeLabels: Record<string, string> = {
    DIARIA: 'Diária', SEMANAL: 'Semanal', QUINZENAL: 'Quinzenal', MENSAL: 'Mensal', ANUAL: 'Anual',
  };

  constructor(private financesService: FinancesService, private toast: ToastService) { }

  ngOnInit(): void {
    this.loadAll();
  }

  loadAll(): void {
    this.loading.set(true);
    this.error.set(null);

    forkJoin({
      bills: this.financesService.getBills(),
      summary: this.financesService.getBillsSummary(),
      accounts: this.financesService.getAccounts(),
    }).pipe(finalize(() => this.loading.set(false)))
      .subscribe({
        next: ({ bills, summary, accounts }) => {
          this.bills.set(bills);
          this.summary.set(summary);
          this.accounts.set(accounts);
        },
        error: (err) => {
          this.error.set(err.message || 'Erro ao carregar dados.');
          this.toast.error('Erro ao carregar', err.message || 'Não foi possível buscar as contas mensais.');
        },
      });
  }

  loadBills(): void {
    this.loadAll();
  }

  clearFilters(): void {
    this.searchTerm.set('');
    this.selectedContaId.set(null);
    this.sortField.set('dia_execucao');
    this.sortDirection.set('asc');
  }

  openCreateModal(): void {
    this.selectedBill.set(null);
    this.billModal.open();
  }

  openEditModal(bill: ScheduledBill): void {
    this.selectedBill.set(bill);
    this.billModal.open(bill);
  }

  confirmDelete(bill: ScheduledBill): void {
    this.selectedBill.set(bill);
    this.showDeleteDialog.set(true);
  }

  cancelDelete(): void {
    this.showDeleteDialog.set(false);
    this.selectedBill.set(null);
  }

  deleteBill(): void {
    const bill = this.selectedBill();
    if (!bill) return;
    this.deleting.set(true);
    this.financesService.deleteBill(bill.id).pipe(
      finalize(() => this.deleting.set(false))
    ).subscribe({
      next: () => {
        this.showDeleteDialog.set(false);
        this.selectedBill.set(null);
        this.toast.success('Conta removida', 'A conta mensal foi removida com sucesso.');
        this.loadAll();
      },
      error: (err) => {
        this.error.set(err.message || 'Erro ao remover conta mensal');
        this.showDeleteDialog.set(false);
        this.toast.error('Erro ao remover', err.message || 'Não foi possível remover a conta.');
      }
    });
  }

  onBillSaved(bill: ScheduledBill): void {
    const msg = bill.descricao ? `"${bill.descricao}" salva com sucesso.` : 'Conta salva com sucesso.';
    this.toast.success('Conta salva! ✓', msg);
    this.loadAll();
  }

  formatCurrency(value: number | undefined | null): string {
    if (value == null) return '—';
    return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  }

  getPeriodicidadeLabel(p: string): string {
    return this.periodicidadeLabels[p] || p;
  }

  getPeriodicidadeBadgeClass(p: string): string {
    const map: Record<string, string> = {
      DIARIA: 'bg-orange-100 text-orange-700',
      SEMANAL: 'bg-yellow-100 text-yellow-700',
      QUINZENAL: 'bg-blue-100 text-blue-700',
      MENSAL: 'bg-green-100 text-green-700',
      ANUAL: 'bg-purple-100 text-purple-700',
    };
    return map[p] || 'bg-gray-100 text-gray-700';
  }

  getMesLabel(mes: number | undefined | null): string {
    if (!mes) return '';
    return ['', 'Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'][mes] || '';
  }
}
