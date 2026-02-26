import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  LucideAngularModule,
  User,
  Key,
  Bell,
  MapPin,
  Eye,
  EyeOff,
  Check,
  X,
  Loader,
  Save,
  Home,
  Briefcase,
} from 'lucide-angular';
import { SettingsService } from '../../core/services/settings.service';
import {
  ApiKeyType,
  ApiKeyConfig,
  NotificationConfig,
  ProfileUpdateRequest,
} from '../../core/models/settings.model';

type Tab = 'profile' | 'api-keys' | 'notifications' | 'addresses';

interface Toast { message: string; type: 'success' | 'error'; }

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [CommonModule, FormsModule, LucideAngularModule],
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.scss'],
})
export class SettingsComponent implements OnInit {
  // Lucide icons
  UserIcon      = User;
  KeyIcon       = Key;
  BellIcon      = Bell;
  MapPinIcon    = MapPin;
  EyeIcon       = Eye;
  EyeOffIcon    = EyeOff;
  CheckIcon     = Check;
  XIcon         = X;
  LoaderIcon    = Loader;
  SaveIcon      = Save;
  HomeIcon      = Home;
  BriefcaseIcon = Briefcase;

  ApiKeyType = ApiKeyType;

  public readonly settingsService = inject(SettingsService);

  // ==========================================
  // Navegação
  // ==========================================
  selectedTab = signal<Tab>('profile');

  // ==========================================
  // Toast
  // ==========================================
  toast = signal<Toast | null>(null);
  private _toastTimer: ReturnType<typeof setTimeout> | null = null;

  showToast(message: string, type: 'success' | 'error' = 'success'): void {
    if (this._toastTimer) clearTimeout(this._toastTimer);
    this.toast.set({ message, type });
    this._toastTimer = setTimeout(() => this.toast.set(null), 3500);
  }

  // ==========================================
  // Aba Perfil
  // ==========================================
  profileForm = signal<ProfileUpdateRequest>({
    nome: '',
    email: '',
    cidade: '',
    estado: 'SP',
    fuso_horario: 'America/Sao_Paulo',
    meses_reserva_emergencia: 6,
  });

  readonly fusoOptions = [
    'America/Sao_Paulo',
    'America/Manaus',
    'America/Belem',
    'America/Fortaleza',
    'America/Recife',
    'America/Cuiaba',
    'America/Porto_Velho',
    'America/Boa_Vista',
    'America/Rio_Branco',
    'America/Noronha',
  ];

  // ==========================================
  // Aba API Keys
  // ==========================================
  showKeys = signal<Record<string, boolean>>({
    [ApiKeyType.GEMINI]:    false,
    [ApiKeyType.WEATHER]:   false,
    [ApiKeyType.OPENROUTE]: false,
  });

  apiKeyForms = signal<Record<string, { useOwnKey: boolean; key: string; hasKey: boolean }>>({
    [ApiKeyType.GEMINI]:    { useOwnKey: false, key: '', hasKey: false },
    [ApiKeyType.WEATHER]:   { useOwnKey: false, key: '', hasKey: false },
    [ApiKeyType.OPENROUTE]: { useOwnKey: false, key: '', hasKey: false },
  });

  readonly apiKeyInfo = {
    [ApiKeyType.GEMINI]: {
      name: 'Google Gemini AI',
      description: 'Necessária para funcionalidades de IA e assistente inteligente',
      link: 'https://makersuite.google.com/app/apikey',
      placeholder: 'AIza...',
    },
    [ApiKeyType.WEATHER]: {
      name: 'OpenWeather API',
      description: 'Necessária para previsão do tempo e alertas climáticos',
      link: 'https://openweathermap.org/api',
      placeholder: 'abc123...',
    },
    [ApiKeyType.OPENROUTE]: {
      name: 'OpenRoute Service',
      description: 'Necessária para rotas e mapas de deslocamento',
      link: 'https://openrouteservice.org/dev/#/signup',
      placeholder: '5b3ce...',
    },
  };

  // ==========================================
  // Aba Notificações
  // ==========================================
  notificationForm = signal<NotificationConfig>({
    morningBriefing: { enabled: true, time: '07:00' },
    eveningCheckIn:  { enabled: true, time: '19:00' },
    financialAlerts: { enabled: true, daysBeforeDue: 3 },
  });

  // ==========================================
  // Aba Endereços
  // ==========================================
  newAddress = signal<{ label: string; address: string }>({ label: 'casa', address: '' });

  // ==========================================
  // Lifecycle
  // ==========================================
  ngOnInit(): void {
    this._loadAll();
  }

  private _loadAll(): void {
    this.settingsService.getProfile().subscribe({
      next: res => {
        if (res.status === 'success' && res.data) {
          const p = res.data;
          this.profileForm.set({
            nome:                     p.nome ?? '',
            email:                    p.email ?? '',
            cidade:                   p.cidade ?? '',
            estado:                   p.estado ?? 'SP',
            fuso_horario:             p.fuso_horario ?? 'America/Sao_Paulo',
            meses_reserva_emergencia: p.meses_reserva_emergencia ?? 6,
          });
        }
      },
    });

    this.settingsService.loadSettings().subscribe({
      next: res => {
        if (res.status === 'success' && res.data) {
          this._syncApiKeyForms(res.data.apiKeys);
          if (res.data.notifications) {
            this.notificationForm.set(res.data.notifications);
          }
        }
      },
    });
  }

  private _syncApiKeyForms(apiKeys: ApiKeyConfig[]): void {
    const forms = { ...this.apiKeyForms() };
    apiKeys.forEach(k => {
      forms[k.type] = { useOwnKey: k.useOwnKey, key: k.key ?? '', hasKey: k.hasKey ?? false };
    });
    this.apiKeyForms.set(forms);
  }

  // ==========================================
  // Ações — Perfil
  // ==========================================
  saveProfile(): void {
    const form = this.profileForm();
    if (!form.nome || form.nome.trim().length < 2) {
      this.showToast('Nome deve ter pelo menos 2 caracteres', 'error');
      return;
    }
    this.settingsService.updateProfile(form).subscribe({
      next: res => {
        if (res.status === 'success') {
          this.showToast('Perfil atualizado com sucesso!');
        } else {
          this.showToast(res.message ?? 'Erro ao salvar perfil', 'error');
        }
      },
      error: () => this.showToast('Erro ao salvar perfil', 'error'),
    });
  }

  updateProfileField(field: keyof ProfileUpdateRequest, value: any): void {
    this.profileForm.update(cur => ({ ...cur, [field]: value }));
  }

  // ==========================================
  // Ações — API Keys
  // ==========================================
  toggleKeyVisibility(type: ApiKeyType): void {
    this.showKeys.update(cur => ({ ...cur, [type]: !cur[type] }));
  }

  updateApiKeyForm(type: ApiKeyType, field: 'useOwnKey' | 'key', value: any): void {
    this.apiKeyForms.update(cur => ({
      ...cur,
      [type]: { ...cur[type], [field]: value },
    }));
  }

  saveApiKey(type: ApiKeyType): void {
    const form = this.apiKeyForms()[type];
    if (form.useOwnKey && !form.key) {
      this.showToast('Por favor, insira uma chave válida', 'error');
      return;
    }
    const apiKey: ApiKeyConfig = {
      type,
      useOwnKey: form.useOwnKey,
      key: form.useOwnKey ? form.key : undefined,
    };
    this.settingsService.updateApiKey(apiKey).subscribe({
      next: res => {
        if (res.status === 'success') {
          this.showToast('Chave API salva com sucesso!');
          this.apiKeyForms.update(cur => ({
            ...cur,
            [type]: { ...cur[type], hasKey: form.useOwnKey && !!form.key },
          }));
        } else {
          this.showToast(res.message ?? 'Erro ao salvar chave API', 'error');
        }
      },
      error: () => this.showToast('Erro ao salvar chave API', 'error'),
    });
  }

  validateApiKey(type: ApiKeyType): void {
    const form = this.apiKeyForms()[type];
    if (!form.key) {
      this.showToast('Insira uma chave para validar', 'error');
      return;
    }
    this.settingsService.validateApiKey(type, form.key).subscribe({
      next: isValid => {
        if (isValid) {
          this.showToast('Chave válida!');
        } else {
          this.showToast('Chave inválida ou sem permissão', 'error');
        }
      },
    });
  }

  isApiKeyFormValid(type: ApiKeyType): boolean {
    const form = this.apiKeyForms()[type];
    return !form.useOwnKey || (form.useOwnKey && form.key.length > 0);
  }

  // ==========================================
  // Ações — Notificações
  // ==========================================
  saveNotifications(): void {
    this.settingsService.updateNotifications(this.notificationForm()).subscribe({
      next: res => {
        if (res.status === 'success') {
          this.showToast('Notificações atualizadas com sucesso!');
        } else {
          this.showToast(res.message ?? 'Erro ao salvar notificações', 'error');
        }
      },
      error: () => this.showToast('Erro ao salvar notificações', 'error'),
    });
  }

  updateNotifField(section: keyof NotificationConfig, field: string, value: any): void {
    this.notificationForm.update(cur => ({
      ...cur,
      [section]: { ...(cur[section] as any), [field]: value },
    }));
  }

  // ==========================================
  // Ações — Endereços
  // ==========================================
  saveAddress(): void {
    const addr = this.newAddress();
    if (!addr.address.trim()) {
      this.showToast('Informe o endereço', 'error');
      return;
    }
    this.settingsService.saveAddress({ label: addr.label, address: addr.address }).subscribe({
      next: res => {
        if (res.status === 'success') {
          this.showToast('Endereço salvo com sucesso!');
          this.newAddress.set({ label: 'casa', address: '' });
        } else {
          this.showToast(res.message ?? 'Erro ao salvar endereço', 'error');
        }
      },
      error: () => this.showToast('Erro ao salvar endereço', 'error'),
    });
  }

  removeAddress(label: string): void {
    this.settingsService.removeAddress(label).subscribe({
      next: res => {
        if (res.status === 'success') {
          this.showToast('Endereço removido!');
        } else {
          this.showToast(res.message ?? 'Erro ao remover endereço', 'error');
        }
      },
      error: () => this.showToast('Erro ao remover endereço', 'error'),
    });
  }

  updateNewAddressLabel(value: string): void {
    this.newAddress.update(cur => ({ ...cur, label: value }));
  }

  updateNewAddressText(value: string): void {
    this.newAddress.update(cur => ({ ...cur, address: value }));
  }

  // ==========================================
  // Navegação
  // ==========================================
  setTab(tab: Tab): void {
    this.selectedTab.set(tab);
  }

  getLabelIcon(label: string): any {
    if (label === 'casa')     return this.HomeIcon;
    if (label === 'trabalho') return this.BriefcaseIcon;
    return this.MapPinIcon;
  }
}
