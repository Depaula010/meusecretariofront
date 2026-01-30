import { Component, OnInit, signal, computed, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  LucideAngularModule,
  CreditCard,
  Plus,
  TrendingUp,
  DollarSign,
  Wallet,
  Pencil,
  Trash2,
} from 'lucide-angular';
import { FinancesService } from './services/finances.service';
import { BankAccount } from './models/finances.model';
import { AccountModalComponent } from './components/account-modal.component';

/**
 * Accounts Component
 *
 * Lista de contas bancárias do usuário com:
 * - Cards com informações de cada conta
 * - Ícone e cor personalizados
 * - Distinção visual entre tipos (corrente, poupança, cartão)
 * - Total consolidado
 * - CRUD completo (criar, editar, deletar)
 */
@Component({
  selector: 'app-accounts',
  standalone: true,
  imports: [CommonModule, LucideAngularModule, AccountModalComponent],
  templateUrl: './accounts.component.html',
  styleUrls: ['./accounts.component.scss']
})
export class AccountsComponent implements OnInit {
  @ViewChild('accountModal') accountModal!: AccountModalComponent;

  // Ícones
  CreditCardIcon = CreditCard;
  PlusIcon = Plus;
  TrendingUpIcon = TrendingUp;
  DollarSignIcon = DollarSign;
  WalletIcon = Wallet;
  PencilIcon = Pencil;
  Trash2Icon = Trash2;

  // Math para usar no template
  Math = Math;

  // Signals de Estado
  loading = signal(true);
  error = signal<string | null>(null);
  accounts = signal<BankAccount[]>([]);
  selectedAccount = signal<BankAccount | null>(null);
  showDeleteDialog = signal(false);
  deleting = signal(false);

  // Computed: Saldo total
  totalBalance = computed(() => {
    return this.accounts().reduce((sum, acc) => sum + acc.saldo, 0);
  });

  // Computed: Contas agrupadas por tipo
  accountsByType = computed(() => {
    const accounts = this.accounts();
    return {
      corrente: accounts.filter(a => a.tipo === 'corrente'),
      poupanca: accounts.filter(a => a.tipo === 'poupanca'),
      cartao_credito: accounts.filter(a => a.tipo === 'cartao_credito'),
      investimento: accounts.filter(a => a.tipo === 'investimento')
    };
  });

  constructor(private financesService: FinancesService) {}

  ngOnInit(): void {
    this.loadAccounts();
  }

  /**
   * Carregar contas do backend
   */
  loadAccounts(): void {
    this.loading.set(true);
    this.error.set(null);

    this.financesService.getAccounts().subscribe({
      next: (data) => {
        this.accounts.set(data);
        this.loading.set(false);
      },
      error: (err) => {
        console.error('Erro ao carregar contas:', err);
        this.error.set('Erro ao carregar contas bancárias. Tente novamente.');
        this.loading.set(false);
      }
    });
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
   * Obter ícone baseado no tipo de conta
   */
  getAccountIcon(tipo: string): any {
    switch (tipo) {
      case 'cartao_credito':
        return CreditCard;
      case 'investimento':
        return TrendingUp;
      case 'poupanca':
        return Wallet;
      default:
        return DollarSign;
    }
  }

  /**
   * Obter label do tipo de conta
   */
  getAccountTypeLabel(tipo: string): string {
    const labels: Record<string, string> = {
      'corrente': 'Conta Corrente',
      'poupanca': 'Poupança',
      'cartao_credito': 'Cartão de Crédito',
      'investimento': 'Investimento'
    };
    return labels[tipo] || tipo;
  }

  /**
   * Abrir modal para criar nova conta
   */
  openCreateModal(): void {
    this.selectedAccount.set(null);
    this.accountModal.open();
  }

  /**
   * Abrir modal para editar conta
   */
  openEditModal(account: BankAccount): void {
    this.selectedAccount.set(account);
    this.accountModal.open(account);
  }

  /**
   * Iniciar processo de exclusão de conta
   */
  confirmDelete(account: BankAccount): void {
    this.selectedAccount.set(account);
    this.showDeleteDialog.set(true);
  }

  /**
   * Cancelar exclusão
   */
  cancelDelete(): void {
    this.showDeleteDialog.set(false);
    this.selectedAccount.set(null);
  }

  /**
   * Executar exclusão da conta
   */
  deleteAccount(): void {
    const account = this.selectedAccount();
    if (!account) return;

    this.deleting.set(true);

    this.financesService.deleteAccount(account.id).subscribe({
      next: () => {
        this.showDeleteDialog.set(false);
        this.selectedAccount.set(null);
        this.deleting.set(false);
        this.loadAccounts();
      },
      error: (err) => {
        console.error('Erro ao deletar conta:', err);
        this.error.set(err.error?.message || 'Erro ao remover conta. Verifique se não há transações vinculadas.');
        this.showDeleteDialog.set(false);
        this.deleting.set(false);
      }
    });
  }

  /**
   * Callback após salvar conta (criar ou editar)
   */
  onAccountSaved(account: BankAccount): void {
    this.loadAccounts();
  }
}
