import { Component, OnInit, signal, computed, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
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
} from 'lucide-angular';
import { forkJoin } from 'rxjs';
import { finalize } from 'rxjs/operators';
import { FinancesService } from './services/finances.service';
import { ScheduledBill, BillsSummary } from './models/finances.model';
import { BillModalComponent } from './components/bill-modal.component';

/**
 * Bills Component
 *
 * Tela de gerenciamento de contas mensais (água, luz, internet, salário, etc.)
 * Layout de lista agrupada + 5 cards informativos no topo.
 */
@Component({
  selector: 'app-bills',
  standalone: true,
  imports: [CommonModule, LucideAngularModule, BillModalComponent],
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

  // ── Signals de estado ──
  loading = signal(true);
  error = signal<string | null>(null);
  bills = signal<ScheduledBill[]>([]);
  summary = signal<BillsSummary | null>(null);
  selectedBill = signal<ScheduledBill | null>(null);
  showDeleteDialog = signal(false);
  deleting = signal(false);
  showReserveDetails = signal(false);

  // ── Seções colapsáveis ──
  despesasExpanded = signal(true);
  receitasExpanded = signal(true);

  // ── Computed: separação por tipo ──
  despesas = computed(() => this.bills().filter(b => b.tipo_transacao === 'Despesa'));
  receitas = computed(() => this.bills().filter(b => b.tipo_transacao === 'Receita'));

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

  constructor(private financesService: FinancesService) { }

  ngOnInit(): void {
    this.loadAll();
  }

  loadAll(): void {
    this.loading.set(true);
    this.error.set(null);

    forkJoin({
      bills: this.financesService.getBills(),
      summary: this.financesService.getBillsSummary(),
    }).pipe(finalize(() => this.loading.set(false)))
      .subscribe({
        next: ({ bills, summary }) => {
          this.bills.set(bills);
          this.summary.set(summary);
        },
        error: (err) => this.error.set(err.message || 'Erro ao carregar contas mensais.'),
      });
  }

  loadBills(): void {
    this.loadAll();
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
        this.loadAll();
      },
      error: (err) => {
        this.error.set(err.message || 'Erro ao remover conta mensal');
        this.showDeleteDialog.set(false);
      }
    });
  }

  onBillSaved(_bill: ScheduledBill): void {
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
