import { Component, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  LucideAngularModule,
  Key,
  Bell,
  MapPin,
  Eye,
  EyeOff,
  Check,
  X,
  Loader,
  Save,
} from 'lucide-angular';
import { SettingsService } from '../../core/services/settings.service';
import { ApiKeyType, ApiKeyConfig, NotificationConfig } from '../../core/models/settings.model';

/**
 * Settings Component
 *
 * Tela de configurações do assistente:
 * 1. API Keys (BYOK - Bring Your Own Key)
 * 2. Notificações
 * 3. Endereços Favoritos
 */
@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [CommonModule, FormsModule, LucideAngularModule],
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.scss']
})
export class SettingsComponent implements OnInit {
  // Ícones
  KeyIcon = Key;
  BellIcon = Bell;
  MapPinIcon = MapPin;
  EyeIcon = Eye;
  EyeOffIcon = EyeOff;
  CheckIcon = Check;
  XIcon = X;
  LoaderIcon = Loader;
  SaveIcon = Save;

  // Enum para template
  ApiKeyType = ApiKeyType;

  // Estado local
  selectedTab = signal<'api-keys' | 'notifications' | 'addresses'>('api-keys');
  showKeys = signal<Record<string, boolean>>({
    [ApiKeyType.GEMINI]: false,
    [ApiKeyType.WEATHER]: false,
    [ApiKeyType.OPENROUTE]: false,
  });

  // Formulários locais
  apiKeyForms = signal<Record<string, { useOwnKey: boolean; key: string }>>({
    [ApiKeyType.GEMINI]: { useOwnKey: false, key: '' },
    [ApiKeyType.WEATHER]: { useOwnKey: false, key: '' },
    [ApiKeyType.OPENROUTE]: { useOwnKey: false, key: '' },
  });

  notificationForm = signal<NotificationConfig>({
    morningBriefing: { enabled: true, time: '08:00' },
    eveningCheckIn: { enabled: true, time: '20:00' },
    financialAlerts: { enabled: true, daysBeforeDue: 3 },
  });

  // Mensagens de info para cada API
  apiKeyInfo = {
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

  constructor(public settingsService: SettingsService) {}

  ngOnInit(): void {
    // Carregar configurações do usuário (mock userId por enquanto)
    const userId = 'user-demo';
    this.loadSettings(userId);
  }

  /**
   * Carregar configurações
   */
  loadSettings(userId: string): void {
    this.settingsService.loadSettings(userId).subscribe({
      next: (response) => {
        if (response.success && response.data) {
          // Preencher formulários com dados carregados
          this.initializeForms(response.data.apiKeys, response.data.notifications);
        }
      },
      error: (error) => {
        console.error('Erro ao carregar configurações:', error);
      }
    });
  }

  /**
   * Inicializar formulários com dados carregados
   */
  initializeForms(apiKeys: ApiKeyConfig[], notifications: NotificationConfig): void {
    // API Keys
    const forms: any = {};
    apiKeys.forEach(key => {
      forms[key.type] = {
        useOwnKey: key.useOwnKey,
        key: key.key || '',
      };
    });
    this.apiKeyForms.set(forms);

    // Notificações
    if (notifications) {
      this.notificationForm.set(notifications);
    }
  }

  /**
   * Toggle visibilidade da chave
   */
  toggleKeyVisibility(type: ApiKeyType): void {
    this.showKeys.update(current => ({
      ...current,
      [type]: !current[type]
    }));
  }

  /**
   * Salvar API Key
   */
  saveApiKey(type: ApiKeyType): void {
    const form = this.apiKeyForms()[type];

    if (form.useOwnKey && !form.key) {
      alert('Por favor, insira uma chave válida');
      return;
    }

    const apiKeyConfig: ApiKeyConfig = {
      type,
      useOwnKey: form.useOwnKey,
      key: form.useOwnKey ? form.key : undefined,
    };

    const userId = 'user-demo'; // TODO: Pegar do AuthService
    this.settingsService.updateApiKey(userId, apiKeyConfig).subscribe({
      next: (response) => {
        if (response.success) {
          alert('API Key salva com sucesso!');
        }
      },
      error: (error) => {
        console.error('Erro ao salvar API Key:', error);
        alert('Erro ao salvar API Key');
      }
    });
  }

  /**
   * Validar API Key
   */
  validateApiKey(type: ApiKeyType): void {
    const form = this.apiKeyForms()[type];

    if (!form.key) {
      alert('Insira uma chave para validar');
      return;
    }

    this.settingsService.validateApiKey(type, form.key).subscribe({
      next: (isValid) => {
        if (isValid) {
          alert('✓ Chave válida!');
        } else {
          alert('✗ Chave inválida');
        }
      }
    });
  }

  /**
   * Salvar configurações de notificações
   */
  saveNotifications(): void {
    const userId = 'user-demo'; // TODO: Pegar do AuthService
    this.settingsService.updateNotifications(userId, this.notificationForm()).subscribe({
      next: (response) => {
        if (response.success) {
          alert('Notificações atualizadas com sucesso!');
        }
      },
      error: (error) => {
        console.error('Erro ao salvar notificações:', error);
        alert('Erro ao salvar notificações');
      }
    });
  }

  /**
   * Mudar tab ativa
   */
  setTab(tab: 'api-keys' | 'notifications' | 'addresses'): void {
    this.selectedTab.set(tab);
  }

  /**
   * Computed: Verificar se formulário de API Key está válido
   */
  isApiKeyFormValid(type: ApiKeyType): boolean {
    const form = this.apiKeyForms()[type];
    return !form.useOwnKey || (form.useOwnKey && form.key.length > 0);
  }
}
