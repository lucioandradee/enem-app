# PRD — ENEM MASTER

Versão: 1.0  
Status: Em desenvolvimento  
Produto: ENEM MASTER  
Categoria: Plataforma de estudo gamificada para ENEM

---

# 1. Visão do Produto

ENEM MASTER é uma plataforma de preparação para o ENEM que utiliza:

- quizzes inteligentes
- simulados adaptativos
- análise de desempenho
- gamificação

O objetivo é ajudar estudantes a **maximizar sua nota no ENEM**, utilizando dados de desempenho e direcionamento de estudo baseado em padrões da prova.

O sistema busca transformar o estudo em uma experiência:

- eficiente
- personalizada
- motivadora
- orientada por dados.

---

# 2. Problema

Estudantes que se preparam para o ENEM enfrentam problemas como:

- não saber o que estudar
- não entender seus pontos fracos
- dificuldade em manter consistência
- falta de motivação ao estudar
- excesso de conteúdo sem direcionamento

Além disso, muitos estudantes não entendem como funciona a **TRI (Teoria de Resposta ao Item)** utilizada no ENEM.

Isso faz com que:

- estudem conteúdos com pouco impacto
- não priorizem questões fáceis importantes
- não tenham estratégia de prova.

---

# 3. Objetivo do Produto

Criar uma plataforma que:

- ajude estudantes a subir nota no ENEM
- identifique pontos fracos automaticamente
- recomende práticas direcionadas
- utilize gamificação para retenção
- simule comportamento da TRI

---

# 4. Público-Alvo

## Público Primário

Estudantes que:

- estão se preparando para o ENEM
- possuem entre 15 e 25 anos
- estudam pelo celular ou computador
- preferem estudo interativo

## Público Secundário

- estudantes do ensino médio
- candidatos a vestibulares similares

---

# 5. Proposta de Valor

ENEM MASTER oferece:

- estudo guiado por dados
- análise de desempenho
- recomendações inteligentes
- aprendizado gamificado
- foco nas questões que mais impactam a nota.

---

# 6. Diferencial do Produto

O diferencial principal será:

## Direcionamento Inteligente Pós-Simulado

Após cada simulado o sistema analisa:

- acertos
- erros
- dificuldade das questões
- temas das questões

E gera recomendações automáticas como:

- temas prioritários para estudo
- questões de alto impacto
- práticas direcionadas.

---

# 7. Funcionalidades Principais

## 7.1 Sistema de Quiz

Usuários podem resolver perguntas estilo ENEM.

Características:

- múltipla escolha
- feedback imediato
- explicação da resposta
- controle de dificuldade

---

## 7.2 Sistema de Simulados

Tipos de simulados:

Simulado rápido
5 a 10 questões

Simulado focado
questões de um tema específico

Simulado completo
prova completa simulada

---

## 7.3 Análise Pós-Simulado

Após finalizar um simulado o sistema mostra:

- percentual por matéria
- temas com maior erro
- estimativa de desempenho

Exemplo:

Matemática: 60%  
Humanas: 80%  
Natureza: 40%

---

## 7.4 Recomendações Inteligentes

Com base no resultado o sistema sugere:

Praticar mais:

- Funções
- Probabilidade
- Física

Botões diretos:

Praticar 10 questões  
Praticar 5 questões rápidas

---

## 7.5 Sistema Inspirado na TRI

O sistema considera:

- dificuldade da questão
- coerência dos acertos
- padrões de erro

E prioriza exercícios que:

- aumentam mais a nota no ENEM
- reforçam conceitos básicos importantes.

---

## 7.6 Sistema de Variação de Questões

Para evitar repetição:

o sistema seleciona questões com base em:

- histórico do usuário
- dificuldade
- tema
- frequência no ENEM

---

# 8. Gamificação

Para aumentar retenção e motivação.

---

## 8.1 Sistema de XP

Usuários ganham XP ao:

- responder questões
- completar simulados
- manter streak

---

## 8.2 Sistema de Níveis

Usuários evoluem conforme acumulam XP.

Cada nível desbloqueia:

- novos desafios
- conquistas
- rankings.

---

## 8.3 Sistema de Streak

Mostra quantos dias seguidos o usuário estudou.

Exemplo:

🔥 Streak: 5 dias

Se o usuário perder um dia, o streak reinicia.

---

## 8.4 Sistema de Conquistas

Exemplos:

Primeira questão respondida  
10 acertos seguidos  
7 dias de estudo  
100 questões resolvidas

---

## 8.5 Desafios Diários

Todos os dias o sistema mostra:

Desafio do dia:

Resolver 5 questões de matemática

Recompensa:

+50 XP

---

## 8.6 Ranking

Ranking entre usuários baseado em:

- XP
- número de questões
- desempenho.

---

# 9. Fluxo Principal do Usuário

Fluxo ideal:

Usuário entra no app  
↓  
Resolve questões  
↓  
Faz um simulado  
↓  
Recebe análise de desempenho  
↓  
Recebe recomendações  
↓  
Pratica pontos fracos  
↓  
Melhora nota.

---

# 10. Arquitetura do Produto

Frontend:

HTML  
CSS  
JavaScript

Backend:

Supabase

Banco de Dados:

PostgreSQL

---

# 11. Estrutura de Dados

Principais entidades:

Users  
Questions  
Answers  
Simulations  
Progress  
Achievements  
Ranking

---

# 12. Métricas de Sucesso

KPIs principais:

Usuários ativos diários (DAU)  
Tempo médio de estudo  
Número de questões resolvidas  
Taxa de retorno semanal  
Streak médio dos usuários.

---

# 13. Roadmap

## Fase 1 — MVP

Sistema de login  
Sistema de quiz  
Correção automática  
Progresso básico

---

## Fase 2 — Gamificação

XP  
Níveis  
Streak  
Conquistas  
Ranking

---

## Fase 3 — Inteligência

Análise pós-simulado  
Recomendação automática  
Sistema inspirado na TRI

---

## Fase 4 — Escala

Simulados completos  
IA tutor  
Plano de estudo personalizado.

---

# 14. Riscos

Baixa retenção inicial  
Falta de banco grande de questões  
Complexidade da análise de desempenho.

---

# 15. Expansões Futuras

Possíveis evoluções:

Tutor com IA  
Simulador realista de nota ENEM  
Plano de estudo automático  
Aplicativo mobile  
Comunidade de estudantes.