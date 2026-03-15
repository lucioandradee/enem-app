# ENEM MASTER — Agents

Este documento define os agentes responsáveis pela lógica do sistema.

---

# Quiz Agent

Responsável pela seleção e execução das questões.

## Responsabilidades

- Selecionar perguntas
- Controlar dificuldade
- Validar respostas
- Calcular pontuação
- Enviar feedback ao usuário

## Inputs

- user_id
- subject
- difficulty
- previous_answers

## Outputs

- question
- options
- correct_answer
- explanation
- xp_reward

## Lógica

if accuracy > 80%:
increase difficulty

if accuracy < 50%:
decrease difficulty

---

# Progress Agent

Responsável pela evolução do usuário.

## Responsabilidades

- Atualizar XP
- Atualizar nível
- Controlar streak
- Atualizar progresso por área

## Inputs

- quiz_results
- time_spent
- correct_answers

## Outputs

- xp_gain
- new_level
- updated_progress

---

# Achievement Agent

Responsável pelo sistema de conquistas.

## Responsabilidades

- Verificar conquistas desbloqueadas
- Registrar badge
- Enviar notificação

## Exemplos de conquistas

- first_quiz
- 10_correct_answers
- 7_day_streak
- 100_questions_completed
- top_10_ranking

## Processo

check_conditions()

unlock_badge()

notify_user()

---

# Ranking Agent

Responsável pelo leaderboard.

## Responsabilidades

- Calcular ranking
- Atualizar posição
- Comparar pontuação entre usuários

## Inputs

- user_score
- global_scores

## Outputs

- ranking_position
- points_gap
- leaderboard_list

---

# Notification Agent

Responsável por notificações do sistema.

## Tipos

- daily_reminder
- ranking_update
- new_achievement
- streak_alert
- study_recommendation

## Outputs

- notification_title
- notification_body
- notification_action

---

# Support Agent

Assistente da central de ajuda.

## Responsabilidades

- Responder perguntas
- Buscar FAQ
- Criar ticket de suporte

## Inputs

- user_question
- support_category

## Outputs

- faq_answer
- help_article
- support_ticket