import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { AccountModalComponent } from './account-modal.component';
import { FinancesService } from '../services/finances.service';
import { of, throwError } from 'rxjs';
import { BankAccount } from '../models/finances.model';

describe('AccountModalComponent', () => {
  let component: AccountModalComponent;
  let fixture: ComponentFixture<AccountModalComponent>;
  let financesServiceSpy: jasmine.SpyObj<FinancesService>;

  const mockAccount: BankAccount = {
    id: 1,
    nome: 'Nubank',
    tipo: 'corrente',
    saldo: 1500.50,
    banco: 'Nubank',
    cor: '#8A05BE'
  };

  const mockCreditCard: BankAccount = {
    id: 2,
    nome: 'Cartao Inter',
    tipo: 'cartao_credito',
    saldo: -500,
    banco: 'Inter',
    cor: '#FF7A00',
    limite: 5000,
    dia_vencimento: 15,
    dia_fechamento: 8
  };

  beforeEach(async () => {
    const spy = jasmine.createSpyObj('FinancesService', [
      'createAccount',
      'updateAccount'
    ]);

    await TestBed.configureTestingModule({
      imports: [AccountModalComponent, HttpClientTestingModule, ReactiveFormsModule],
      providers: [{ provide: FinancesService, useValue: spy }]
    }).compileComponents();

    financesServiceSpy = TestBed.inject(FinancesService) as jasmine.SpyObj<FinancesService>;

    fixture = TestBed.createComponent(AccountModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize with default form values', () => {
    expect(component.form.get('nome_conta')?.value).toBe('');
    expect(component.form.get('tipo_conta')?.value).toBe('Conta Corrente');
    expect(component.form.get('saldo_inicial')?.value).toBe(0);
    expect(component.form.get('cor_hex')?.value).toBe('#3B82F6');
  });

  it('should open modal for creating new account', () => {
    component.open();

    expect(component.isOpen()).toBeTrue();
    expect(component.editMode()).toBeFalse();
  });

  it('should open modal for editing existing account', () => {
    component.open(mockAccount);

    expect(component.isOpen()).toBeTrue();
    expect(component.editMode()).toBeTrue();
    expect(component.form.get('nome_conta')?.value).toBe('Nubank');
  });

  it('should close modal', () => {
    component.open();
    component.close();

    expect(component.isOpen()).toBeFalse();
  });

  it('should emit closed event on close', () => {
    spyOn(component.closed, 'emit');
    component.open();
    component.close();

    expect(component.closed.emit).toHaveBeenCalled();
  });

  it('should validate required fields', () => {
    component.form.patchValue({
      nome_conta: '',
      tipo_conta: ''
    });

    expect(component.form.valid).toBeFalse();
    expect(component.isFieldInvalid('nome_conta')).toBeFalse(); // Not touched yet

    component.form.get('nome_conta')?.markAsTouched();
    expect(component.isFieldInvalid('nome_conta')).toBeTrue();
  });

  it('should set tipo conta correctly', () => {
    component.setTipoConta('Cartão de Crédito');
    expect(component.form.get('tipo_conta')?.value).toBe('Cartão de Crédito');
  });

  it('should set cor correctly', () => {
    component.setCor('#FF0000');
    expect(component.form.get('cor_hex')?.value).toBe('#FF0000');
  });

  it('should have all account types defined', () => {
    expect(component.tiposConta.length).toBe(6);
    expect(component.tiposConta.map(t => t.value)).toContain('Conta Corrente');
    expect(component.tiposConta.map(t => t.value)).toContain('Cartão de Crédito');
    expect(component.tiposConta.map(t => t.value)).toContain('Investimento');
  });

  it('should have color options defined', () => {
    expect(component.cores.length).toBeGreaterThan(0);
    expect(component.cores[0]).toMatch(/^#[0-9A-F]{6}$/i);
  });

  it('should load credit card fields correctly', () => {
    component.open(mockCreditCard);

    expect(component.form.get('limite_credito')?.value).toBe(5000);
    expect(component.form.get('dia_vencimento')?.value).toBe(15);
    expect(component.form.get('dia_fechamento')?.value).toBe(8);
  });

  it('should create account on submit (create mode)', () => {
    const newAccount = { ...mockAccount, id: 999 };
    financesServiceSpy.createAccount.and.returnValue(of(newAccount));
    spyOn(component.saved, 'emit');

    component.open();
    component.form.patchValue({
      nome_conta: 'Nova Conta',
      tipo_conta: 'Conta Corrente',
      saldo_inicial: 1000,
      banco: 'Banco X'
    });

    component.onSubmit();

    expect(financesServiceSpy.createAccount).toHaveBeenCalled();
  });

  it('should update account on submit (edit mode)', () => {
    financesServiceSpy.updateAccount.and.returnValue(of(mockAccount));
    spyOn(component.saved, 'emit');

    component.open(mockAccount);
    component.form.patchValue({
      nome_conta: 'Nubank Atualizado'
    });

    component.onSubmit();

    expect(financesServiceSpy.updateAccount).toHaveBeenCalledWith(
      mockAccount.id,
      jasmine.any(Object)
    );
  });

  it('should handle error on submit', () => {
    financesServiceSpy.createAccount.and.returnValue(
      throwError(() => ({ error: { message: 'Erro ao criar' } }))
    );

    component.open();
    component.form.patchValue({
      nome_conta: 'Nova Conta',
      tipo_conta: 'Conta Corrente',
      saldo_inicial: 1000
    });

    component.onSubmit();

    expect(component.error()).toBeTruthy();
    expect(component.saving()).toBeFalse();
  });

  it('should not submit invalid form', () => {
    component.open();
    component.form.patchValue({
      nome_conta: '' // Required field empty
    });

    component.onSubmit();

    expect(financesServiceSpy.createAccount).not.toHaveBeenCalled();
  });

  it('should emit saved event on successful create', () => {
    const newAccount = { ...mockAccount, id: 999 };
    financesServiceSpy.createAccount.and.returnValue(of(newAccount));
    spyOn(component.saved, 'emit');

    component.open();
    component.form.patchValue({
      nome_conta: 'Nova Conta',
      tipo_conta: 'Conta Corrente',
      saldo_inicial: 1000
    });

    component.onSubmit();

    expect(component.saved.emit).toHaveBeenCalledWith(newAccount);
  });

  it('should show saving state during submit', () => {
    financesServiceSpy.createAccount.and.returnValue(of(mockAccount));

    component.open();
    component.form.patchValue({
      nome_conta: 'Nova Conta',
      tipo_conta: 'Conta Corrente',
      saldo_inicial: 1000
    });

    // Before submit
    expect(component.saving()).toBeFalse();

    // Note: In real scenario, we'd need to test async behavior
    component.onSubmit();
  });
});
