# Design System — ENEM MASTER

Versão: 1.0  
Status: Em desenvolvimento  
Produto: ENEM MASTER  
Categoria: Plataforma de estudo gamificada para ENEM

---

## 1. Visão Geral

O Design System do ENEM MASTER define diretrizes visuais e de interação para garantir uma experiência consistente, motivadora e eficiente na plataforma. Inspirado na gamificação e no foco educacional, o sistema prioriza usabilidade, acessibilidade e engajamento para estudantes de 15 a 25 anos.

---

## 2. Princípios de Design

- **Simplicidade**: Interfaces limpas e intuitivas para foco no estudo.
- **Gamificação**: Elementos visuais que incentivam progresso (XP, níveis, streaks).
- **Acessibilidade**: Contraste adequado, fontes legíveis e suporte a leitores de tela.
- **Responsividade**: Adaptação para mobile e desktop.
- **Consistência**: Uso padronizado de cores, tipografia e componentes.

---

## 3. Paleta de Cores

### Cores Primárias
- **Azul ENEM** (#0056B3): Usado para botões de ação principal, links e elementos de navegação. Representa confiança e foco.
- **Verde Sucesso** (#28A745): Para acertos, confirmações e progresso positivo.
- **Vermelho Erro** (#DC3545): Para erros, alertas e correções.

### Cores Secundárias
- **Amarelo Destaque** (#FFC107): Para destaques gamificados, como XP e conquistas.
- **Cinza Neutro** (#6C757D): Para textos secundários e fundos neutros.
- **Branco** (#FFFFFF): Fundo principal para clareza.
- **Preto** (#000000): Textos primários e ícones.

### Tons Gamificados
- **Gradiente XP** (#FFD700 to #FFA500): Para barras de progresso e níveis.

---

## 4. Tipografia

- **Fonte Principal**: Roboto (sans-serif), para legibilidade em telas.
- **Tamanhos**:
  - Título Principal (H1): 32px, bold.
  - Subtítulo (H2): 24px, semibold.
  - Corpo (Body): 16px, regular.
  - Pequeno (Small): 14px, regular.
- **Pesos**: Regular (400), Semibold (600), Bold (700).
- **Linhas**: Altura de linha 1.5 para corpo de texto.

---

## 5. Componentes Principais

### Botões
- **Primário**: Fundo azul ENEM, texto branco, bordas arredondadas (8px radius).
- **Secundário**: Borda azul ENEM, fundo branco, texto azul.
- **Desabilitado**: Cinza neutro, opacidade 50%.

### Cards
- **Card de Questão**: Fundo branco, sombra leve, borda arredondada (12px radius). Inclui título, opções e botão de resposta.
- **Card de Análise**: Fundo com gradiente sutil, ícones para matérias (ex: ícone de matemática em azul).

### Barras de Progresso
- **XP/Streak**: Barra horizontal com gradiente amarelo, preenchimento animado.

### Ícones
- Biblioteca: Material Icons. Ex: ícone de troféu para conquistas, ícone de fogo para streak.

---

## 6. Espaçamento e Layout

- **Grid**: Baseado em 8px (ex: margens 16px, paddings 24px).
- **Breakpoints Responsivos**:
  - Mobile: < 768px
  - Tablet: 768px - 1024px
  - Desktop: > 1024px
- **Layout Principal**: Header com navegação, corpo central para conteúdo (quizzes/simulados), footer com gamificação.

---

## 7. Interações e Animações

- **Transições**: Suaves (0.3s ease) para hover e cliques.
- **Feedback**: Vibração leve em mobile para acertos/erro; notificações toast para conquistas.
- **Gamificação Visual**: Animações de confete para níveis desbloqueados.

---

## 8. Acessibilidade

- Contraste mínimo 4.5:1 para texto.
- Suporte a navegação por teclado.
- Textos alternativos para imagens e ícones.

---

## 9. Implementação

- **Tecnologias**: CSS custom properties para variáveis de cor/tipografia.
- **Ferramentas**: Figma para protótipos, seguindo este design system.
- **Atualizações**: Revisões trimestrais com base em feedback de usuários.

---

Este design system será atualizado conforme o desenvolvimento do produto, alinhado ao roadmap do PRD.