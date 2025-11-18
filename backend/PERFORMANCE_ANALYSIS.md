# Análise de Performance: Resumos no Backend vs Frontend

## 📊 Comparação de Carga

### Situação ATUAL (Frontend calcula)

**Para resumo mensal:**
- ✅ Backend já faz agregação SQL (eficiente)
- ✅ Retorna apenas resumo (~1KB)

**Para resumo diário/semanal/anual:**
- ❌ Backend retorna 50 transações completas (~5-10KB)
- ❌ Frontend filtra e calcula no cliente
- ⚠️ Problema: usuário só vê as 50 transações mais recentes

### Proposta (Backend calcula tudo)

**Para TODOS os períodos:**
- ✅ Backend faz agregação SQL (SUM, GROUP BY)
- ✅ Retorna apenas resumo (~1KB)
- ✅ Banco usa índices automaticamente

## 🔍 Análise Detalhada

### Query SQL Atual (listTransactions)
```sql
SELECT * FROM transactions 
WHERE user_id = ? 
ORDER BY date_time DESC 
LIMIT 50 OFFSET 0
```
- **Retorna:** 50 objetos completos
- **Tamanho:** ~5-10KB JSON
- **Memória backend:** Carrega 50 entidades JPA
- **Processamento:** Serialização JSON de 50 objetos

### Query SQL Proposta (periodSummary)
```sql
SELECT SUM(amount) FROM transactions 
WHERE user_id = ? 
AND date_time BETWEEN ? AND ? 
AND type = 'INCOME'

SELECT category, SUM(...) FROM transactions 
WHERE user_id = ? 
AND date_time BETWEEN ? AND ? 
GROUP BY category
```
- **Retorna:** Apenas números agregados
- **Tamanho:** ~1KB JSON
- **Memória backend:** Apenas resultados agregados (não carrega entidades)
- **Processamento:** Banco faz trabalho pesado (é para isso que serve)

## ✅ Conclusão

**A proposta REDUZ carga no backend porque:**

1. **Menos dados transferidos:** 1KB vs 5-10KB (80-90% menos)
2. **Menos memória:** Não carrega entidades JPA, apenas resultados
3. **Banco otimizado:** PostgreSQL é especializado em agregações
4. **Índices:** Banco usa índices automaticamente em `user_id` e `date_time`

**Recomendação:** Manter resumos no backend é mais eficiente mesmo em VPS limitada.

