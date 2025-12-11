# ============================================
# Stage 1: Build da aplicação Angular
# ============================================
FROM node:20-alpine AS builder

# Metadata
LABEL maintainer="Meu Secretário Team"
LABEL description="Frontend Angular 18 do SaaS Meu Secretário"

# Configurar diretório de trabalho
WORKDIR /app

# Copiar arquivos de dependências
COPY package*.json ./

# Instalar dependências com cache otimizado
RUN npm ci --legacy-peer-deps --prefer-offline --no-audit

# Copiar código fonte
COPY . .

# Build de produção com otimizações
# - Habilitado AOT (Ahead-of-Time) compilation
# - Source maps desabilitados
# - Otimização de build
RUN npm run build -- --configuration production

# ============================================
# Stage 2: Servidor Nginx de produção
# ============================================
FROM nginx:alpine

# Metadata
LABEL maintainer="Meu Secretário Team"
LABEL description="Servidor Nginx para SPA Angular"

# Remover configuração padrão do Nginx
RUN rm /etc/nginx/conf.d/default.conf

# Copiar configuração customizada do Nginx
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copiar arquivos buildados do stage anterior
COPY --from=builder /app/dist/meu-secretario-front/browser /usr/share/nginx/html

# Criar usuário não-root para segurança
RUN addgroup -g 1001 -S nginx-app && \
    adduser -S nginx-app -u 1001 && \
    chown -R nginx-app:nginx-app /usr/share/nginx/html && \
    chown -R nginx-app:nginx-app /var/cache/nginx && \
    touch /var/run/nginx.pid && \
    chown -R nginx-app:nginx-app /var/run/nginx.pid

# Expor porta 80
EXPOSE 80

# Health check para Docker Compose
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget --quiet --tries=1 --spider http://localhost:80 || exit 1

# Usar usuário não-root
USER nginx-app

# Comando para iniciar o Nginx
CMD ["nginx", "-g", "daemon off;"]
