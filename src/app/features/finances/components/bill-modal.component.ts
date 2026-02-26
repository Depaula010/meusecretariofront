import { Component, EventEmitter, Input, Output, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { LucideAngularModule, X, Loader2, DollarSign, TrendingUp, Calendar, Bell, Tag, CreditCard, Zap, BarChart3, Info } from 'lucide-angular';
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
  styles: [`
    .tipo-btn {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 8px;
      padding: 16px 12px;
      border-radius: 12px;
      border: 2px solid transparent;
      transition: all 0.2s ease;
      cursor: pointer;
      font-size: 13px;
      font-weight: 500;
      line-height: 1.3;
      text-align: center;
    }
    .tipo-btn.active-fixo {
      background: #eff6ff;
      border-color: #3b82f6;
      color: #1d4ed8;
    }
    .tipo-btn.active-variavel {
      background: #faf5ff;
      border-color: #8b5cf6;
      color: #6d28d9;
    }
    .tipo-btn.inactive {
      background: #f9fafb;
      border-color: #e5e7eb;
      color: #6b7280;
    }
    .tipo-btn:hover.inactive {
      background: #f3f4f6;
      border-color: #d1d5db;
    }
    .section-divider {
      display: flex;
      align-items: center;
      gap: 8px;
      margin: 20px 0 16px;
    }
    .section-divider span {
      font-size: 11px;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      color: #9ca3af;
      white-space: nowrap;
    }
    .section-divider::before, .section-divider::after {
      content: '';
      flex: 1;
      height: 1px;
      background: #e5e7eb;
    }
    .valor-hint {
      font-size: 11px;
      color: #6b7280;
      margin-top: 4px;
      display: flex;
      align-items: center;
      gap: 4px;
    }
  `],
  template: `
    @if (isOpen()) {
      <div class="fixed inset-0 z-50 overflow-y-auto">
        <div class="flex min-h-full items-center justify-center p-4">
          <!-- Backdrop -->
          <div
            class="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm transition-opacity"
            (click)="close()"
          ></div>

          <!-- Modal -->
          <div class="relative bg-white rounded-2xl shadow-2xl max-w-lg w-full z-10 max-h-[92vh] flex flex-col">

            <!-- Header fixo -->
            <div class="flex items-center justify-between px-6 pt-6 pb-4 border-b border-gray-100">
              <div>
                <h2 class="text-xl font-bold text-gray-900">
                  {{ editMode() ? 'Editar Conta' : 'Nova Conta Mensal' }}
                </h2>
                <p class="text-xs text-gray-500 mt-0.5">Preencha os dados da sua conta recorrente</p>
              </div>
              <button
                (click)="close()"
                class="p-2 hover:bg-gray-100 rounded-xl transition-colors"
              >
                <lucide-icon [img]="XIcon" [size]="20" class="text-gray-400"></lucide-icon>
              </button>
            </div>

            <!-- Scrollable body -->
            <div class="overflow-y-auto flex-1 px-6 py-4">

              <!-- Error Message -->
              @if (error()) {
                <div class="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl flex items-start gap-2">
                  <span class="text-red-500 text-lg leading-5">⚠</span>
                  <p class="text-sm text-red-700">{{ error() }}</p>
                </div>
              }

              <!-- Form -->
              <form [formGroup]="form" (ngSubmit)="onSubmit()">

                <!-- ── TIPO ── -->
                <div class="mb-5">
                  <label class="block text-sm font-semibold text-gray-700 mb-3">Tipo de Conta</label>
                  <div class="grid grid-cols-2 gap-3">

                    <!-- Fixo -->
                    <button
                      type="button"
                      (click)="setTipo('FIXO')"
                      class="tipo-btn"
                      [class.active-fixo]="form.get('tipo_agendamento')?.value === 'FIXO'"
                      [class.inactive]="form.get('tipo_agendamento')?.value !== 'FIXO'"
                    >
                      <div class="w-10 h-10 rounded-full flex items-center justify-center mb-1"
                        [style.background]="form.get('tipo_agendamento')?.value === 'FIXO' ? '#dbeafe' : '#f3f4f6'">
                        <lucide-icon [img]="DollarIcon" [size]="20"
                          [class.text-blue-600]="form.get('tipo_agendamento')?.value === 'FIXO'"
                          [class.text-gray-400]="form.get('tipo_agendamento')?.value !== 'FIXO'"
                        ></lucide-icon>
                      </div>
                      <span class="font-semibold">Valor Fixo</span>
                      <span class="text-xs opacity-70">Mesmo valor todo mês</span>
                    </button>

                    <!-- Variável -->
                    <button
                      type="button"
                      (click)="setTipo('LEMBRETE_VARIAVEL')"
                      class="tipo-btn"
                      [class.active-variavel]="form.get('tipo_agendamento')?.value === 'LEMBRETE_VARIAVEL'"
                      [class.inactive]="form.get('tipo_agendamento')?.value !== 'LEMBRETE_VARIAVEL'"
                    >
                      <div class="w-10 h-10 rounded-full flex items-center justify-center mb-1"
                        [style.background]="form.get('tipo_agendamento')?.value === 'LEMBRETE_VARIAVEL' ? '#ede9fe' : '#f3f4f6'">
                        <lucide-icon [img]="TrendingIcon" [size]="20"
                          [class.text-purple-600]="form.get('tipo_agendamento')?.value === 'LEMBRETE_VARIAVEL'"
                          [class.text-gray-400]="form.get('tipo_agendamento')?.value !== 'LEMBRETE_VARIAVEL'"
                        ></lucide-icon>
                      </div>
                      <span class="font-semibold">Valor Variável</span>
                      <span class="text-xs opacity-70">Valor muda todo mês</span>
                    </button>

                  </div>
                </div>

                <!-- ── IDENTIFICAÇÃO ── -->
                <div class="section-divider"><span>Identificação</span></div>

                <!-- Tipo de Transação (Receita/Despesa) -->
                <div class="mb-5">
                  <label class="block text-sm font-medium text-gray-700 mb-2">Fluxo da Conta</label>
                  <div class="flex p-1 bg-gray-100 rounded-xl w-fit">
                    <button
                      type="button"
                      (click)="setTipoTransacao('Despesa')"
                      class="px-6 py-1.5 rounded-lg text-sm font-semibold transition-all"
                      [class.bg-white]="form.get('tipo_transacao')?.value === 'Despesa'"
                      [class.shadow-sm]="form.get('tipo_transacao')?.value === 'Despesa'"
                      [class.text-red-600]="form.get('tipo_transacao')?.value === 'Despesa'"
                      [class.text-gray-500]="form.get('tipo_transacao')?.value !== 'Despesa'"
                    >
                      Despesa
                    </button>
                    <button
                      type="button"
                      (click)="setTipoTransacao('Receita')"
                      class="px-6 py-1.5 rounded-lg text-sm font-semibold transition-all"
                      [class.bg-white]="form.get('tipo_transacao')?.value === 'Receita'"
                      [class.shadow-sm]="form.get('tipo_transacao')?.value === 'Receita'"
                      [class.text-emerald-600]="form.get('tipo_transacao')?.value === 'Receita'"
                      [class.text-gray-500]="form.get('tipo_transacao')?.value !== 'Receita'"
                    >
                      Receita
                    </button>
                  </div>
                </div>

                <!-- Descrição -->
                <div class="mb-4">
                  <label class="block text-sm font-medium text-gray-700 mb-1">Descrição *</label>
                  <input
                    type="text"
                    formControlName="descricao"
                    placeholder="Ex: Conta de Água, Netflix, Internet..."
                    class="input-base"
                    [class.border-red-300]="isFieldInvalid('descricao')"
                  />
                  @if (isFieldInvalid('descricao')) {
                    <p class="mt-1 text-xs text-red-600">Descrição é obrigatória</p>
                  }
                </div>

                <!-- Categoria + Subcategoria -->
                <div class="grid grid-cols-2 gap-3 mb-4">
                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">Categoria *</label>
                    @if (loadingCategories()) {
                      <div class="input-base bg-gray-50 text-gray-400 text-sm">Carregando...</div>
                    } @else {
                      <select
                        formControlName="macro_categoria"
                        (change)="onCategoriaChange()"
                        class="input-base"
                        [class.border-red-300]="isFieldInvalid('macro_categoria')"
                      >
                        <option value="">Selecione...</option>
                        @for (cat of categories(); track cat.macro_id) {
                          <option [value]="cat.macro_id">{{ cat.macro_categoria }}</option>
                        }
                      </select>
                    }
                    @if (isFieldInvalid('macro_categoria')) {
                      <p class="mt-1 text-xs text-red-600">Obrigatório</p>
                    }
                  </div>

                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">Subcategoria *</label>
                    <select
                      formControlName="subcategoria_id"
                      class="input-base"
                      [class.border-red-300]="isFieldInvalid('subcategoria_id')"
                    >
                      <option [ngValue]="null">{{ subcategories().length === 0 ? 'Selecione categoria' : 'Selecione...' }}</option>
                      @for (sub of subcategories(); track sub.id) {
                        <option [ngValue]="sub.id">{{ sub.nome }}</option>
                      }
                    </select>
                    @if (isFieldInvalid('subcategoria_id')) {
                      <p class="mt-1 text-xs text-red-600">Obrigatório</p>
                    }
                  </div>
                </div>

                <!-- Conta para Débito -->
                <div class="mb-4">
                  <label class="block text-sm font-medium text-gray-700 mb-1">Conta para Débito *</label>
                  @if (accounts().length === 0) {
                    <div class="input-base bg-yellow-50 text-yellow-700 text-sm">Nenhuma conta cadastrada</div>
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

                <!-- ── VALOR ── -->
                <div class="section-divider"><span>Valor</span></div>

                <!-- Valor (comportamento diferente por tipo) -->
                <div class="mb-4">
                  @if (form.get('tipo_agendamento')?.value === 'FIXO') {
                    <label class="block text-sm font-medium text-gray-700 mb-1">Valor Mensal *</label>
                    <div class="relative">
                      <span class="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 font-medium text-sm">R$</span>
                      <input
                        type="text"
                        inputmode="numeric"
                        [value]="formatBRL(form.get('valor_previsto')?.value)"
                        (input)="onCurrencyInput($event)"
                        (blur)="onCurrencyBlur()"
                        placeholder="0,00"
                        class="input-base pl-12"
                        [class.border-red-300]="isFieldInvalid('valor_previsto')"
                      />
                    </div>
                    @if (isFieldInvalid('valor_previsto')) {
                      <p class="mt-1 text-xs text-red-600">Valor é obrigatório e deve ser positivo</p>
                    }
                  } @else {
                    <label class="block text-sm font-medium text-gray-700 mb-1">
                      Valor Estimado
                      <span class="text-gray-400 font-normal text-xs ml-1">(opcional)</span>
                    </label>
                    <div class="relative">
                        <span class="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 font-medium text-sm">R$</span>
                        <input
                          type="text"
                          inputmode="numeric"
                          [value]="formatBRL(form.get('valor_previsto')?.value)"
                          (input)="onCurrencyInput($event)"
                          (blur)="onCurrencyBlur()"
                          placeholder="0,00 — deixe vazio se não souber"
                          class="input-base pl-12"
                        />
                      </div>
                    <p class="valor-hint">💡 Usado para estimar o gasto mensal no painel</p>
                  }
                </div>

                <!-- ── RESERVA DE EMERGÊNCIA ── -->
                <div class="mb-5 p-4 bg-blue-50 border border-blue-100 rounded-xl">
                  <div class="flex items-start gap-3">
                    <div class="pt-0.5">
                      <input type="checkbox" id="incluirNaReserva" formControlName="incluirNaReserva" class="w-4 h-4 text-blue-600 rounded focus:ring-blue-500 border-gray-300">
                    </div>
                    <div>
                      <label for="incluirNaReserva" class="block text-sm font-semibold text-gray-900 cursor-pointer">
                        Considerar na Reserva de Emergência
                      </label>
                      <p class="text-xs text-blue-700 mt-1 leading-relaxed">
                        Se marcado, o valor desta conta será somado ao cálculo da sua reserva ideal.
                      </p>
                    </div>
                  </div>
                </div>

                <!-- ── AGENDAMENTO ── -->
                <div class="section-divider"><span>Agendamento</span></div>

                <!-- Periodicidade + Dia + Mês -->
                <div class="grid grid-cols-2 gap-3 mb-4">
                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">Periodicidade *</label>
                    <select
                      formControlName="periodicidade"
                      class="input-base"
                      (change)="onPeriodicidadeChange()"
                    >
                      <option value="MENSAL">Mensal</option>
                      <option value="QUINZENAL">Quinzenal</option>
                      <option value="SEMANAL">Semanal</option>
                      <option value="ANUAL">Anual</option>
                      <option value="DIARIA">Diária</option>
                    </select>
                  </div>

                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">
                      {{ form.get('periodicidade')?.value === 'ANUAL' ? 'Dia / Mês' : 'Dia de Vencimento *' }}
                    </label>
                    <input
                      type="number"
                      formControlName="dia_execucao"
                      placeholder="1 – 31"
                      min="1"
                      max="31"
                      class="input-base"
                      [class.border-red-300]="isFieldInvalid('dia_execucao')"
                    />
                    @if (isFieldInvalid('dia_execucao')) {
                      <p class="mt-1 text-xs text-red-600">Dia deve ser entre 1 e 31</p>
                    }
                  </div>
                </div>

                <!-- Mês de execução (só para ANUAL) -->
                @if (form.get('periodicidade')?.value === 'ANUAL') {
                  <div class="mb-4">
                    <label class="block text-sm font-medium text-gray-700 mb-1">Mês de Vencimento *</label>
                    <select formControlName="mes_execucao" class="input-base">
                      <option [ngValue]="null">Selecione o mês...</option>
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

                <!-- Data de Início + Notificação -->
                <div class="grid grid-cols-2 gap-3">
                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">Data de Início *</label>
                    <input
                      type="date"
                      formControlName="data_inicio"
                      class="input-base"
                      [class.border-red-300]="isFieldInvalid('data_inicio')"
                    />
                    @if (isFieldInvalid('data_inicio')) {
                      <p class="mt-1 text-xs text-red-600">Obrigatório</p>
                    }
                  </div>

                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">Notificar (dias antes)</label>
                    <input
                      type="number"
                      formControlName="notificar_antes_dias"
                      min="0"
                      max="30"
                      class="input-base"
                    />
                  </div>
                </div>

              </form>
            </div>

            <!-- Footer fixo -->
            <div class="flex gap-3 px-6 py-4 border-t border-gray-100 bg-gray-50 rounded-b-2xl">
              <button
                type="button"
                (click)="close()"
                class="flex-1 px-4 py-3 border border-gray-200 rounded-xl hover:bg-gray-100 transition-colors font-medium text-gray-600 text-sm"
              >
                Cancelar
              </button>
              <button
                type="button"
                (click)="onSubmit()"
                [disabled]="loading()"
                class="flex-[2] btn-primary py-3 flex items-center justify-center gap-2 rounded-xl text-sm"
              >
                @if (loading()) {
                  <lucide-icon [img]="LoaderIcon" [size]="18" class="animate-spin"></lucide-icon>
                  <span>Salvando...</span>
                } @else {
                  <span>{{ editMode() ? '✓  Atualizar Conta' : '+ Salvar Conta' }}</span>
                }
              </button>
            </div>

          </div>
        </div>
      </div>
    }
  `
})
export class BillModalComponent {
  @Output() saved = new EventEmitter<ScheduledBill>();
  @Output() closed = new EventEmitter<void>();

  // Icons
  XIcon = X;
  LoaderIcon = Loader2;
  DollarIcon = DollarSign;
  TrendingIcon = TrendingUp;
  CalendarIcon = Calendar;
  BellIcon = Bell;
  TagIcon = Tag;
  CardIcon = CreditCard;
  ZapIcon = Zap;
  ChartIcon = BarChart3;
  InfoIcon = Info;

  // Signals
  isOpen = signal(false);
  loading = signal(false);
  error = signal<string | null>(null);
  editMode = signal(false);

  // Contas recebidas do componente pai (evita chamada duplicada ao backend)
  @Input() set accountsList(value: BankAccount[]) {
    this.accounts.set(value);
  }

  // Dados internos
  accounts = signal<BankAccount[]>([]);
  categories = signal<Category[]>([]);
  subcategories = signal<SubCategory[]>([]);
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
      tipo_transacao: ['Despesa', Validators.required],
      macro_categoria: ['', Validators.required],
      subcategoria_id: [{ value: null, disabled: true }, Validators.required],
      conta_id: [null, Validators.required],
      notificar_antes_dias: [3],
      incluirNaReserva: [false],
    });
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
      // Habilita subcategoria antes do patchValue (modo edição já tem categoria)
      this.form.get('subcategoria_id')?.enable();
      this.form.patchValue({
        tipo_agendamento: bill.tipo_agendamento,
        descricao: bill.descricao,
        valor_previsto: bill.valor_previsto ?? null,
        periodicidade: bill.periodicidade,
        dia_execucao: bill.dia_execucao,
        mes_execucao: bill.mes_execucao ?? null,
        data_inicio: bill.data_inicio,
        tipo_transacao: bill.tipo_transacao,
        subcategoria_id: bill.subcategoria_id,
        conta_id: bill.conta_id,
        notificar_antes_dias: bill.notificar_antes_dias,
        incluirNaReserva: bill.incluir_na_reserva ?? false,
      });
      // Carregar subcategorias da categoria da conta em edição
      this.loadCategories(bill.tipo_transacao, bill.subcategoria_id);
    } else {
      this.editMode.set(false);
      this.billId = null;
      this.form.get('subcategoria_id')?.disable();
      // Ao criar novo, carregar despesas por padrão (ou o que estiver no form)
      this.loadCategories(this.form.get('tipo_transacao')?.value);
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
   * Altera o tipo de agendamento (Fixo ou Variável)
   */
  setTipo(tipo: 'FIXO' | 'LEMBRETE_VARIAVEL'): void {
    this.form.patchValue({ tipo_agendamento: tipo });
    if (tipo === 'LEMBRETE_VARIAVEL') {
      // Para variável: valor_previsto é OPCIONAL (estimativa)
      this.form.get('valor_previsto')?.clearValidators();
      this.form.get('valor_previsto')?.setValidators([Validators.min(0.01)]);
    } else {
      // Para fixo: valor_previsto é OBRIGATÓRIO
      this.form.get('valor_previsto')?.setValidators([Validators.required, Validators.min(0.01)]);
    }
    this.form.get('valor_previsto')?.updateValueAndValidity();
  }

  /**
   * Altera o tipo de transação (Receita ou Despesa) e recarrega categorias
   */
  setTipoTransacao(tipo: 'Receita' | 'Despesa'): void {
    if (this.form.get('tipo_transacao')?.value === tipo) return;

    this.form.patchValue({
      tipo_transacao: tipo,
      macro_categoria: '',
      subcategoria_id: null
    });
    this.subcategories.set([]);
    this.form.get('subcategoria_id')?.disable();
    this.loadCategories(tipo);
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
      const subs = categoria?.subcategorias || [];
      this.subcategories.set(subs);
      this.form.patchValue({ subcategoria_id: null });
      // Habilita/desabilita via FormControl (sem usar [disabled] no template)
      if (subs.length > 0) {
        this.form.get('subcategoria_id')?.enable();
      } else {
        this.form.get('subcategoria_id')?.disable();
      }
    } else {
      this.subcategories.set([]);
      this.form.get('subcategoria_id')?.disable();
    }
  }

  /**
   * Verifica se campo é inválido (tocado ou dirty)
   */
  isFieldInvalid(fieldName: string): boolean {
    const field = this.form.get(fieldName);
    return !!(field && field.invalid && (field.dirty || field.touched));
  }

  /** Formata o número armazenado no FormControl para exibição (ex: 1234.5 -> '1.234,50') */
  formatBRL(value: number | null | undefined): string {
    if (value == null || isNaN(Number(value))) return '';
    return Number(value).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  }

  /** Trata o evento de input do campo de moeda */
  onCurrencyInput(event: Event): void {
    const input = event.target as HTMLInputElement;
    // Mantém apenas dígitos
    const digits = input.value.replace(/\D/g, '');
    if (!digits) {
      input.value = '';
      this.form.patchValue({ valor_previsto: null }, { emitEvent: false });
      return;
    }
    // Converte centavos: '12350' -> 123.50
    const numeric = parseInt(digits, 10) / 100;
    // Formata para exibição
    const formatted = numeric.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    input.value = formatted;
    // Salva o valor numérico puro no FormControl
    this.form.patchValue({ valor_previsto: numeric });
  }

  /** Ao sair do campo, garante formatação correta */
  onCurrencyBlur(): void {
    const ctrl = this.form.get('valor_previsto');
    if (ctrl?.value != null) {
      ctrl.markAsTouched();
    }
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

    const formValue = this.form.getRawValue();
    const billRequest: ScheduledBillRequest = {
      descricao: formValue.descricao,
      tipo_agendamento: formValue.tipo_agendamento,
      periodicidade: formValue.periodicidade,
      dia_execucao: formValue.dia_execucao,
      data_inicio: formValue.data_inicio,
      subcategoria_id: formValue.subcategoria_id,
      conta_id: formValue.conta_id,
      notificar_antes_dias: formValue.notificar_antes_dias || 3,
      incluir_na_reserva: formValue.incluirNaReserva,
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
   * Carrega categorias (Receita ou Despesa) e (opcionalmente) pré-seleciona subcategoria em edição
   */
  private loadCategories(tipo: 'Receita' | 'Despesa' = 'Despesa', subcategoriaIdToSelect?: number): void {
    this.loadingCategories.set(true);
    this.financesService.getCategories(tipo).pipe(
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
      tipo_transacao: 'Despesa',
      periodicidade: 'MENSAL',
      dia_execucao: null,
      notificar_antes_dias: 3,
      data_inicio: this.getTodayDate(),
    });
    this.form.get('subcategoria_id')?.disable();
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
