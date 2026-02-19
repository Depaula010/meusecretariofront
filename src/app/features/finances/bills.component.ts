import { Component, OnInit, signal, computed, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  LucideAngularModule,
  Plus,
  Pencil,
  Trash2,
  Calendar,
  Receipt,
  Wallet,
} from 'lucide-angular';
import { FinancesService } from './services/finances.service';
import { ScheduledBill } from './models/finances.model';
import { BillModalComponent } from './components/bill-modal.component';
import { finalize } from 'rxjs/operators';

/**
 * Bills Component
 *
 * Tela de gerenciamento de contas mensais (água, luz, internet, etc.)
 * Permite CRUD completo de agendamentos/contas fixas.
 */
@Component({
  selector: 'app-bills',
  standalone: true,
  imports: [
    CommonModule,
    LucideAngularModule,
    BillModalComponent,
  ],
  templateUrl: './bills.component.html',
})
export class BillsComponent implements OnInit {
  @ViewChild('billModal') billModal!: BillModalComponent;

  // Ícones
  PlusIcon = Plus;
  PencilIcon = Pencil;
  Trash2Icon = Trash2;
  CalendarIcon = Calendar;
  ReceiptIcon = Receipt;
  WalletIcon = Wallet;

  // Signals de estado
  loading = signal(true);
  error = signal<string | null>(null);
  bills = signal<ScheduledBill[]>([]);
  selectedBill = signal<ScheduledBill | null>(null);
  showDeleteDialog = signal(false);
  deleting = signal(false);

  // Math para template
  Math = Math;

  // Computed: total mensal estimado (apenas FIXO + MENSAL)
  totalMensalEstimado = computed(() => {
    return this.bills()
      .filter(b => b.tipo_agendamento === 'FIXO' && b.periodicidade === 'MENSAL' && b.valor_previsto)
      .reduce((sum, b) => sum + (b.valor_previsto || 0), 0);
  });

  // Labels legíveis para periodicidade
  private periodicidadeLabels: Record<string, string> = {
    DIARIA: 'Diária',
    SEMANAL: 'Semanal',
    QUINZENAL: 'Quinzenal',
    MENSAL: 'Mensal',
    ANUAL: 'Anual',
  };

  constructor(private financesService: FinancesService) {}

  ngOnInit(): void {
    this.loadBills();
  }

  /**
   * Carrega contas mensais do backend
   */
  loadBills(): void {
    this.loading.set(true);
    this.error.set(null);

    this.financesService.getBills().pipe(
      finalize(() => this.loading.set(false))
    ).subscribe({
      next: (bills) => this.bills.set(bills),
      error: (err) => {
        console.error('Erro ao carregar contas mensais:', err);
        this.error.set('Erro ao carregar contas mensais. Tente novamente.');
      }
    });
  }

  /**
   * Abre modal para criar nova conta mensal
   */
  openCreateModal(): void {
    this.selectedBill.set(null);
    this.billModal.open();
  }

  /**
   * Abre modal para editar conta mensal
   */
  openEditModal(bill: ScheduledBill): void {
    this.selectedBill.set(bill);
    this.billModal.open(bill);
  }

  /**
   * Exibe diálogo de confirmação de exclusão
   */
  confirmDelete(bill: ScheduledBill): void {
    this.selectedBill.set(bill);
    this.showDeleteDialog.set(true);
  }

  /**
   * Cancela exclusão
   */
  cancelDelete(): void {
    this.showDeleteDialog.set(false);
    this.selectedBill.set(null);
  }

  /**
   * Executa exclusão (soft delete)
   */
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
        this.loadBills();
      },
      error: (err) => {
        this.error.set(err.message || 'Erro ao remover conta mensal');
        this.showDeleteDialog.set(false);
      }
    });
  }

  /**
   * Callback quando conta é salva no modal
   */
  onBillSaved(bill: ScheduledBill): void {
    this.loadBills();
  }

  /**
   * Formatar valor monetário
   */
  formatCurrency(value: number | undefined | null): string {
    if (value === null || value === undefined) return '—';
    return value.toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    });
  }

  /**
   * Retorna label legível da periodicidade
   */
  getPeriodicidadeLabel(periodicidade: string): string {
    return this.periodicidadeLabels[periodicidade] || periodicidade;
  }

  /**
   * Retorna classe CSS da badge de periodicidade
   */
  getPeriodicidadeBadgeClass(periodicidade: string): string {
    const classes: Record<string, string> = {
      DIARIA: 'bg-orange-100 text-orange-700',
      SEMANAL: 'bg-yellow-100 text-yellow-700',
      QUINZENAL: 'bg-blue-100 text-blue-700',
      MENSAL: 'bg-green-100 text-green-700',
      ANUAL: 'bg-purple-100 text-purple-700',
    };
    return classes[periodicidade] || 'bg-gray-100 text-gray-700';
  }

  /**
   * Retorna label legível do mês
   */
  getMesLabel(mes: number | undefined | null): string {
    if (!mes) return '';
    const meses = ['', 'Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun',
                    'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
    return meses[mes] || '';
  }
}
