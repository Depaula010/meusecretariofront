import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { AccountsComponent } from './accounts.component';
import { FinancesService } from './services/finances.service';
import { of, throwError } from 'rxjs';
import { BankAccount } from './models/finances.model';

describe('AccountsComponent', () => {
  let component: AccountsComponent;
  let fixture: ComponentFixture<AccountsComponent>;
  let financesServiceSpy: jasmine.SpyObj<FinancesService>;

  const mockAccounts: BankAccount[] = [
    {
      id: 1,
      nome: 'Nubank',
      tipo: 'corrente',
      saldo: 1500.50,
      banco: 'Nubank',
      cor: '#8A05BE'
    },
    {
      id: 2,
      nome: 'Cartao Inter',
      tipo: 'cartao_credito',
      saldo: -500,
      banco: 'Inter',
      cor: '#FF7A00',
      limite: 5000,
      dia_vencimento: 15,
      dia_fechamento: 8
    },
    {
      id: 3,
      nome: 'Poupanca BB',
      tipo: 'poupanca',
      saldo: 10000,
      banco: 'Banco do Brasil',
      cor: '#FFFF00'
    }
  ];

  beforeEach(async () => {
    const spy = jasmine.createSpyObj('FinancesService', [
      'getAccounts',
      'createAccount',
      'updateAccount',
      'deleteAccount'
    ]);

    await TestBed.configureTestingModule({
      imports: [AccountsComponent, HttpClientTestingModule],
      providers: [{ provide: FinancesService, useValue: spy }]
    }).compileComponents();

    financesServiceSpy = TestBed.inject(FinancesService) as jasmine.SpyObj<FinancesService>;
    financesServiceSpy.getAccounts.and.returnValue(of(mockAccounts));

    fixture = TestBed.createComponent(AccountsComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load accounts on init', () => {
    fixture.detectChanges();

    expect(financesServiceSpy.getAccounts).toHaveBeenCalled();
    expect(component.accounts().length).toBe(3);
    expect(component.loading()).toBeFalse();
  });

  it('should calculate total balance correctly', () => {
    fixture.detectChanges();

    // 1500.50 + (-500) + 10000 = 11000.50
    expect(component.totalBalance()).toBe(11000.50);
  });

  it('should group accounts by type', () => {
    fixture.detectChanges();

    const grouped = component.accountsByType();
    expect(grouped.corrente.length).toBe(1);
    expect(grouped.cartao_credito.length).toBe(1);
    expect(grouped.poupanca.length).toBe(1);
    expect(grouped.investimento.length).toBe(0);
  });

  it('should handle error when loading accounts', () => {
    financesServiceSpy.getAccounts.and.returnValue(
      throwError(() => new Error('Network error'))
    );

    fixture.detectChanges();

    expect(component.error()).toBeTruthy();
    expect(component.loading()).toBeFalse();
  });

  it('should format currency correctly', () => {
    const formatted = component.formatCurrency(1500.50);
    expect(formatted).toContain('1.500,50');
  });

  it('should get correct icon for account type', () => {
    expect(component.getAccountIcon('cartao_credito')).toBeTruthy();
    expect(component.getAccountIcon('investimento')).toBeTruthy();
    expect(component.getAccountIcon('poupanca')).toBeTruthy();
    expect(component.getAccountIcon('corrente')).toBeTruthy();
  });

  it('should get correct label for account type', () => {
    expect(component.getAccountTypeLabel('corrente')).toBe('Conta Corrente');
    expect(component.getAccountTypeLabel('poupanca')).toBe('Poupança');
    expect(component.getAccountTypeLabel('cartao_credito')).toBe('Cartão de Crédito');
    expect(component.getAccountTypeLabel('investimento')).toBe('Investimento');
  });

  it('should open create modal', () => {
    fixture.detectChanges();

    // Mock the ViewChild
    component.accountModal = {
      open: jasmine.createSpy('open')
    } as any;

    component.openCreateModal();

    expect(component.selectedAccount()).toBeNull();
    expect(component.accountModal.open).toHaveBeenCalled();
  });

  it('should open edit modal with account', () => {
    fixture.detectChanges();

    component.accountModal = {
      open: jasmine.createSpy('open')
    } as any;

    const account = mockAccounts[0];
    component.openEditModal(account);

    expect(component.selectedAccount()).toBe(account);
    expect(component.accountModal.open).toHaveBeenCalledWith(account);
  });

  it('should show delete dialog on confirmDelete', () => {
    fixture.detectChanges();

    const account = mockAccounts[0];
    component.confirmDelete(account);

    expect(component.selectedAccount()).toBe(account);
    expect(component.showDeleteDialog()).toBeTrue();
  });

  it('should hide delete dialog on cancelDelete', () => {
    fixture.detectChanges();

    component.showDeleteDialog.set(true);
    component.selectedAccount.set(mockAccounts[0]);

    component.cancelDelete();

    expect(component.showDeleteDialog()).toBeFalse();
    expect(component.selectedAccount()).toBeNull();
  });

  it('should delete account successfully', () => {
    fixture.detectChanges();

    financesServiceSpy.deleteAccount.and.returnValue(of(void 0));

    const account = mockAccounts[0];
    component.selectedAccount.set(account);
    component.showDeleteDialog.set(true);

    component.deleteAccount();

    expect(financesServiceSpy.deleteAccount).toHaveBeenCalledWith(account.id);
  });

  it('should handle delete error', () => {
    fixture.detectChanges();

    financesServiceSpy.deleteAccount.and.returnValue(
      throwError(() => ({ error: { message: 'Conta possui transacoes' } }))
    );

    const account = mockAccounts[0];
    component.selectedAccount.set(account);
    component.showDeleteDialog.set(true);

    component.deleteAccount();

    expect(component.error()).toBeTruthy();
    expect(component.showDeleteDialog()).toBeFalse();
  });

  it('should reload accounts after save', () => {
    fixture.detectChanges();

    const loadSpy = spyOn(component, 'loadAccounts');
    component.onAccountSaved(mockAccounts[0]);

    expect(loadSpy).toHaveBeenCalled();
  });
});
