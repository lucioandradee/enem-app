```markdown
# Segurança — ENEM MASTER

Versão: 1.0  
Status: Em desenvolvimento  
Produto: ENEM MASTER  
Categoria: Plataforma de estudo gamificada para ENEM

---

## 1. Visão Geral

A segurança do ENEM MASTER é prioridade para proteger dados de usuários, garantir integridade da plataforma e cumprir regulamentações como a LGPD (Lei Geral de Proteção de Dados) no Brasil. Com base no PRD, agents.md e design-system.md, este documento define políticas, práticas e medidas para mitigar riscos em frontend (HTML/CSS/JS), backend (Supabase) e agentes de IA.

---

## 2. Princípios de Segurança

- **Privacidade por Design**: Coleta mínima de dados, com consentimento explícito.
- **Confidencialidade**: Proteção de informações pessoais e desempenho dos usuários.
- **Integridade**: Garantia de que dados não sejam alterados indevidamente.
- **Disponibilidade**: Plataforma acessível e resistente a ataques.
- **Transparência**: Comunicação clara sobre uso de dados, especialmente em agentes de IA.

---

## 3. Gestão de Dados

### 3.1 Coleta e Armazenamento
- **Dados Coletados**: Nome, e-mail, histórico de questões, desempenho em simulados, XP e conquistas (conforme PRD e agents.md).
- **Armazenamento**: PostgreSQL via Supabase, com criptografia em trânsito (TLS 1.3) e repouso (AES-256).
- **Retenção**: Dados mantidos apenas enquanto necessário; exclusão automática após inatividade de 2 anos.

### 3.2 Privacidade em Agentes de IA
- Dados para agentes (ex: histórico para recomendações) são anonimizados antes de processamento de ML.
- Não compartilhamento de dados pessoais com terceiros sem consentimento.
- Explicações transparentes sobre como agentes usam dados (conforme agents.md).

---

## 4. Autenticação e Autorização

- **Autenticação**: Via Supabase Auth, com suporte a e-mail/senha, OAuth (Google, etc.) e MFA (autenticação multifator).
- **Autorização**: Controle de acesso baseado em roles (usuário, admin); usuários acessam apenas seus dados.
- **Sessões**: Tokens JWT com expiração curta (1 hora); renovação automática segura.

---

## 5. Proteção contra Ameaças

### 5.1 Ataques Comuns
- **SQL Injection**: Prevenção via prepared statements no PostgreSQL.
- **XSS/CSRF**: Sanitização de inputs no frontend (HTML/JS); uso de bibliotecas como DOMPurify.
- **DDoS**: Proteção via Supabase Edge Functions e rate limiting.
- **Ataques a Agentes de IA**: Validação de entradas para evitar manipulação de recomendações.

### 5.2 Monitoramento
- Logs de acesso e atividades em Supabase.
- Alertas para tentativas de intrusão.
- Auditorias regulares de vulnerabilidades.

---

## 6. Segurança do Frontend

- **HTTPS Obrigatório**: Todas as conexões via SSL/TLS.
- **CSP (Content Security Policy)**: Restrição de scripts externos para prevenir XSS.
- **Acessibilidade Segura**: Design-system.md garante que elementos não exponham vulnerabilidades (ex: inputs seguros).

---

## 7. Segurança do Backend e Agentes

- **Supabase Security**: Row Level Security (RLS) para isolamento de dados por usuário.
- **Agentes de IA**: Execução em ambientes isolados; validação de modelos ML contra adversários.
- **APIs**: Autenticação obrigatória; limitação de rate para prevenir abuso.

---

## 8. Conformidade e Regulamentações

- **LGPD**: Consentimento para coleta de dados; direito ao esquecimento; relatórios de incidentes em 72 horas.
- **ISO 27001**: Padrões para gestão de segurança da informação.
- **Auditorias**: Revisões anuais por terceiros certificados.

---

## 9. Resposta a Incidentes

- **Plano de Resposta**: Identificação, contenção, recuperação e notificação.
- **Contato**: Equipe de segurança disponível 24/7 via suporte@enemmaster.com.
- **Treinamento**: Usuários educados sobre phishing e boas práticas via design-system.md (ex: tooltips de segurança).

---

## 10. Métricas e Monitoramento

- Taxa de incidentes: <0.1% por mês.
- Tempo médio de resposta a vulnerabilidades: <24 horas.
- Auditorias de penetração trimestrais.

---

Este documento será atualizado conforme o desenvolvimento, alinhado ao PRD, agents.md e design-system.md.
```