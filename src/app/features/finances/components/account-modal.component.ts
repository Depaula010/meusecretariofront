import { Component, EventEmitter, Input, Output, signal, OnInit, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { LucideAngularModule, X, Loader2, Wallet, CreditCard, PiggyBank, TrendingUp, Banknote } from 'lucide-angular';
import { FinancesService } from '../services/finances.service';
import { BankAccount, BankAccountRequest } from '../models/finances.model';
import { finalize } from 'rxjs/operators';

/**
 * Account Modal Component
 *
 * Modal para criar e editar contas bancarias.
 */
@Component({
  selector: 'app-account-modal',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, LucideAngularModule],
  template: `
    @if (isOpen()) {
      <div class="fixed inset-0 z-50 overflow-y-auto">
        <div class="flex min-h-full items-center justify-center p-4">
          <!-- Backdrop -->
          <div
            class="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
            (click)="close()"
          ></div>

          <!-- Modal -->
          <div class="relative bg-white rounded-xl shadow-xl max-w-md w-full p-6 z-10 max-h-[90vh] overflow-y-auto">
            <!-- Header -->
            <div class="flex items-center justify-between mb-6">
              <h2 class="text-xl font-bold text-gray-900">
                {{ editMode() ? 'Editar Conta' : 'Nova Conta' }}
              </h2>
              <button
                (click)="close()"
                class="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <lucide-icon [img]="XIcon" [size]="20" class="text-gray-500"></lucide-icon>
              </button>
            </div>

            <!-- Error Message -->
            @if (error()) {
              <div class="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                <p class="text-sm text-red-700">{{ error() }}</p>
              </div>
            }

            <!-- Form -->
            <form [formGroup]="form" (ngSubmit)="onSubmit()" class="space-y-4">
              <!-- Nome da Conta -->
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Nome da Conta</label>
                <input
                  type="text"
                  formControlName="nome_conta"
                  placeholder="Ex: Nubank, Itau, Bradesco..."
                  class="input-base"
                  [class.border-red-300]="isFieldInvalid('nome_conta')"
                />
                @if (isFieldInvalid('nome_conta')) {
                  <p class="mt-1 text-xs text-red-600">Nome da conta e obrigatorio</p>
                }
              </div>

              <!-- Tipo de Conta -->
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Tipo de Conta</label>
                <div class="grid grid-cols-2 gap-2">
                  @for (tipo of tiposConta; track tipo.value) {
                    <button
                      type="button"
                      (click)="setTipoConta(tipo.value)"
                      class="py-3 px-4 rounded-lg font-medium transition-all flex items-center justify-center gap-2"
                      [class.bg-blue-500]="form.get('tipo_conta')?.value === tipo.value"
                      [class.text-white]="form.get('tipo_conta')?.value === tipo.value"
                      [class.shadow-lg]="form.get('tipo_conta')?.value === tipo.value"
                      [class.bg-gray-100]="form.get('tipo_conta')?.value !== tipo.value"
                      [class.text-gray-700]="form.get('tipo_conta')?.value !== tipo.value"
                    >
                      <lucide-icon [img]="tipo.icon" [size]="18"></lucide-icon>
                      <span class="text-sm">{{ tipo.label }}</span>
                    </button>
                  }
                </div>
              </div>

              <!-- Banco -->
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Banco (opcional)</label>
                <input
                  type="text"
                  formControlName="banco"
                  placeholder="Ex: Nubank, Itau, Bradesco..."
                  class="input-base"
                />
              </div>

              <!-- Saldo Inicial -->
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Saldo Inicial</label>
                <div class="relative">
                  <span class="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 font-medium">R$</span>
                  <input
                    type="number"
                    formControlName="saldo_inicial"
                    placeholder="0,00"
                    step="0.01"
                    class="input-base pl-12"
                    [class.border-red-300]="isFieldInvalid('saldo_inicial')"
                  />
                </div>
                @if (isFieldInvalid('saldo_inicial')) {
                  <p class="mt-1 text-xs text-red-600">Saldo inicial e obrigatorio</p>
                }
              </div>

              <!-- Cor -->
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Cor</label>
                <div class="flex gap-2 flex-wrap">
                  @for (cor of cores; track cor) {
                    <button
                      type="button"
                      (click)="setCor(cor)"
                      class="w-8 h-8 rounded-full border-2 transition-all"
                      [style.background-color]="cor"
                      [class.border-gray-900]="form.get('cor_hex')?.value === cor"
                      [class.border-transparent]="form.get('cor_hex')?.value !== cor"
                      [class.ring-2]="form.get('cor_hex')?.value === cor"
                      [class.ring-offset-2]="form.get('cor_hex')?.value === cor"
                      [class.ring-blue-500]="form.get('cor_hex')?.value === cor"
                    ></button>
                  }
                </div>
              </div>

              <!-- Campos de Cartao de Credito -->
              @if (form.get('tipo_conta')?.value === 'Cartão de Crédito') {
                <div class="p-4 bg-gray-50 rounded-lg space-y-4">
                  <h3 class="text-sm font-medium text-gray-700">Dados do Cartao</h3>

                  <!-- Limite -->
                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">Limite</label>
                    <div class="relative">
                      <span class="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 font-medium">R$</span>
                      <input
                        type="number"
                        formControlName="limite_credito"
                        placeholder="0,00"
                        step="0.01"
                        class="input-base pl-12"
                      />
                    </div>
                  </div>

                  <!-- Dia de Fechamento -->
                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">Dia de Fechamento</label>
                    <input
                      type="number"
                      formControlName="dia_fechamento"
                      placeholder="1-31"
                      min="1"
                      max="31"
                      class="input-base"
                    />
                  </div>

                  <!-- Dia de Vencimento -->
                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">Dia de Vencimento</label>
                    <input
                      type="number"
                      formControlName="dia_vencimento"
                      placeholder="1-31"
                      min="1"
                      max="31"
                      class="input-base"
                    />
                  </div>
                </div>
              }

              <!-- Buttons -->
              <div class="flex gap-3 pt-4">
                <button
                  type="button"
                  (click)="close()"
                  class="flex-1 py-3 px-4 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  [disabled]="saving() || form.invalid"
                  class="flex-1 py-3 px-4 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  @if (saving()) {
                    <lucide-icon [img]="LoaderIcon" [size]="18" class="animate-spin"></lucide-icon>
                    <span>Salvando...</span>
                  } @else {
                    <span>{{ editMode() ? 'Atualizar' : 'Criar Conta' }}</span>
                  }
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    }
  `,
  styles: [`
    .input-base {
      @apply w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all;
    }
  `]
})
export class AccountModalComponent implements OnInit, OnChanges {
  @Input() account: BankAccount | null = null;
  @Output() saved = new EventEmitter<BankAccount>();
  @Output() closed = new EventEmitter<void>();

  // Icons
  XIcon = X;
  LoaderIcon = Loader2;
  WalletIcon = Wallet;
  CreditCardIcon = CreditCard;
  PiggyBankIcon = PiggyBank;
  TrendingUpIcon = TrendingUp;
  BanknoteIcon = Banknote;

  // Signals
  isOpen = signal(false);
  editMode = signal(false);
  saving = signal(false);
  error = signal<string | null>(null);

  // Tipos de conta
  tiposConta = [
    { value: 'Conta Corrente', label: 'Corrente', icon: Wallet },
    { value: 'Conta Poupança', label: 'Poupanca', icon: PiggyBank },
    { value: 'Cartão de Crédito', label: 'Cartao', icon: CreditCard },
    { value: 'Investimento', label: 'Investimento', icon: TrendingUp },
    { value: 'Dinheiro', label: 'Dinheiro', icon: Banknote },
    { value: 'Outro', label: 'Outro', icon: Wallet },
  ];

  // Cores disponiveis
  cores = [
    '#3B82F6', // Blue
    '#8B5CF6', // Purple
    '#EC4899', // Pink
    '#EF4444', // Red
    '#F97316', // Orange
    '#EAB308', // Yellow
    '#22C55E', // Green
    '#14B8A6', // Teal
    '#6B7280', // Gray
    '#000000', // Black
  ];

  form: FormGroup;

  constructor(
    private fb: FormBuilder,
    private financesService: FinancesService
  ) {
    this.form = this.fb.group({
      nome_conta: ['', [Validators.required, Validators.maxLength(100)]],
      tipo_conta: ['Conta Corrente', Validators.required],
      banco: [''],
      saldo_inicial: [0, Validators.required],
      cor_hex: ['#3B82F6'],
      icone: ['wallet'],
      limite_credito: [null],
      dia_fechamento: [null],
      dia_vencimento: [null],
    });
  }

  ngOnInit(): void {}

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['account'] && this.account) {
      this.loadAccount(this.account);
    }
  }

  open(account?: BankAccount): void {
    this.isOpen.set(true);
    this.error.set(null);

    if (account) {
      this.editMode.set(true);
      this.loadAccount(account);
    } else {
      this.editMode.set(false);
      this.form.reset({
        nome_conta: '',
        tipo_conta: 'Conta Corrente',
        banco: '',
        saldo_inicial: 0,
        cor_hex: '#3B82F6',
        icone: 'wallet',
        limite_credito: null,
        dia_fechamento: null,
        dia_vencimento: null,
      });
    }
  }

  close(): void {
    this.isOpen.set(false);
    this.closed.emit();
  }

  private loadAccount(account: BankAccount): void {
    // Mapear tipo do backend para o formato do form
    const tipoMap: { [key: string]: string } = {
      'corrente': 'Conta Corrente',
      'poupanca': 'Conta Poupança',
      'cartao_credito': 'Cartão de Crédito',
      'investimento': 'Investimento',
      'dinheiro': 'Dinheiro',
      'outro': 'Outro',
    };

    this.form.patchValue({
      nome_conta: account.nome,
      tipo_conta: tipoMap[account.tipo] || 'Conta Corrente',
      banco: account.banco || '',
      saldo_inicial: account.saldo || 0,
      cor_hex: account.cor || '#3B82F6',
      limite_credito: account.limite || null,
      dia_fechamento: account.dia_fechamento || null,
      dia_vencimento: account.dia_vencimento || null,
    });
  }

  setTipoConta(tipo: string): void {
    this.form.patchValue({ tipo_conta: tipo });
  }

  setCor(cor: string): void {
    this.form.patchValue({ cor_hex: cor });
  }

  isFieldInvalid(field: string): boolean {
    const control = this.form.get(field);
    return !!(control && control.invalid && (control.dirty || control.touched));
  }

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.saving.set(true);
    this.error.set(null);

    const formValue = this.form.value;

    // Mapear tipo do form para o formato do backend
    const tipoMap: { [key: string]: string } = {
      'Conta Corrente': 'corrente',
      'Conta Poupança': 'poupanca',
      'Cartão de Crédito': 'cartao_credito',
      'Investimento': 'investimento',
      'Dinheiro': 'dinheiro',
      'Outro': 'outro',
    };

    const request: BankAccountRequest = {
      nome: formValue.nome_conta,
      tipo: tipoMap[formValue.tipo_conta] as any,
      banco: formValue.banco || '',
      saldo: formValue.saldo_inicial || 0,
      cor: formValue.cor_hex,
      limite: formValue.limite_credito,
      dia_vencimento: formValue.dia_vencimento,
      dia_fechamento: formValue.dia_fechamento,
    };

    const request$ = this.editMode() && this.account
      ? this.financesService.updateAccount(this.account.id, request)
      : this.financesService.createAccount(request);

    request$
      .pipe(finalize(() => this.saving.set(false)))
      .subscribe({
        next: (account) => {
          this.saved.emit(account);
          this.close();
        },
        error: (err) => {
          console.error('Erro ao salvar conta:', err);
          this.error.set(err.error?.message || 'Erro ao salvar conta. Tente novamente.');
        },
      });
  }
}
