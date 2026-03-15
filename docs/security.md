# ENEM MASTER — Security

Este documento define as regras de segurança da plataforma.

---

# Authentication

Métodos de autenticação suportados:

- email + password
- Google login
- Apple login

## Regras

- JWT tokens
- refresh tokens
- token expiration

---

# Password Security

Todas as senhas devem ser protegidas com:

- bcrypt hashing
- minimum 8 characters
- password complexity rules

---

# Data Protection

Dados protegidos:

- email do usuário
- progresso de estudo
- ranking e pontuação

Proteções aplicadas:

- HTTPS obrigatório
- criptografia de dados sensíveis
- validação de entrada

---

# Anti-Cheat System

Sistema para evitar trapaça no quiz.

Medidas:

- perguntas randomizadas
- limite de tempo por questão
- validação server-side
- token anti-replay

---

# Abuse Protection

Proteção contra uso malicioso.

Proteções:

- rate limiting
- bloqueio de IP suspeito
- detecção de bots
- validação de pontuação

---

# API Security

Todas as rotas devem seguir:

- autenticação obrigatória
- validação de request
- proteção contra injection
- logging de acessos

---

# Data Privacy

O sistema deve seguir boas práticas de privacidade.

- coleta mínima de dados
- transparência com o usuário
- possibilidade de exclusão de conta