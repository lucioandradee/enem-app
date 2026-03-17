```markdown
# Plano de Implementação — ENEM MASTER

Versão: 1.0  
Status: Em desenvolvimento  
Produto: ENEM MASTER  
Categoria: Plataforma de estudo gamificada para ENEM

---

## 1. Visão Geral

Este documento organiza o plano de implementação em fases e tarefas, considerando o que já foi construído (presente/passado) e o que ainda precisa ser feito (futuro), alinhado ao PRD, design-system.md, agents.md e security.md.

---

## 2. Estado Atual (Presente)

### 2.1 Documentação existente
- PRD (docs/prd.md): visão do produto, funcionalidades, gamificação, roadmap.
- Design System (docs/design-system.md): guia de aparência e componentes.
- Agentes (docs/agents.md): definição dos agentes de IA previstos.
- Segurança (docs/security.md): políticas e práticas.

### 2.2 Estrutura inicial do projeto
- Pasta `docs/` criada com documentos básicos.
- Suporte ao Supabase (planejado no PRD/agents).

---

## 3. Tarefas Concluídas (Passado)

- Definição do produto, público e proposta de valor (PRD).
- Criação de documentos base:
  - design-system.md
  - agents.md
  - security.md
- Estruturação inicial de roadmap (PRD §13).

---

## 4. Plano de Implementação (Futuro)

### 4.1 Fase 1 — MVP (prioridade mais alta)

Tarefas principais:
- [ ] Setup básico do projeto (frontend + backend Supabase).
- [ ] Implementar cadastro/login com Supabase Auth.
- [ ] Criar modelo de dados no PostgreSQL (Users, Questions, Answers, Simulations, Progress, Achievements, Ranking).
- [ ] Implementar quiz básico:
  - exibir questões múltipla escolha;
  - enviar respostas e corrigir;
  - armazenar resultados.
- [ ] Implementar progresso básico (XP, históricos).
- [ ] Integrar design-system (cores, tipografia, botões, cards).
- [ ] Garantir HTTPS, CSP e segurança mínima (security.md).

### 4.2 Fase 2 — Gamificação

Tarefas:
- [ ] Sistema de XP e Levels
- [ ] Streak diário + tracker de dias
- [ ] Conquistas básicas
- [ ] Ranking entre usuários
- [ ] Notificações/feedback visuais (toasts/animations)

### 4.3 Fase 3 — Inteligência (Agentes)

Tarefas:
- [ ] Agente de Análise de Desempenho:
  - cálculo de percentuais por matéria;
  - estimativa de nota ENEM (TRI simplificado).
- [ ] Agente de Recomendação:
  - gerar sugestões de estudo;
  - priorizar temas de alto impacto.
- [ ] Agente de Variação de Questões:
  - query dinâmica para evitar repetição.
- [ ] Integrar agentes com backend (Supabase Functions / edge).

### 4.4 Fase 4 — Escala e Expansão

Tarefas:
- [x] Simulados completos com tempo e estrutura similar ao ENEM.
- [x] Agente Tutor (IA conversacional/explicações).
- [x] Plano de estudo personalizado.
- [x] Mobile (PWA ou app dedicado).
- [x] Monitoramento e métricas (DAU, retenção, uso diário).
- [x] Auditoria de segurança e conformidade (LGPD, ISO).

---

## 5. Checklist Técnica (Curto Prazo)

- [ ] Criar estrutura de pastas `/src`, `/api`, `/components`, `/styles`.
- [ ] Configurar ESLint/Prettier.
- [ ] Definir variáveis de ambiente para Supabase.
- [ ] Criar scripts de migração de banco.
- [ ] Documentar workflow de deploy (Netlify/Vercel/Supabase).

---

## 6. Como Usar

1. Revisar PRD/Design/System/Agents/Security.
2. Priorizar Fase 1: colocar quiz e login funcionando.
3. Avançar para gamificação (fase 2) e depois IA (fase 3).
4. Atualizar este task-plan conforme progresso.

---

Este plano será atualizado conforme o desenvolvimento avançar e novas necessidades surgirem.
```