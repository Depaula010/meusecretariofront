import { Component, EventEmitter, Input, Output, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { LucideAngularModule, X, Loader2 } from 'lucide-angular';
import { FinancesService } from '../services/finances.service';
import { ScheduledBill, ScheduledBillRequest, BankAccount, Category, SubCategory } from '../models/finances.model';
import { finalize } from 'rxjs/operators';

/**
 * Bill Modal Component
 *
 * Modal para criar e editar contas mensais (água, luz, internet, etc.).
 * Busca categorias (somente Despesa) e contas bancárias do backend.
 */
@Component({
  selector: 'app-bill-modal',
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
          <div class="relative bg-white rounded-xl shadow-xl max-w-lg w-full p-6 z-10 max-h-[90vh] overflow-y-auto">
            <!-- Header -->
            <div class="flex items-center justify-between mb-6">
              <h2 class="text-xl font-bold text-gray-900">
                {{ editMode() ? 'Editar Conta Mensal' : 'Nova Conta Mensal' }}
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

              <!-- Tipo de Agendamento -->
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Tipo</label>
                <div class="flex gap-2">
                  <button
                    type="button"
                    (click)="setTipo('FIXO')"
                    class="flex-1 py-2 px-4 rounded-lg font-medium transition-all text-sm"
                    [class.bg-primary]="form.get('tipo_agendamento')?.value === 'FIXO'"
                    [class.text-white]="form.get('tipo_agendamento')?.value === 'FIXO'"
                    [class.shadow-md]="form.get('tipo_agendamento')?.value === 'FIXO'"
                    [class.bg-gray-100]="form.get('tipo_agendamento')?.value !== 'FIXO'"
                    [class.text-gray-700]="form.get('tipo_agendamento')?.value !== 'FIXO'"
                  >
                    Fixo (valor certo)
                  </button>
                  <button
                    type="button"
                    (click)="setTipo('LEMBRETE_VARIAVEL')"
                    class="flex-1 py-2 px-4 rounded-lg font-medium transition-all text-sm"
                    [class.bg-primary]="form.get('tipo_agendamento')?.value === 'LEMBRETE_VARIAVEL'"
                    [class.text-white]="form.get('tipo_agendamento')?.value === 'LEMBRETE_VARIAVEL'"
                    [class.shadow-md]="form.get('tipo_agendamento')?.value === 'LEMBRETE_VARIAVEL'"
                    [class.bg-gray-100]="form.get('tipo_agendamento')?.value !== 'LEMBRETE_VARIAVEL'"
                    [class.text-gray-700]="form.get('tipo_agendamento')?.value !== 'LEMBRETE_VARIAVEL'"
                  >
                    Variável (sem valor fixo)
                  </button>
                </div>
              </div>

              <!-- Descrição -->
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Descrição</label>
                <input
                  type="text"
                  formControlName="descricao"
                  placeholder="Ex: Conta de Água, Luz, Internet..."
                  class="input-base"
                  [class.border-red-300]="isFieldInvalid('descricao')"
                />
                @if (isFieldInvalid('descricao')) {
                  <p class="mt-1 text-xs text-red-600">Descrição é obrigatória</p>
                }
              </div>

              <!-- Valor Previsto (só para FIXO) -->
              @if (form.get('tipo_agendamento')?.value === 'FIXO') {
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">Valor Previsto</label>
                  <div class="relative">
                    <span class="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 font-medium">R$</span>
                    <input
                      type="number"
                      formControlName="valor_previsto"
                      placeholder="0,00"
                      step="0.01"
                      min="0.01"
                      class="input-base pl-12"
                      [class.border-red-300]="isFieldInvalid('valor_previsto')"
                    />
                  </div>
                  @if (isFieldInvalid('valor_previsto')) {
                    <p class="mt-1 text-xs text-red-600">Valor previsto é obrigatório e deve ser positivo</p>
                  }
                </div>
              }

              <!-- Periodicidade -->
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Periodicidade</label>
                <select
                  formControlName="periodicidade"
                  class="input-base"
                  [class.border-red-300]="isFieldInvalid('periodicidade')"
                  (change)="onPeriodicidadeChange()"
                >
                  <option value="MENSAL">Mensal</option>
                  <option value="ANUAL">Anual</option>
                  <option value="SEMANAL">Semanal</option>
                  <option value="QUINZENAL">Quinzenal</option>
                  <option value="DIARIA">Diária</option>
                </select>
              </div>

              <!-- Dia de Execução + Mês (lado a lado) -->
              <div class="grid grid-cols-2 gap-4">
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">
                    Dia de Vencimento
                  </label>
                  <input
                    type="number"
                    formControlName="dia_execucao"
                    placeholder="1-31"
                    min="1"
                    max="31"
                    class="input-base"
                    [class.border-red-300]="isFieldInvalid('dia_execucao')"
                  />
                  @if (isFieldInvalid('dia_execucao')) {
                    <p class="mt-1 text-xs text-red-600">Dia deve ser entre 1 e 31</p>
                  }
                </div>

                @if (form.get('periodicidade')?.value === 'ANUAL') {
                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">Mês</label>
                    <select formControlName="mes_execucao" class="input-base">
                      <option [ngValue]="null">Selecione...</option>
                      <option [ngValue]="1">Janeiro</option>
                      <option [ngValue]="2">Fevereiro</option>
                      <option [ngValue]="3">Março</option>
                      <option [ngValue]="4">Abril</option>
                      <option [ngValue]="5">Maio</option>
                      <option [ngValue]="6">Junho</option>
                      <option [ngValue]="7">Julho</option>
                      <option [ngValue]="8">Agosto</option>
                      <option [ngValue]="9">Setembro</option>
                      <option [ngValue]="10">Outubro</option>
                      <option [ngValue]="11">Novembro</option>
                      <option [ngValue]="12">Dezembro</option>
                    </select>
                  </div>
                }
              </div>

              <!-- Data de Início -->
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Data de Início</label>
                <input
                  type="date"
                  formControlName="data_inicio"
                  class="input-base"
                  [class.border-red-300]="isFieldInvalid('data_inicio')"
                />
                @if (isFieldInvalid('data_inicio')) {
                  <p class="mt-1 text-xs text-red-600">Data de início é obrigatória</p>
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
                    <p class="mt-1 text-xs text-red-600">Categoria é obrigatória</p>
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
                    <p class="mt-1 text-xs text-red-600">Subcategoria é obrigatória</p>
                  }
                }
              }

              <!-- Conta Bancária -->
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Conta para Débito</label>
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
                    <p class="mt-1 text-xs text-red-600">Conta é obrigatória</p>
                  }
                }
              </div>

              <!-- Notificar X dias antes -->
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">
                  Notificar <span class="text-gray-400 font-normal">(dias antes do vencimento)</span>
                </label>
                <input
                  type="number"
                  formControlName="notificar_antes_dias"
                  min="0"
                  max="30"
                  class="input-base"
                />
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
export class BillModalComponent implements OnInit {
  @Output() saved = new EventEmitter<ScheduledBill>();
  @Output() closed = new EventEmitter<void>();

  // Icons
  XIcon = X;
  LoaderIcon = Loader2;

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
  private billId: number | null = null;

  // Form
  form: FormGroup;

  constructor(
    private fb: FormBuilder,
    private financesService: FinancesService
  ) {
    this.form = this.fb.group({
      tipo_agendamento: ['FIXO', Validators.required],
      descricao: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(255)]],
      valor_previsto: [null],
      periodicidade: ['MENSAL', Validators.required],
      dia_execucao: [null, [Validators.required, Validators.min(1), Validators.max(31)]],
      mes_execucao: [null],
      data_inicio: [this.getTodayDate(), Validators.required],
      macro_categoria: ['', Validators.required],
      subcategoria_id: [null, Validators.required],
      conta_id: [null, Validators.required],
      notificar_antes_dias: [3],
    });
  }

  ngOnInit(): void {
    this.loadAccounts();
    this.loadCategories();
  }

  /**
   * Abre o modal para criar nova conta ou editar existente
   */
  open(bill?: ScheduledBill): void {
    this.isOpen.set(true);
    this.error.set(null);
    document.body.style.overflow = 'hidden';

    if (bill) {
      this.editMode.set(true);
      this.billId = bill.id;
      this.form.patchValue({
        tipo_agendamento: bill.tipo_agendamento,
        descricao: bill.descricao,
        valor_previsto: bill.valor_previsto ?? null,
        periodicidade: bill.periodicidade,
        dia_execucao: bill.dia_execucao,
        mes_execucao: bill.mes_execucao ?? null,
        data_inicio: bill.data_inicio,
        subcategoria_id: bill.subcategoria_id,
        conta_id: bill.conta_id,
        notificar_antes_dias: bill.notificar_antes_dias,
      });
      // Carregar subcategorias da categoria da conta em edição
      this.loadCategories(bill.subcategoria_id);
    } else {
      this.editMode.set(false);
      this.billId = null;
    }
  }

  /**
   * Fecha o modal e reseta o formulário
   */
  close(): void {
    this.isOpen.set(false);
    this.error.set(null);
    this.resetForm();
    this.closed.emit();
    document.body.style.overflow = '';
  }

  /**
   * Altera tipo de agendamento e ajusta validações de valor
   */
  setTipo(tipo: 'FIXO' | 'LEMBRETE_VARIAVEL'): void {
    this.form.patchValue({ tipo_agendamento: tipo });
    if (tipo === 'LEMBRETE_VARIAVEL') {
      this.form.get('valor_previsto')?.clearValidators();
      this.form.get('valor_previsto')?.setValue(null);
    } else {
      this.form.get('valor_previsto')?.setValidators([Validators.required, Validators.min(0.01)]);
    }
    this.form.get('valor_previsto')?.updateValueAndValidity();
  }

  /**
   * Limpa mês de execução quando periodicidade não é ANUAL
   */
  onPeriodicidadeChange(): void {
    if (this.form.get('periodicidade')?.value !== 'ANUAL') {
      this.form.patchValue({ mes_execucao: null });
    }
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
   * Verifica se campo é inválido (tocado ou dirty)
   */
  isFieldInvalid(fieldName: string): boolean {
    const field = this.form.get(fieldName);
    return !!(field && field.invalid && (field.dirty || field.touched));
  }

  /**
   * Submit do formulário
   */
  onSubmit(): void {
    // Marcar todos os campos como tocados para exibir erros
    Object.keys(this.form.controls).forEach(key => {
      this.form.get(key)?.markAsTouched();
    });

    if (this.form.invalid) {
      return;
    }

    this.loading.set(true);
    this.error.set(null);

    const formValue = this.form.value;
    const billRequest: ScheduledBillRequest = {
      descricao: formValue.descricao,
      tipo_agendamento: formValue.tipo_agendamento,
      periodicidade: formValue.periodicidade,
      dia_execucao: formValue.dia_execucao,
      data_inicio: formValue.data_inicio,
      subcategoria_id: formValue.subcategoria_id,
      conta_id: formValue.conta_id,
      notificar_antes_dias: formValue.notificar_antes_dias || 3,
    };

    if (formValue.valor_previsto !== null && formValue.valor_previsto !== undefined) {
      billRequest.valor_previsto = formValue.valor_previsto;
    }
    if (formValue.periodicidade === 'ANUAL' && formValue.mes_execucao) {
      billRequest.mes_execucao = formValue.mes_execucao;
    }

    const request$ = this.editMode() && this.billId
      ? this.financesService.updateBill(this.billId, billRequest)
      : this.financesService.createBill(billRequest);

    request$.pipe(
      finalize(() => this.loading.set(false))
    ).subscribe({
      next: (bill) => {
        this.saved.emit(bill);
        this.close();
      },
      error: (err) => {
        this.error.set(err.message || 'Erro ao salvar conta mensal');
      }
    });
  }

  /**
   * Carrega as contas bancárias do usuário
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
   * Carrega categorias de despesa e (opcionalmente) pré-seleciona subcategoria em edição
   */
  private loadCategories(subcategoriaIdToSelect?: number): void {
    this.loadingCategories.set(true);
    this.financesService.getCategories('Despesa').pipe(
      finalize(() => this.loadingCategories.set(false))
    ).subscribe({
      next: (categories) => {
        this.categories.set(categories);
        // Em modo de edição, restaurar a categoria/subcategoria selecionada
        if (subcategoriaIdToSelect) {
          for (const cat of categories) {
            const sub = cat.subcategorias.find(s => s.id === subcategoriaIdToSelect);
            if (sub) {
              this.form.patchValue({ macro_categoria: cat.macro_id });
              this.subcategories.set(cat.subcategorias);
              break;
            }
          }
        }
      },
      error: () => this.categories.set([])
    });
  }

  /**
   * Reseta o formulário para o estado inicial
   */
  private resetForm(): void {
    this.form.reset({
      tipo_agendamento: 'FIXO',
      periodicidade: 'MENSAL',
      dia_execucao: null,
      notificar_antes_dias: 3,
      data_inicio: this.getTodayDate(),
    });
    this.editMode.set(false);
    this.billId = null;
    this.subcategories.set([]);
  }

  /**
   * Retorna a data de hoje no formato YYYY-MM-DD
   */
  private getTodayDate(): string {
    return new Date().toISOString().split('T')[0];
  }
}
