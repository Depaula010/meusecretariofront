# 🚀 Guia de Setup - Meu Secretário Frontend

Este guia vai te ajudar a configurar e rodar o projeto do zero em poucos minutos.

---

## 📋 Checklist Rápido

- [ ] Node.js 20+ instalado
- [ ] npm 10+ instalado
- [ ] Git configurado
- [ ] Docker instalado (opcional)
- [ ] Editor de código (recomendado: VS Code)

---

## ⚡ Setup Rápido (5 minutos)

### 1. Instalar Dependências

```bash
npm install --legacy-peer-deps
```

> **Por que `--legacy-peer-deps`?**
> Algumas bibliotecas ainda não estão totalmente compatíveis com Angular 18. Esta flag resolve conflitos temporários de peer dependencies.

### 2. Verificar Instalação

```bash
npm run build
```

Se o build passar sem erros, está tudo OK! ✅

### 3. Rodar Servidor de Desenvolvimento

```bash
npm start
```

Acesse: **http://localhost:4200**

---

## 🔧 Configuração Detalhada

### 1. Clone e Dependências

```bash
# Clone o repositório
git clone <repository-url>
cd meusecretariofront

# Instale as dependências
npm install --legacy-peer-deps

# Opcional: Atualizar Angular CLI globalmente
npm install -g @angular/cli@18
```

### 2. Configurar Environments

#### Development (Local)

Edite: `src/environments/environment.ts`

```typescript
export const environment = {
  production: false,
  apiUrl: 'http://localhost:5000', // URL do backend local
  apiPrefix: '/api',
  // ...
};
```

#### Production

Edite: `src/environments/environment.prod.ts`

```typescript
export const environment = {
  production: true,
  apiUrl: '', // Vazio - usará proxy do Nginx
  apiPrefix: '/api',
  // ...
};
```

### 3. Configurar Backend (Flask)

Certifique-se de que o backend está rodando:

```bash
# No diretório do backend
python app.py
# ou
docker-compose up backend
```

O backend deve estar acessível em: **http://localhost:5000**

---

## 🐳 Setup com Docker

### Opção 1: Docker Standalone

```bash
# Build da imagem
docker build -t meusecretario-frontend:latest .

# Rodar container
docker run -d \
  --name meusecretario-frontend \
  -p 4200:80 \
  meusecretario-frontend:latest
```

Acesse: **http://localhost:4200**

### Opção 2: Docker Compose (Frontend + Backend)

Crie um `docker-compose.yml` na raiz:

```yaml
version: '3.8'

services:
  frontend:
    build: ./frontend
    ports:
      - "4200:80"
    depends_on:
      - backend
    networks:
      - app-network

  backend:
    build: ./backend
    ports:
      - "5000:5000"
    environment:
      - DATABASE_URL=postgresql://user:pass@db:5432/meusecretario
    networks:
      - app-network

networks:
  app-network:
    driver: bridge
```

Execute:

```bash
docker-compose up -d
```

---

## 🛠 Scripts Úteis

### Desenvolvimento

```bash
# Servidor de desenvolvimento
npm start
# ou
ng serve

# Servidor com porta customizada
ng serve --port 4201

# Servidor com auto-abrir navegador
ng serve --open
```

### Build

```bash
# Build de desenvolvimento
npm run build

# Build de produção
npm run build -- --configuration production

# Build com análise de bundle
npm run build -- --stats-json
npx webpack-bundle-analyzer dist/meu-secretario-front/browser/stats.json
```

### Testes

```bash
# Testes unitários
npm test

# Testes com coverage
npm test -- --code-coverage

# Testes em modo watch
npm test -- --watch
```

### Linting

```bash
# Verificar código
npm run lint

# Corrigir automaticamente
npm run lint -- --fix
```

---

## 🔍 Troubleshooting

### Problema: Erro de peer dependencies

**Solução:**
```bash
npm install --legacy-peer-deps --force
```

### Problema: Porta 4200 já está em uso

**Solução:**
```bash
# Usar porta diferente
ng serve --port 4201

# Ou matar processo na porta 4200 (Windows)
netstat -ano | findstr :4200
taskkill /PID <PID> /F

# Linux/Mac
lsof -ti:4200 | xargs kill
```

### Problema: Tailwind CSS não funciona

**Solução:**
```bash
# Rebuild com cache limpo
rm -rf node_modules .angular dist
npm install --legacy-peer-deps
npm start
```

### Problema: Chart.js não renderiza

**Solução:**
Certifique-se de que o canvas está no DOM antes de inicializar:

```typescript
ngAfterViewInit() {
  setTimeout(() => {
    this.initChart();
  }, 100);
}
```

---

## 🎨 Setup do VS Code (Recomendado)

### Extensões Essenciais

```json
{
  "recommendations": [
    "angular.ng-template",
    "johnpapa.angular2",
    "bradlc.vscode-tailwindcss",
    "dbaeumer.vscode-eslint",
    "esbenp.prettier-vscode"
  ]
}
```

### Settings do VS Code

Crie `.vscode/settings.json`:

```json
{
  "editor.formatOnSave": true,
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "tailwindCSS.experimental.classRegex": [
    ["class:\\s*['\"]([^'\"]*)['\"]"]
  ]
}
```

---

## 📁 Estrutura do Projeto Após Setup

```
meusecretariofront/
├── node_modules/           # Dependências (gerado)
├── src/
│   ├── app/
│   │   ├── core/          # Guards, Services, Models
│   │   ├── features/      # Componentes de features
│   │   ├── layouts/       # Layouts
│   │   └── shared/        # Componentes compartilhados
│   ├── environments/      # Configs de ambiente
│   └── styles.scss        # Estilos globais
├── .angular/              # Cache do Angular (gerado)
├── dist/                  # Build output (gerado)
├── Dockerfile             # Docker config
├── nginx.conf             # Nginx config
└── package.json           # Dependências NPM
```

---

## 🚦 Próximos Passos

Após o setup:

1. ✅ Projeto rodando localmente
2. 📖 Ler [ARCHITECTURE.md](./ARCHITECTURE.md) para entender a arquitetura
3. 🎨 Explorar componente de exemplo: `src/app/features/settings/`
4. 🔨 Começar a desenvolver features pendentes:
   - Login/Register
   - Dashboard completo
   - Módulo de Finanças
   - Subscription

---

## 🆘 Precisa de Ajuda?

- **Documentação Angular**: https://angular.dev
- **Tailwind CSS**: https://tailwindcss.com/docs
- **Chart.js**: https://www.chartjs.org/docs/latest/
- **Lucide Icons**: https://lucide.dev

---

## 📝 Checklist de Desenvolvimento

Antes de fazer commit:

- [ ] Código lintado (`npm run lint`)
- [ ] Testes passando (`npm test`)
- [ ] Build de produção funciona (`npm run build`)
- [ ] Componentes documentados com JSDoc
- [ ] Código revisado

---

**Happy Coding! 🚀**

Mantido por: Equipe Meu Secretário
