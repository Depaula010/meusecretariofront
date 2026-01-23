import { Component, EventEmitter, Input, Output, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { LucideAngularModule, X, Loader2, TrendingUp, TrendingDown } from 'lucide-angular';
import { FinancesService } from '../services/finances.service';
import { Transaction, TransactionRequest, BankAccount, Category, SubCategory } from '../models/finances.model';
import { finalize } from 'rxjs/operators';

/**
 * Transaction Modal Component
 *
 * Modal para criar e editar transacoes (receitas e despesas).
 * Busca categorias e contas do backend.
 */
@Component({
  selector: 'app-transaction-modal',
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
                {{ editMode() ? 'Editar Transacao' : 'Nova Transacao' }}
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
              <!-- Tipo (Receita/Despesa) -->
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Tipo</label>
                <div class="flex gap-2">
                  <button
                    type="button"
                    (click)="setTipo('Receita')"
                    class="flex-1 py-3 px-4 rounded-lg font-medium transition-all flex items-center justify-center gap-2"
                    [class.bg-green-500]="form.get('tipo')?.value === 'Receita'"
                    [class.text-white]="form.get('tipo')?.value === 'Receita'"
                    [class.shadow-lg]="form.get('tipo')?.value === 'Receita'"
                    [class.bg-gray-100]="form.get('tipo')?.value !== 'Receita'"
                    [class.text-gray-700]="form.get('tipo')?.value !== 'Receita'"
                  >
                    <lucide-icon [img]="TrendingUpIcon" [size]="18"></lucide-icon>
                    <span>Receita</span>
                  </button>
                  <button
                    type="button"
                    (click)="setTipo('Despesa')"
                    class="flex-1 py-3 px-4 rounded-lg font-medium transition-all flex items-center justify-center gap-2"
                    [class.bg-red-500]="form.get('tipo')?.value === 'Despesa'"
                    [class.text-white]="form.get('tipo')?.value === 'Despesa'"
                    [class.shadow-lg]="form.get('tipo')?.value === 'Despesa'"
                    [class.bg-gray-100]="form.get('tipo')?.value !== 'Despesa'"
                    [class.text-gray-700]="form.get('tipo')?.value !== 'Despesa'"
                  >
                    <lucide-icon [img]="TrendingDownIcon" [size]="18"></lucide-icon>
                    <span>Despesa</span>
                  </button>
                </div>
              </div>

              <!-- Descricao -->
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Descricao</label>
                <input
                  type="text"
                  formControlName="descricao"
                  placeholder="Ex: Salario, Mercado, Aluguel..."
                  class="input-base"
                  [class.border-red-300]="isFieldInvalid('descricao')"
                />
                @if (isFieldInvalid('descricao')) {
                  <p class="mt-1 text-xs text-red-600">Descricao e obrigatoria</p>
                }
              </div>

              <!-- Valor -->
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Valor</label>
                <div class="relative">
                  <span class="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 font-medium">R$</span>
                  <input
                    type="number"
                    formControlName="valor"
                    placeholder="0,00"
                    step="0.01"
                    min="0.01"
                    class="input-base pl-12"
                    [class.border-red-300]="isFieldInvalid('valor')"
                  />
                </div>
                @if (isFieldInvalid('valor')) {
                  <p class="mt-1 text-xs text-red-600">Valor deve ser maior que zero</p>
                }
              </div>

              <!-- Data -->
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Data</label>
                <input
                  type="date"
                  formControlName="data"
                  class="input-base"
                  [class.border-red-300]="isFieldInvalid('data')"
                />
                @if (isFieldInvalid('data')) {
                  <p class="mt-1 text-xs text-red-600">Data e obrigatoria</p>
                }
              </div>

              <!-- Categoria (Macro) -->
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Categoria</label>
                @if (loadingCategories()) {
                  <div class="input-base bg-gray-50 text-gray-500">Carregando categorias...</div>
                } @else {
                  <select
                    formControlName="macro_categoria"
                    (change)="onCategoriaChange()"
                    class="input-base"
                    [class.border-red-300]="isFieldInvalid('macro_categoria')"
                  >
                    <option value="">Selecione uma categoria...</option>
                    @for (cat of categories(); track cat.macro_id) {
                      <option [value]="cat.macro_id">{{ cat.macro_categoria }}</option>
                    }
                  </select>
                  @if (isFieldInvalid('macro_categoria')) {
                    <p class="mt-1 text-xs text-red-600">Categoria e obrigatoria</p>
                  }
                }
              </div>

              <!-- Subcategoria -->
              @if (subcategories().length > 0) {
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">Subcategoria</label>
                  <select
                    formControlName="subcategoria_id"
                    class="input-base"
                    [class.border-red-300]="isFieldInvalid('subcategoria_id')"
                  >
                    <option [ngValue]="null">Selecione uma subcategoria...</option>
                    @for (sub of subcategories(); track sub.id) {
                      <option [ngValue]="sub.id">{{ sub.nome }}</option>
                    }
                  </select>
                  @if (isFieldInvalid('subcategoria_id')) {
                    <p class="mt-1 text-xs text-red-600">Subcategoria e obrigatoria</p>
                  }
                </div>
              }

              <!-- Conta Bancaria -->
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Conta</label>
                @if (loadingAccounts()) {
                  <div class="input-base bg-gray-50 text-gray-500">Carregando contas...</div>
                } @else if (accounts().length === 0) {
                  <div class="input-base bg-yellow-50 text-yellow-700">Nenhuma conta cadastrada</div>
                } @else {
                  <select
                    formControlName="conta_id"
                    class="input-base"
                    [class.border-red-300]="isFieldInvalid('conta_id')"
                  >
                    <option [ngValue]="null">Selecione uma conta...</option>
                    @for (account of accounts(); track account.id) {
                      <option [ngValue]="account.id">{{ account.nome }} ({{ account.banco }})</option>
                    }
                  </select>
                  @if (isFieldInvalid('conta_id')) {
                    <p class="mt-1 text-xs text-red-600">Conta e obrigatoria</p>
                  }
                }
              </div>

              <!-- Observacoes (opcional) -->
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">
                  Observacoes <span class="text-gray-400 font-normal">(opcional)</span>
                </label>
                <textarea
                  formControlName="observacoes"
                  rows="2"
                  placeholder="Notas adicionais..."
                  class="input-base resize-none"
                ></textarea>
              </div>

              <!-- Buttons -->
              <div class="flex gap-3 pt-4">
                <button
                  type="button"
                  (click)="close()"
                  class="flex-1 px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors font-medium text-gray-700"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  [disabled]="loading()"
                  class="flex-1 btn-primary py-3 flex items-center justify-center gap-2"
                >
                  @if (loading()) {
                    <lucide-icon [img]="LoaderIcon" [size]="18" class="animate-spin"></lucide-icon>
                    <span>Salvando...</span>
                  } @else {
                    <span>{{ editMode() ? 'Atualizar' : 'Salvar' }}</span>
                  }
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    }
  `
})
export class TransactionModalComponent implements OnInit {
  @Input() set transaction(value: Transaction | null) {
    if (value) {
      this.editMode.set(true);
      this.transactionId = value.id;
      // Preencher formulario com dados existentes
      this.form.patchValue({
        descricao: value.descricao,
        valor: value.valor,
        tipo: value.tipo === 'receita' ? 'Receita' : 'Despesa',
        data: value.data,
        observacoes: value.observacoes || ''
      });
      // Carregar categorias do tipo correto
      const tipo = value.tipo === 'receita' ? 'Receita' : 'Despesa';
      this.loadCategories(tipo);
    } else {
      this.editMode.set(false);
      this.transactionId = null;
    }
  }

  @Output() saved = new EventEmitter<Transaction>();
  @Output() closed = new EventEmitter<void>();

  // Icons
  XIcon = X;
  LoaderIcon = Loader2;
  TrendingUpIcon = TrendingUp;
  TrendingDownIcon = TrendingDown;

  // Signals
  isOpen = signal(false);
  loading = signal(false);
  error = signal<string | null>(null);
  editMode = signal(false);

  // Dados do backend
  accounts = signal<BankAccount[]>([]);
  categories = signal<Category[]>([]);
  subcategories = signal<SubCategory[]>([]);
  loadingAccounts = signal(false);
  loadingCategories = signal(false);

  // State
  private transactionId: number | null = null;

  // Form
  form: FormGroup;

  constructor(
    private fb: FormBuilder,
    private financesService: FinancesService
  ) {
    this.form = this.fb.group({
      descricao: ['', [Validators.required, Validators.minLength(2)]],
      valor: [null, [Validators.required, Validators.min(0.01)]],
      tipo: ['Despesa', Validators.required],
      data: [this.getTodayDate(), Validators.required],
      macro_categoria: ['', Validators.required],
      subcategoria_id: [null, Validators.required],
      conta_id: [null, Validators.required],
      observacoes: ['']
    });
  }

  ngOnInit(): void {
    this.loadAccounts();
    this.loadCategories('Despesa'); // Default
  }

  /**
   * Abre o modal
   */
  open(tipo?: 'receita' | 'despesa'): void {
    this.isOpen.set(true);
    if (tipo) {
      const tipoFormatted = tipo === 'receita' ? 'Receita' : 'Despesa';
      this.form.patchValue({ tipo: tipoFormatted });
      this.loadCategories(tipoFormatted);
    }
    document.body.style.overflow = 'hidden';
  }

  /**
   * Fecha o modal e reseta o formulario
   */
  close(): void {
    this.isOpen.set(false);
    this.error.set(null);
    this.resetForm();
    this.closed.emit();
    document.body.style.overflow = '';
  }

  /**
   * Define o tipo da transacao e recarrega categorias
   */
  setTipo(tipo: 'Receita' | 'Despesa'): void {
    this.form.patchValue({
      tipo,
      macro_categoria: '',
      subcategoria_id: null
    });
    this.subcategories.set([]);
    this.loadCategories(tipo);
  }

  /**
   * Quando categoria muda, atualiza subcategorias
   */
  onCategoriaChange(): void {
    const macroId = this.form.get('macro_categoria')?.value;
    if (macroId) {
      const categoria = this.categories().find(c => c.macro_id === +macroId);
      this.subcategories.set(categoria?.subcategorias || []);
      this.form.patchValue({ subcategoria_id: null });
    } else {
      this.subcategories.set([]);
    }
  }

  /**
   * Verifica se um campo e invalido
   */
  isFieldInvalid(fieldName: string): boolean {
    const field = this.form.get(fieldName);
    return !!(field && field.invalid && (field.dirty || field.touched));
  }

  /**
   * Submit do formulario
   */
  onSubmit(): void {
    if (this.form.invalid) {
      Object.keys(this.form.controls).forEach(key => {
        this.form.get(key)?.markAsTouched();
      });
      return;
    }

    this.loading.set(true);
    this.error.set(null);

    const formValue = this.form.value;
    const data: TransactionRequest = {
      descricao: formValue.descricao,
      valor: formValue.valor,
      tipo: formValue.tipo,
      data: formValue.data,
      subcategoria_id: formValue.subcategoria_id,
      conta_id: formValue.conta_id,
      observacoes: formValue.observacoes || undefined,
      consolidada: true
    };

    const request$ = this.editMode() && this.transactionId
      ? this.financesService.updateTransaction(this.transactionId, data)
      : this.financesService.createTransaction(data);

    request$.pipe(
      finalize(() => this.loading.set(false))
    ).subscribe({
      next: (transaction) => {
        this.saved.emit(transaction);
        this.close();
      },
      error: (err) => {
        this.error.set(err.message || 'Erro ao salvar transacao');
      }
    });
  }

  /**
   * Carrega as contas bancarias do usuario
   */
  private loadAccounts(): void {
    this.loadingAccounts.set(true);
    this.financesService.getAccounts().pipe(
      finalize(() => this.loadingAccounts.set(false))
    ).subscribe({
      next: (accounts) => this.accounts.set(accounts),
      error: () => this.accounts.set([])
    });
  }

  /**
   * Carrega as categorias do backend
   */
  private loadCategories(tipo: 'Receita' | 'Despesa'): void {
    this.loadingCategories.set(true);
    this.subcategories.set([]);

    this.financesService.getCategories(tipo).pipe(
      finalize(() => this.loadingCategories.set(false))
    ).subscribe({
      next: (categories) => this.categories.set(categories),
      error: () => this.categories.set([])
    });
  }

  /**
   * Reseta o formulario para o estado inicial
   */
  private resetForm(): void {
    this.form.reset({
      tipo: 'Despesa',
      data: this.getTodayDate()
    });
    this.editMode.set(false);
    this.transactionId = null;
    this.subcategories.set([]);
    this.loadCategories('Despesa');
  }

  /**
   * Retorna a data de hoje no formato YYYY-MM-DD
   */
  private getTodayDate(): string {
    return new Date().toISOString().split('T')[0];
  }
}
