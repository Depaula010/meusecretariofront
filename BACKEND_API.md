# 🔌 Backend API - Endpoints Necessários

## Visão Geral

Este documento especifica os endpoints JSON que o **Backend Flask** precisa implementar para integração completa com o Frontend Angular.

**Base URL (Dev)**: `http://212.47.65.37`
**Base URL (Prod)**: Proxy via Nginx

---

## 🔐 Autenticação

Todos os endpoints (exceto `/auth/*`) exigem autenticação via JWT Bearer Token no header:

```http
Authorization: Bearer <token>
```

O token é automaticamente adicionado pelo `authInterceptor` do Angular.

---

## 📊 Dashboard Endpoints

### 1. GET `/api/dashboard/summary`

**Descrição**: Retorna resumo financeiro (KPIs) do usuário autenticado.

**Headers**:
```
Authorization: Bearer <token>
```

**Response** (200 OK):
```json
{
  "status": "success",
  "data": {
    "saldo_atual": 12450.50,
    "total_receitas": 8500.00,
    "total_despesas": 6200.00,
    "cartao_de_credito": 1850.00,
    "periodo": "Dezembro 2024"
  }
}
```

**Lógica Sugerida (Python)**:
```python
# Reutilizar finance_service existente
from app.services.finance_service import FinanceService

@dashboard_bp.route('/summary', methods=['GET'])
@jwt_required()
def get_summary():
    user_id = get_jwt_identity()
    finance = FinanceService(user_id)

    # Exemplo de cálculo
    contas = finance.get_contas_bancarias()
    saldo_atual = sum(conta.saldo for conta in contas)

    receitas = finance.get_receitas_mes_atual()
    despesas = finance.get_despesas_mes_atual()

    return jsonify({
        "status": "success",
        "data": {
            "saldo_atual": float(saldo_atual),
            "total_receitas": float(sum(r.valor for r in receitas)),
            "total_despesas": float(sum(d.valor for d in despesas)),
            "cartao_de_credito": finance.get_fatura_cartao(),
            "periodo": "Dezembro 2024"
        }
    })
```

---

### 2. GET `/api/dashboard/charts`

**Descrição**: Retorna dados para gráficos do dashboard (evolução saldo, receitas vs despesas, categorias).

**Headers**:
```
Authorization: Bearer <token>
```

**Response** (200 OK):
```json
{
  "status": "success",
  "data": {
    "evolucao_saldo": {
      "labels": ["Jul", "Ago", "Set", "Out", "Nov", "Dez"],
      "valores": [10000.00, 10500.00, 11200.00, 10800.00, 11500.00, 12450.50]
    },
    "receitas_despesas": {
      "labels": ["Jul", "Ago", "Set", "Out", "Nov", "Dez"],
      "receitas": [8000.00, 8200.00, 8500.00, 8300.00, 8700.00, 8500.00],
      "despesas": [6000.00, 6500.00, 6100.00, 6800.00, 6300.00, 6200.00]
    },
    "distribuicao_categorias": {
      "categorias": ["Alimentação", "Transporte", "Lazer", "Saúde", "Outros"],
      "valores": [2500.00, 1800.00, 1900.00, 800.00, 1200.00]
    }
  }
}
```

**Lógica Sugerida**:
```python
# Reutilizar period_query_service
from app.services.period_query_service import PeriodQueryService

@dashboard_bp.route('/charts', methods=['GET'])
@jwt_required()
def get_charts():
    user_id = get_jwt_identity()
    period_service = PeriodQueryService(user_id)

    # Últimos 6 meses
    evolucao = period_service.get_evolucao_saldo_6_meses()
    receitas_despesas = period_service.get_receitas_despesas_6_meses()
    categorias = period_service.get_distribuicao_categorias_mes_atual()

    return jsonify({
        "status": "success",
        "data": {
            "evolucao_saldo": evolucao,
            "receitas_despesas": receitas_despesas,
            "distribuicao_categorias": categorias
        }
    })
```

---

### 3. GET `/api/dashboard/recent`

**Descrição**: Retorna últimas 10 transações do usuário.

**Headers**:
```
Authorization: Bearer <token>
```

**Response** (200 OK):
```json
{
  "status": "success",
  "data": [
    {
      "id": 1,
      "descricao": "Salário",
      "valor": 5000.00,
      "tipo": "receita",
      "categoria": "Salário",
      "data": "2024-12-01",
      "conta_bancaria": "Nubank"
    },
    {
      "id": 2,
      "descricao": "Mercado",
      "valor": 450.00,
      "tipo": "despesa",
      "categoria": "Alimentação",
      "data": "2024-12-05",
      "conta_bancaria": "Bradesco"
    }
    // ... mais 8 transações
  ]
}
```

**Lógica Sugerida**:
```python
@dashboard_bp.route('/recent', methods=['GET'])
@jwt_required()
def get_recent_transactions():
    user_id = get_jwt_identity()

    # Query SQL
    query = """
        SELECT id, descricao, valor, tipo, categoria, data, conta_bancaria
        FROM transacoes
        WHERE user_id = %s
        ORDER BY data DESC
        LIMIT 10
    """

    transactions = db.execute(query, (user_id,))

    return jsonify({
        "status": "success",
        "data": [dict(t) for t in transactions]
    })
```

---

## 💰 Finances Endpoints

### 4. GET `/api/finances/transactions`

**Descrição**: Retorna todas as transações do usuário com filtros opcionais.

**Query Parameters** (opcionais):
- `tipo`: `receita` ou `despesa`
- `categoria`: Nome da categoria
- `data_inicio`: Data no formato `YYYY-MM-DD`
- `data_fim`: Data no formato `YYYY-MM-DD`
- `limit`: Número máximo de resultados (padrão: 50)
- `offset`: Paginação (padrão: 0)

**Exemplo**:
```
GET /api/finances/transactions?tipo=despesa&data_inicio=2024-11-01&data_fim=2024-11-30&limit=20
```

**Response** (200 OK):
```json
{
  "status": "success",
  "data": [
    {
      "id": 1,
      "descricao": "Conta de Luz",
      "valor": 245.00,
      "tipo": "despesa",
      "categoria": "Contas",
      "data": "2024-11-15",
      "conta_bancaria": "Nubank",
      "observacoes": "Pagamento via PIX"
    }
    // ... mais transações
  ],
  "pagination": {
    "total": 150,
    "limit": 20,
    "offset": 0,
    "has_more": true
  }
}
```

**Lógica Sugerida**:
```python
@finances_bp.route('/transactions', methods=['GET'])
@jwt_required()
def get_transactions():
    user_id = get_jwt_identity()

    # Parâmetros opcionais
    tipo = request.args.get('tipo')
    categoria = request.args.get('categoria')
    data_inicio = request.args.get('data_inicio')
    data_fim = request.args.get('data_fim')
    limit = int(request.args.get('limit', 50))
    offset = int(request.args.get('offset', 0))

    # Construir query dinâmica com filtros
    query = "SELECT * FROM transacoes WHERE user_id = %s"
    params = [user_id]

    if tipo:
        query += " AND tipo = %s"
        params.append(tipo)

    if categoria:
        query += " AND categoria = %s"
        params.append(categoria)

    if data_inicio:
        query += " AND data >= %s"
        params.append(data_inicio)

    if data_fim:
        query += " AND data <= %s"
        params.append(data_fim)

    query += " ORDER BY data DESC LIMIT %s OFFSET %s"
    params.extend([limit, offset])

    transactions = db.execute(query, params)

    # Contar total
    count_query = "SELECT COUNT(*) FROM transacoes WHERE user_id = %s"
    total = db.execute(count_query, [user_id])[0]['count']

    return jsonify({
        "status": "success",
        "data": [dict(t) for t in transactions],
        "pagination": {
            "total": total,
            "limit": limit,
            "offset": offset,
            "has_more": (offset + limit) < total
        }
    })
```

---

### 5. POST `/api/finances/transactions`

**Descrição**: Cria nova transação (receita ou despesa).

**Body**:
```json
{
  "descricao": "Freelance projeto X",
  "valor": 1500.00,
  "tipo": "receita",
  "categoria": "Trabalho",
  "data": "2024-12-10",
  "conta_bancaria_id": 1,
  "observacoes": "Projeto para cliente Y"
}
```

**Response** (201 Created):
```json
{
  "status": "success",
  "message": "Transação criada com sucesso",
  "data": {
    "id": 123,
    "descricao": "Freelance projeto X",
    "valor": 1500.00,
    "tipo": "receita",
    "categoria": "Trabalho",
    "data": "2024-12-10",
    "conta_bancaria": "Nubank",
    "observacoes": "Projeto para cliente Y"
  }
}
```

---

### 6. GET `/api/finances/accounts`

**Descrição**: Retorna todas as contas bancárias do usuário.

**Response** (200 OK):
```json
{
  "status": "success",
  "data": [
    {
      "id": 1,
      "nome": "Nubank",
      "tipo": "corrente",
      "saldo": 5000.00,
      "banco": "Nubank",
      "cor": "#8A05BE"
    },
    {
      "id": 2,
      "nome": "Bradesco Poupança",
      "tipo": "poupanca",
      "saldo": 10000.00,
      "banco": "Bradesco",
      "cor": "#CC092F"
    },
    {
      "id": 3,
      "nome": "Cartão Nubank",
      "tipo": "cartao_credito",
      "saldo": -1850.00,
      "banco": "Nubank",
      "limite": 5000.00,
      "dia_vencimento": 10,
      "dia_fechamento": 5,
      "cor": "#8A05BE"
    }
  ]
}
```

**Lógica Sugerida**:
```python
@finances_bp.route('/accounts', methods=['GET'])
@jwt_required()
def get_accounts():
    user_id = get_jwt_identity()

    query = """
        SELECT id, nome, tipo, saldo, banco, limite,
               dia_vencimento, dia_fechamento, cor
        FROM contas_bancarias
        WHERE user_id = %s
        ORDER BY tipo, nome
    """

    accounts = db.execute(query, (user_id,))

    return jsonify({
        "status": "success",
        "data": [dict(a) for a in accounts]
    })
```

---

### 7. POST `/api/finances/accounts`

**Descrição**: Cria nova conta bancária.

**Body**:
```json
{
  "nome": "Inter",
  "tipo": "corrente",
  "banco": "Banco Inter",
  "saldo": 1000.00,
  "cor": "#FF7A00"
}
```

**Response** (201 Created):
```json
{
  "status": "success",
  "message": "Conta criada com sucesso",
  "data": {
    "id": 4,
    "nome": "Inter",
    "tipo": "corrente",
    "banco": "Banco Inter",
    "saldo": 1000.00,
    "cor": "#FF7A00"
  }
}
```

---

## 🛡️ Middleware de Segurança

**Importante**: Adicionar as novas rotas ao middleware para não serem bloqueadas:

```python
# app/middleware/security.py

ALLOWED_ROUTES = [
    '/auth/login',
    '/auth/register',
    '/api/dashboard/summary',
    '/api/dashboard/charts',
    '/api/dashboard/recent',
    '/api/finances/transactions',
    '/api/finances/accounts',
    # ... outras rotas
]
```

---

## 🔍 Error Handling

Todos os endpoints devem retornar erros padronizados:

**400 Bad Request**:
```json
{
  "status": "error",
  "message": "Dados inválidos",
  "errors": {
    "valor": ["Valor deve ser maior que zero"],
    "data": ["Data inválida"]
  }
}
```

**401 Unauthorized**:
```json
{
  "status": "error",
  "message": "Token inválido ou expirado"
}
```

**404 Not Found**:
```json
{
  "status": "error",
  "message": "Recurso não encontrado"
}
```

**500 Internal Server Error**:
```json
{
  "status": "error",
  "message": "Erro interno do servidor"
}
```

---

## 📝 Notas de Implementação

### Reutilização de Código Existente

1. **finance_service.py**: Já possui métodos para cálculos financeiros
   - Adaptar para retornar dicionários em vez de texto
   - Exemplo: `get_saldo_total()` → retorna `float`

2. **period_query_service.py**: Já possui queries por período
   - Adaptar para retornar arrays de dicionários
   - Exemplo: `get_transacoes_mes()` → retorna `List[dict]`

3. **db_engine.py**: Já possui conexão com banco
   - Reutilizar queries existentes
   - Usar `cursor.fetchall()` e converter para dicts

### Exemplo de Conversão

**Antes (para WhatsApp)**:
```python
def get_extrato_mensal(self):
    transacoes = self.db.query("SELECT * FROM transacoes WHERE ...")
    texto = "📊 *Extrato Mensal*\n\n"
    for t in transacoes:
        texto += f"• {t.descricao}: R$ {t.valor:.2f}\n"
    return texto
```

**Depois (para API JSON)**:
```python
def get_extrato_mensal(self):
    transacoes = self.db.query("SELECT * FROM transacoes WHERE ...")
    return {
        "status": "success",
        "data": [
            {
                "id": t.id,
                "descricao": t.descricao,
                "valor": float(t.valor),
                "data": t.data.isoformat(),
                # ...
            }
            for t in transacoes
        ]
    }
```

---

## 🧪 Testes

Exemplo de teste com `curl`:

```bash
# Login
TOKEN=$(curl -X POST http://212.47.65.37/auth/login \
  -H "Content-Type: application/json" \
  -d '{"whatsapp":"5511999999999","password":"123456"}' \
  | jq -r '.token')

# Testar Dashboard Summary
curl -X GET http://212.47.65.37/api/dashboard/summary \
  -H "Authorization: Bearer $TOKEN" \
  | jq
```

---

**Mantido por**: Equipe Meu Secretário
**Última atualização**: Dezembro 2024
