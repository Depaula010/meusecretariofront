# 💼 Meu Secretário - Frontend

> Aplicação web (SPA) do SaaS "Meu Secretário" - Plataforma de gestão financeira e assistente pessoal inteligente.

[![Angular](https://img.shields.io/badge/Angular-18+-DD0031?logo=angular)](https://angular.io/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0+-3178C6?logo=typescript)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.4+-38B2AC?logo=tailwind-css)](https://tailwindcss.com/)
[![Docker](https://img.shields.io/badge/Docker-Ready-2496ED?logo=docker)](https://www.docker.com/)

## 📋 Índice

- [Visão Geral](#-visão-geral)
- [Stack Tecnológica](#-stack-tecnológica)
- [Arquitetura do Projeto](#-arquitetura-do-projeto)
- [Pré-requisitos](#-pré-requisitos)
- [Instalação](#-instalação)
- [Desenvolvimento](#-desenvolvimento)
- [Build e Deploy](#-build-e-deploy)
- [Docker](#-docker)
- [Estrutura de Pastas](#-estrutura-de-pastas)

---

## 🎯 Visão Geral

O **Meu Secretário** é uma plataforma SaaS que combina gestão financeira inteligente com assistente pessoal baseado em IA. O frontend é uma Single Page Application (SPA) construída com Angular 18+, utilizando as mais modernas práticas de desenvolvimento e arquitetura escalável.

### Principais Funcionalidades

- 📊 **Dashboard Financeiro**: Visualização em tempo real de saldo, receitas e despesas
- 💰 **Gestão de Finanças**: Controle completo de transações e contas bancárias
- 🔑 **BYOK (Bring Your Own Key)**: Configure suas próprias API Keys (Gemini, Weather, OpenRoute)
- 🔔 **Notificações Inteligentes**: Alertas financeiros e resumos diários personalizados
- 📍 **Integração de Rotas**: Planejamento de deslocamentos com endereços favoritos
- 💳 **Gestão de Assinatura**: Controle de planos e consumo de recursos

---

## 🛠 Stack Tecnológica

### Core
- **Framework**: Angular 18.2+ (Standalone Components, Signals)
- **Linguagem**: TypeScript 5.0+
- **Gerenciamento de Estado**: Angular Signals (reatividade nativa)
- **Roteamento**: Angular Router com Lazy Loading

### Estilização
- **CSS Framework**: Tailwind CSS 3.4+
- **Componentes UI**: daisyUI
- **Tipografia**: @tailwindcss/typography
- **Ícones**: Lucide Angular

### Gráficos
- **Charts**: Chart.js

### Infraestrutura
- **Containerização**: Docker (Multi-stage build)
- **Servidor Web**: Nginx Alpine
- **CI/CD**: Pronto para GitHub Actions

---

## 🏗 Arquitetura do Projeto

### Padrões Arquiteturais

- **Feature-Based Architecture**: Organização por domínio de negócio
- **Standalone Components**: Sem NgModules (Angular 18+)
- **Signals**: Reatividade moderna e performática
- **Lazy Loading**: Carregamento sob demanda de features
- **Guards**: Proteção de rotas com autenticação
- **Services**: Lógica de negócio centralizada

---

## ✅ Pré-requisitos

- **Node.js**: 20.x ou superior
- **npm**: 10.x ou superior
- **Docker**: 20.x ou superior (opcional)
- **Git**: Para controle de versão

---

## 📦 Instalação

```bash
# Clone o repositório
git clone <repository-url>
cd meusecretariofront

# Instale as dependências
npm install --legacy-peer-deps
```

---

## 🚀 Desenvolvimento

```bash
# Servidor de desenvolvimento
npm start
# Acesse: http://localhost:4200

# Build de desenvolvimento
npm run build

# Testes
npm test
```

---

## 📦 Build e Deploy

```bash
# Build de produção
npm run build -- --configuration production

# Os arquivos otimizados estarão em dist/meu-secretario-front/browser/
```

---

## 🐳 Docker

```bash
# Build da imagem
docker build -t meusecretario-frontend:latest .

# Executar container
docker run -d -p 4200:80 meusecretario-frontend:latest

# Com Docker Compose
docker-compose up -d
```

### Multi-stage Build

O Dockerfile utiliza:
1. **Stage 1**: Node.js 20 Alpine → Compila a aplicação
2. **Stage 2**: Nginx Alpine → Serve os arquivos (~50MB final)

---

## 📁 Estrutura de Pastas

```
src/app/
├── core/               # Singleton services, guards, interceptors
├── features/           # Módulos de funcionalidades (lazy loaded)
│   ├── auth/          # Login e Registro
│   ├── dashboard/     # Dashboard principal
│   ├── finances/      # Gestão financeira
│   ├── settings/      # Configurações
│   └── subscription/  # Assinatura
├── layouts/            # Layouts (Main, Auth)
├── shared/             # Componentes compartilhados
└── environments/       # Configurações de ambiente
```

---

## ⚙️ Configuração de Environments

### Development
```typescript
apiUrl: 'http://localhost:5000'
```

### Production
```typescript
apiUrl: '' // Proxy reverso via Nginx
```

O Nginx faz proxy reverso para `/api` automaticamente.

---

## 🎨 Recursos Implementados

### ✅ Layout Responsivo
- Sidebar colapsável
- Header com notificações
- Overlay mobile

### ✅ Tela de Configurações (BYOK)
- API Keys configuráveis (Gemini, Weather, OpenRoute)
- Toggle "Usar minha chave"
- Validação de chaves
- Notificações personalizadas

### ✅ Signals para Estado
- SettingsService com Signals
- Computed values
- Performance otimizada

### ✅ Guards e Lazy Loading
- authGuard para rotas privadas
- publicGuard para rotas de auth
- Lazy loading de todas as features

---

## 🔒 Segurança

- Headers HTTP (XSS, Frame-Options, etc.)
- Container não-root
- Imagem Alpine minimalista
- Healthcheck configurado

---

## 📚 Scripts NPM

```json
{
  "start": "ng serve",
  "build": "ng build",
  "test": "ng test",
  "lint": "ng lint"
}
```

---

## 📄 Licença

Proprietário - Meu Secretário Team

---

Desenvolvido com ❤️ usando Angular 18+
