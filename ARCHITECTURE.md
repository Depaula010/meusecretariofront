# 🏗 Arquitetura Frontend - Meu Secretário

## Visão Geral da Arquitetura

Este documento descreve a arquitetura técnica do frontend do SaaS "Meu Secretário", construído com Angular 18+ usando Standalone Components e Signals.

---

## 📊 Diagrama de Arquitetura

```
┌─────────────────────────────────────────────────────────────┐
│                      PRESENTATION LAYER                      │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │   Features   │  │   Layouts    │  │    Shared    │      │
│  │ (Dashboard,  │  │ (Main, Auth) │  │ (Components) │      │
│  │  Settings)   │  │              │  │              │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│                      APPLICATION LAYER                       │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │   Services   │  │    Guards    │  │ Interceptors │      │
│  │  (Settings,  │  │    (Auth)    │  │    (HTTP)    │      │
│  │    Auth)     │  │              │  │              │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│                         DATA LAYER                           │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │  HttpClient  │  │    Models    │  │   Signals    │      │
│  │ (REST API)   │  │ (Interfaces) │  │   (State)    │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│                    INFRASTRUCTURE LAYER                      │
│            Nginx (Proxy) → Backend Flask API                 │
└─────────────────────────────────────────────────────────────┘
```

---

## 🎯 Padrões de Design

### 1. **Feature-Based Architecture**

Organização por domínio de negócio ao invés de tipo técnico:

```
features/
├── auth/           # Tudo relacionado a autenticação
├── dashboard/      # Tudo relacionado ao dashboard
├── settings/       # Tudo relacionado a configurações
└── finances/       # Tudo relacionado a finanças
```

**Vantagens:**
- Alta coesão
- Baixo acoplamento
- Escalabilidade
- Fácil manutenção

### 2. **Standalone Components (Angular 18+)**

Sem NgModules, usando importações diretas:

```typescript
@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [CommonModule, FormsModule, LucideAngularModule],
  // ...
})
export class SettingsComponent {}
```

**Vantagens:**
- Menos boilerplate
- Tree-shaking automático
- Lazy loading simplificado
- Melhor developer experience

### 3. **Signals para Estado Reativo**

Gerenciamento de estado moderno sem RxJS complexo:

```typescript
export class SettingsService {
  private _settings = signal<UserSettings | null>(null);

  // Computed Signal
  public apiKeys = computed(() => this._settings()?.apiKeys || []);

  // Update state
  updateSettings(data: UserSettings) {
    this._settings.set(data);
  }
}
```

**Vantagens:**
- Fine-grained reactivity
- Performance superior
- Código mais limpo
- Menos memory leaks

### 4. **Dependency Injection**

Services injetados com `inject()` function:

```typescript
export class SettingsComponent {
  private settingsService = inject(SettingsService);
  private router = inject(Router);
}
```

### 5. **Smart vs Presentational Components**

- **Smart Components**: Lógica de negócio, services, state management
- **Presentational Components**: Apenas UI, recebe dados via `@Input()`, emite eventos via `@Output()`

---

## 🔐 Segurança

### Authentication Flow

```
┌──────────┐    1. Login    ┌──────────┐
│  Client  │ ─────────────> │  Backend │
│ (Angular)│                 │  (Flask) │
└──────────┘                 └──────────┘
     │                            │
     │    2. Token (JWT)          │
     │ <─────────────────────────┘
     │
     │  3. Store token in localStorage
     │     (key: meusecretario_token)
     │
     │  4. AuthGuard checks token
     │     on route navigation
     │
     │  5. Interceptor adds token
     │     to HTTP headers
     │
     ▼
┌──────────┐
│Protected │
│  Routes  │
└──────────┘
```

### Guards

**authGuard**: Protege rotas privadas
```typescript
export const authGuard: CanActivateFn = (route, state) => {
  const token = localStorage.getItem('meusecretario_token');
  if (!token) {
    router.navigate(['/auth/login']);
    return false;
  }
  return true;
};
```

**publicGuard**: Impede acesso a rotas de auth quando autenticado
```typescript
export const publicGuard: CanActivateFn = () => {
  const token = localStorage.getItem('meusecretario_token');
  if (token) {
    router.navigate(['/dashboard']);
    return false;
  }
  return true;
};
```

---

## 🚀 Performance

### Lazy Loading

Todas as features são lazy loaded:

```typescript
{
  path: 'settings',
  loadComponent: () =>
    import('./features/settings/settings.component')
      .then(m => m.SettingsComponent)
}
```

**Benefícios:**
- Bundle inicial menor
- Carregamento sob demanda
- Melhor Time to Interactive (TTI)

### Code Splitting

Angular automaticamente cria chunks separados para cada feature lazy loaded.

### Change Detection com Signals

Signals fazem change detection granular (apenas o que mudou):

```typescript
// Sem Signals: Angular verifica toda a árvore
this.items.push(newItem); // 😔

// Com Signals: Angular sabe exatamente o que mudou
this.items.update(current => [...current, newItem]); // ✅
```

---

## 🎨 UI/UX

### Design System

**Tailwind CSS + daisyUI**:
- Utility-first CSS
- Componentes pré-construídos
- Dark mode ready
- Responsivo por padrão

### Componentes Base

```scss
// src/styles.scss
@layer components {
  .btn-primary {
    @apply bg-primary hover:bg-primary/90 text-white px-4 py-2 rounded-lg;
  }

  .card-base {
    @apply bg-white rounded-xl shadow-sm border border-gray-100 p-6;
  }
}
```

### Responsividade

Mobile-first com breakpoints:
- **sm**: 640px
- **md**: 768px
- **lg**: 1024px
- **xl**: 1280px
- **2xl**: 1536px

```html
<!-- Sidebar colapsável em mobile -->
<aside [class.w-64]="isOpen" [class.w-20]="!isOpen"
       class="hidden lg:block">
  <!-- Content -->
</aside>
```

---

## 📦 Build & Deploy

### Build Pipeline

```
Source Code
    ↓
TypeScript Compilation (AOT)
    ↓
Tree Shaking (Unused code removal)
    ↓
Minification
    ↓
Bundle Optimization
    ↓
Output Hashing (Cache busting)
    ↓
dist/meu-secretario-front/browser/
```

### Docker Multi-stage Build

```dockerfile
# Stage 1: Build
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci --legacy-peer-deps
COPY . .
RUN npm run build -- --configuration production

# Stage 2: Serve
FROM nginx:alpine
COPY --from=builder /app/dist/meu-secretario-front/browser /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

**Tamanho final da imagem**: ~50MB

---

## 🌐 API Integration

### HTTP Client Configuration

```typescript
// app.config.ts
provideHttpClient(
  withFetch(),
  withInterceptors([authInterceptor, errorInterceptor])
)
```

### Environment-based URLs

```typescript
// Development
apiUrl: 'http://localhost:5000'

// Production
apiUrl: '' // Proxy via Nginx
```

### Nginx Proxy Reverso

```nginx
location /api/ {
    proxy_pass http://backend:5000/;
    proxy_set_header X-Real-IP $remote_addr;
    # ...
}
```

**Vantagens:**
- Evita CORS
- URL única para frontend e backend
- Simplifica configuração

---

## 🧪 Testing Strategy

### Unit Tests
- Componentes isolados
- Services com mocks
- Guards e Interceptors

### Integration Tests
- Fluxos completos
- Interação entre componentes

### E2E Tests
- User journeys críticos
- Testes de regressão

---

## 📊 State Management

### Signals como Estado Global

```typescript
// SettingsService (Singleton)
export class SettingsService {
  // Private writable signal
  private _settings = signal<UserSettings | null>(null);

  // Public readonly signal
  public settings = this._settings.asReadonly();

  // Computed signals
  public apiKeys = computed(() => this._settings()?.apiKeys || []);
  public hasOwnKeys = computed(() =>
    this.apiKeys().some(k => k.useOwnKey)
  );

  // Methods to update state
  updateSettings(data: UserSettings) {
    this._settings.set(data);
  }
}
```

### Uso em Componentes

```typescript
export class SettingsComponent {
  settingsService = inject(SettingsService);

  // Reativo automaticamente
  apiKeys = this.settingsService.apiKeys();
}
```

---

## 🔄 CI/CD

### GitHub Actions Workflow (Exemplo)

```yaml
name: Build & Deploy Frontend

on:
  push:
    branches: [main]

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '20'
      - run: npm ci --legacy-peer-deps
      - run: npm run build -- --configuration production
      - name: Build Docker Image
        run: docker build -t meusecretario-frontend .
      - name: Push to Registry
        run: docker push meusecretario-frontend
```

---

## 📚 Próximos Passos

### Features Pendentes

1. **Dashboard Component**: KPIs, gráficos, alertas
2. **Finances Module**: Extrato, contas, transações
3. **Auth Components**: Login, Registro (wizard)
4. **Subscription Component**: Planos, cotas
5. **Interceptors**: Auth, Error handling
6. **Tests**: Unit, Integration, E2E

### Melhorias Futuras

- PWA (Progressive Web App)
- Offline-first com Service Workers
- Server-Side Rendering (SSR)
- Internacionalização (i18n)

---

## 🤝 Convenções de Código

### Naming

- **Componentes**: `feature.component.ts`
- **Services**: `feature.service.ts`
- **Guards**: `feature.guard.ts`
- **Models**: `feature.model.ts`
- **Classes**: PascalCase
- **Functions**: camelCase
- **Constants**: UPPER_SNAKE_CASE

### Comentários

```typescript
/**
 * JSDoc para classes e métodos públicos
 */
export class MyService {
  // Comentários inline para lógica complexa
  complexMethod() {
    // Explicação do porquê
  }
}
```

---

**Mantido por**: Equipe Meu Secretário
**Última atualização**: Dezembro 2024
