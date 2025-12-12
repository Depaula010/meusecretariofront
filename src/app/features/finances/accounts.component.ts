import { Component, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  LucideAngularModule,
  CreditCard,
  Plus,
  TrendingUp,
  DollarSign,
  Wallet,
} from 'lucide-angular';
import { FinancesService } from './services/finances.service';
import { BankAccount } from './models/finances.model';

/**
 * Accounts Component
 *
 * Lista de contas bancárias do usuário com:
 * - Cards com informações de cada conta
 * - Ícone e cor personalizados
 * - Distinção visual entre tipos (corrente, poupança, cartão)
 * - Total consolidado
 */
@Component({
  selector: 'app-accounts',
  standalone: true,
  imports: [CommonModule, LucideAngularModule],
  templateUrl: './accounts.component.html',
  styleUrls: ['./accounts.component.scss']
})
export class AccountsComponent implements OnInit {
  // Ícones
  CreditCardIcon = CreditCard;
  PlusIcon = Plus;
  TrendingUpIcon = TrendingUp;
  DollarSignIcon = DollarSign;
  WalletIcon = Wallet;

  // Math para usar no template
  Math = Math;

  // Signals de Estado
  loading = signal(true);
  error = signal<string | null>(null);
  accounts = signal<BankAccount[]>([]);

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
   * Obter cor de fundo do card baseado na cor da conta
   */
  getCardGradient(cor?: string): string {
    if (!cor) return 'from-blue-500 to-blue-600';

    // Converter hex para gradient
    return `from-[${cor}] to-[${cor}dd]`;
  }
}
