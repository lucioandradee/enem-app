// =====================================================
// CONTEÚDO — FLASHCARDS, RESUMOS, TUTOR IA
// =====================================================

// ── Dados: Flashcards ────────────────────────────────────────────────────────
// lvl: 1=Fácil · 2=Médio · 3=Difícil
const FLASHCARDS = [
    // ── HUMANAS ────────────────────────────────────────────────────────────────
    { disc:'humanas', area:'🌍 HUMANAS', lvl:1, q:'O que é "Estado Laico"?',                                        a:'Estado que não adota religião oficial e garante a liberdade religiosa, separando as esferas pública (política) e privada (religião).' },
    { disc:'humanas', area:'🌍 HUMANAS', lvl:1, q:'O que foi a Revolução Industrial?',                               a:'Transformação econômica que substituiu o trabalho artesanal por fábricas com máquinas a vapor, iniciada na Inglaterra no séc. XVIII. Gerou o proletariado e o capitalismo industrial.' },
    { disc:'humanas', area:'🌍 HUMANAS', lvl:1, q:'O que é democracia direta?',                                      a:'Sistema em que os cidadãos participam diretamente das decisões políticas, sem representantes. Origem na Grécia Antiga (Atenas, séc. V a.C.). Hoje praticada em referendos e plebiscitos.' },
    { disc:'humanas', area:'🌍 HUMANAS', lvl:2, q:'Qual foi o principal objetivo do Plano Marshall?',                a:'Reconstruir economicamente a Europa Ocidental após a 2ª Guerra Mundial (1948-52), contendo também a expansão do comunismo soviético. Os EUA investiram ~13 bilhões de dólares.' },
    { disc:'humanas', area:'🌍 HUMANAS', lvl:2, q:'O que é imperialismo?',                                           a:'Política de expansão territorial e econômica de países industrializados sobre regiões subdesenvolvidas, especialmente na África e Ásia no séc. XIX. Motivada por matéria-prima, mercados e poder.' },
    { disc:'humanas', area:'🌍 HUMANAS', lvl:2, q:'Qual foi a principal causa da 1ª Guerra Mundial?',                a:'Assassinato do arquiduque Franz Ferdinand em 1914, somado ao sistema de alianças (Tríplice Entente x Tríplice Aliança), nacionalismo exacerbado e disputa colonial imperial.' },
    { disc:'humanas', area:'🌍 HUMANAS', lvl:2, q:'O que foi a Revolução Francesa (1789)?',                          a:'Ruptura com o Absolutismo que instituiu os ideais de Liberdade, Igualdade e Fraternidade. Fases: Monarquia Constitucional → Convenção Nacional (Terror) → Diretório → Napoleão.' },
    { disc:'humanas', area:'🌍 HUMANAS', lvl:2, q:'O que foi o Estado Novo (1937-1945) no Brasil?',                  a:'Governo ditatorial de Getúlio Vargas, com centralização do poder, censura pelo DIP, suspensão da Constituição e repressão aos opositores. Coincidiu com industrialização e trabalhismo.' },
    { disc:'humanas', area:'🌍 HUMANAS', lvl:2, q:'O que é globalização?',                                           a:'Processo de integração econômica, cultural e política entre países, impulsionado pelo avanço tecnológico, liberalização do comércio e fluxo de capitais. Intensificou-se após 1989.' },
    { disc:'humanas', area:'🌍 HUMANAS', lvl:3, q:'Quais são as principais ideias do contrato social (Rousseau)?',   a:'Os homens nascem livres e iguais; cedem parte da liberdade ao Estado em troca de proteção coletiva. A soberania emana do povo ("vontade geral"). Base filosófica para a democracia moderna.' },
    { disc:'humanas', area:'🌍 HUMANAS', lvl:3, q:'O que foram as "ondas" do feminismo?',                            a:'1ª onda (séc. XIX–XX): sufrágio. 2ª onda (anos 60-80): igualdade de direitos e sexualidade. 3ª onda (anos 90+): interseccionalidade, diversidade. 4ª onda (2010+): feminismo digital e MeToo.' },
    { disc:'humanas', area:'🌍 HUMANAS', lvl:3, q:'O que é "neoliberalismo"?',                                       a:'Corrente econômica que defende: Estado mínimo, privatizações, livre mercado, corte de gastos públicos e abertura comercial. Emergiu nos anos 1970 com Hayek/Friedman; aplicado por Thatcher e Reagan.' },

    // ── NATUREZA ───────────────────────────────────────────────────────────────
    { disc:'natureza', area:'🔬 NATUREZA', lvl:1, q:'O que é DNA?',                                                  a:'Ácido desoxirribonucleico — molécula dupla-hélice que armazena informações genéticas em sequências de bases nitrogenadas (Adenina-Timina e Citosina-Guanina).' },
    { disc:'natureza', area:'🔬 NATUREZA', lvl:1, q:'O que diferencia ácidos de bases (Arrhenius)?',                 a:'Ácidos liberam íons H⁺ em solução aquosa; bases liberam OH⁻. pH < 7 = ácido; pH = 7 = neutro; pH > 7 = básico (alkalino).' },
    { disc:'natureza', area:'🔬 NATUREZA', lvl:1, q:'O que é fotossíntese?',                                         a:'Processo pelo qual plantas e algas convertem luz solar, CO₂ e H₂O em glicose e O₂. Equação: 6CO₂ + 6H₂O + luz → C₆H₁₂O₆ + 6O₂. Ocorre nos cloroplastos.' },
    { disc:'natureza', area:'🔬 NATUREZA', lvl:2, q:'Qual é a 1ª Lei da Termodinâmica?',                             a:'A energia de um sistema isolado se conserva: ΔU = Q − W. O calor absorvido (Q) é igual à variação da energia interna mais o trabalho realizado (W). Princípio da conservação de energia.' },
    { disc:'natureza', area:'🔬 NATUREZA', lvl:2, q:'O que é seleção natural (Darwin)?',                             a:'Mecanismo evolutivo em que organismos com características mais adaptadas sobrevivem e se reproduzem mais. Junto com mutação e deriva genética, explica a diversidade da vida.' },
    { disc:'natureza', area:'🔬 NATUREZA', lvl:2, q:'O que é força elétrica (Lei de Coulomb)?',                      a:'F = kq₁q₂/d², onde k = 9×10⁹ N·m²/C². Cargas de mesmo sinal se repelem; sinais opostos se atraem. A força é proporcional ao produto das cargas e inversamente proporcional ao quadrado da distância.' },
    { disc:'natureza', area:'🔬 NATUREZA', lvl:2, q:'O que é uma reação de oxirredução?',                            a:'Reação onde ocorre transferência de elétrons: a substância que perde elétrons é oxidada (agente redutor); a que ganha elétrons é reduzida (agente oxidante). Exemplo: ferrugem do ferro.' },
    { disc:'natureza', area:'🔬 NATUREZA', lvl:2, q:'O que é ligação iônica vs. covalente?',                         a:'Iônica: transferência de elétrons entre metal e não-metal; forma cristais sólidos (ex: NaCl). Covalente: compartilhamento de elétrons entre não-metais; pode ser apolar ou polar (ex: H₂O).' },
    { disc:'natureza', area:'🔬 NATUREZA', lvl:2, q:'O que são ondas eletromagnéticas?',                             a:'Ondas que se propagam sem meio material, na velocidade da luz (3×10⁸ m/s). Espectro: rádio → micro-ondas → infravermelho → visível → UV → raios X → gama. Energia ∝ frequência.' },
    { disc:'natureza', area:'🔬 NATUREZA', lvl:3, q:'Explique as Leis de Mendel e suas exceções.',                   a:'1ª Lei: segregação — cada indivíduo porta 2 alelos que se separam nos gametas (Aa → 50%A + 50%a). 2ª Lei: segregação independente em genes não ligados. Exceções: codominância, epistase, ligação gênica.' },
    { disc:'natureza', area:'🔬 NATUREZA', lvl:3, q:'O que é radioatividade? Cite os tipos.',                        a:'Emissão espontânea de radiação por núcleos instáveis. Tipos: α (partícula He, menor penetração), β (elétron, penetração média), γ (onda EM de alta energia, maior penetração). Aplica-se em medicina e energia nuclear.' },

    // ── LINGUAGENS ─────────────────────────────────────────────────────────────
    { disc:'linguagens', area:'📝 LINGUAGENS', lvl:1, q:'O que é uma metáfora?',                                     a:'Figura de linguagem que aproxima dois conceitos por semelhança implícita, sem "como" ou "que nem". Ex: "a vida é um palco"; "ele é uma pedra" (= insensível).' },
    { disc:'linguagens', area:'📝 LINGUAGENS', lvl:1, q:'O que é metonímia?',                                        a:'Substituição de uma palavra por outra com relação real de contiguidade. Ex: "Leio Machado" (autor pela obra); "Brasil venceu" (país pelo time); "o cálice" (continente pelo conteúdo).' },
    { disc:'linguagens', area:'📝 LINGUAGENS', lvl:1, q:'O que é intertextualidade?',                                a:'Diálogo entre textos: citação, paródia, alusão ou paráfrase de um texto em outro. Frequente em charges, tirinhas e publicidade no ENEM — requer repertório cultural.' },
    { disc:'linguagens', area:'📝 LINGUAGENS', lvl:2, q:'Qual é a estrutura da redação ENEM?',                       a:'Dissertativo-argumentativa: Introdução (contextualização + tese) → Duas vezes Desenvolvimento (argumento + exemplificação) → Conclusão (proposta de intervenção com 5 elementos).' },
    { disc:'linguagens', area:'📝 LINGUAGENS', lvl:2, q:'Quais são os 5 elementos da proposta de intervenção do ENEM?', a:'1) Ação (o que fazer), 2) Agente responsável (quem executa), 3) Modo/meio (como), 4) Efeito esperado (qual o resultado), 5) Finalidade (por quê). Todos em 1-2 frases coesas.' },
    { disc:'linguagens', area:'📝 LINGUAGENS', lvl:2, q:'O que é coesão textual?',                                   a:'Encadeamento linguístico entre partes do texto por meio de pronomes, conjunções, advérbios e sinônimos. Sem coesão o texto fica fragmentado. Competência 4 da redação ENEM.' },
    { disc:'linguagens', area:'📝 LINGUAGENS', lvl:2, q:'Qual a diferença entre narrador onisciente e observador?',  a:'Onisciente: sabe os pensamentos e sentimentos dos personagens; voz em 3ª pessoa. Observador: relata apenas o que se vê externamente, sem acessar a mente dos personagens — como uma câmera.' },
    { disc:'linguagens', area:'📝 LINGUAGENS', lvl:2, q:'O que é eufemismo? Dê um exemplo.',                         a:'Figura que suaviza uma ideia desagradável ou agressiva. Ex: "ele passou para um lugar melhor" (= morreu); "colaborador" (= empregado); "conflito armado" (= guerra).' },
    { disc:'linguagens', area:'📝 LINGUAGENS', lvl:3, q:'Como usar repertório sociocultural legitimamente na redação?', a:'Citar dados, leis, filósofos, obras literárias, filmes ou pesquisas para embasar a tese — com autoria e pertinência. Valem na C2 (repertório). Evitar citações genéricas do tipo "como dizia um filósofo".' },
    { disc:'linguagens', area:'📝 LINGUAGENS', lvl:3, q:'O que é polifonia em Bakhtin?',                             a:'Conceito de que um texto é composto por múltiplas vozes/perspectivas que dialogam. No ENEM aparece em questões de análise do discurso: charges e reportagens têm vozes implícitas e explícitas.' },

    // ── MATEMÁTICA ─────────────────────────────────────────────────────────────
    { disc:'matematica', area:'➗ MATEMÁTICA', lvl:1, q:'Teorema de Pitágoras',                                       a:'Em triângulo retângulo: a² = b² + c², onde a é a hipotenusa (lado oposto ao ângulo reto) e b, c são os catetos. Exemplo: catetos 3 e 4 → hipotenusa = 5.' },
    { disc:'matematica', area:'➗ MATEMÁTICA', lvl:1, q:'O que é probabilidade?',                                     a:'P(A) = casos favoráveis / casos possíveis. P ∈ [0, 1]. Ex: lançar dado → P(4) = 1/6. Evento impossível: P=0; Evento certo: P=1.' },
    { disc:'matematica', area:'➗ MATEMÁTICA', lvl:1, q:'Fórmula do volume da esfera',                                a:'V = (4/3)πr³. Área da superfície: A = 4πr². Lembre: esfera, cubo (V=a³), cilindro (V=πr²h), cone (V=πr²h/3).' },
    { disc:'matematica', area:'➗ MATEMÁTICA', lvl:2, q:'Fórmula de Bhaskara',                                        a:'Para ax²+bx+c=0: x = (−b ± √Δ) / 2a, onde Δ = b²−4ac. Se Δ>0: 2 raízes distintas; Δ=0: 1 raiz dupla; Δ<0: sem raízes reais.' },
    { disc:'matematica', area:'➗ MATEMÁTICA', lvl:2, q:'O que é função afim (1º grau)?',                             a:'f(x) = ax + b. Se a>0: crescente; a<0: decrescente; a=0: constante. Zero em x = −b/a. Gráfico: reta. Exemplo: velocidade constante v = v₀ + at.' },
    { disc:'matematica', area:'➗ MATEMÁTICA', lvl:2, q:'O que é uma progressão geométrica (PG)?',                    a:'Sequência em que cada termo é o anterior × razão q. Termo geral: aₙ = a₁ · qⁿ⁻¹. Soma dos n termos: Sₙ = a₁(qⁿ−1)/(q−1). Exemplo: 2, 4, 8, 16... (q=2).' },
    { disc:'matematica', area:'➗ MATEMÁTICA', lvl:2, q:'Fórmula da área do triângulo com base e altura',             a:'A = (base × altura) / 2. Com os 3 lados (Heron): s = (a+b+c)/2, A = √(s(s-a)(s-b)(s-c)). Em triângulo equilátero: A = (l²√3)/4.' },
    { disc:'matematica', area:'➗ MATEMÁTICA', lvl:2, q:'O que é combinação simples C(n,k)?',                         a:'Número de grupos de k elementos tirados de n sem considerar ordem: C(n,k) = n! / (k! · (n−k)!). Ex: C(5,2) = 10 pares possíveis de 5 pessoas.' },
    { disc:'matematica', area:'➗ MATEMÁTICA', lvl:3, q:'O que é logaritmo? Propriedades básicas.',                   a:'logₐb = x ↔ aˣ = b. Propriedades: log(AB) = logA + logB; log(A/B) = logA − logB; log(Aⁿ) = n·logA; logₐa = 1; logₐ1 = 0. Muito usado em escalas (pH, Richter, dB).' },
    { disc:'matematica', area:'➗ MATEMÁTICA', lvl:3, q:'O que é uma função exponencial?',                            a:'f(x) = a·bˣ (b>0, b≠1). Se b>1: crescente; 0<b<1: decrescente. Modela crescimento/decaimento: população, juros compostos, meia-vida radioativa. Inversa do logaritmo.' },

    // ── MATEMÁTICA — NOVOS ─────────────────────────────────────────────────────
    { disc:'matematica', area:'➗ MATEMÁTICA', lvl:1, q:'O que é progressão aritmética (PA) e seu termo geral?',      a:'Sequência com diferença constante r entre termos consecutivos. Termo geral: aₙ = a₁ + (n−1)·r. Soma: Sₙ = n·(a₁+aₙ)/2. Ex: 3, 7, 11, 15... (r=4).' },
    { disc:'matematica', area:'➗ MATEMÁTICA', lvl:1, q:'Porcentagem: como calcular acréscimo e desconto?',           a:'Acréscimo de p%: multiplique por (1 + p/100). Desconto de p%: multiplique por (1 − p/100). Dois descontos de 20%: 0,8 × 0,8 = 0,64 → desconto real de 36%, não 40%!' },
    { disc:'matematica', area:'➗ MATEMÁTICA', lvl:1, q:'O que é média aritmética, mediana e moda?',                  a:'Média: soma ÷ quantidade (sensível a outliers). Mediana: valor central após ordenar (robusta). Moda: valor mais frequente. ENEM cobra comparação entre elas em distribuições assimétricas.' },
    { disc:'matematica', area:'➗ MATEMÁTICA', lvl:2, q:'Razões trigonométricas no triângulo retângulo',              a:'sen θ = cateto oposto / hipotenusa · cos θ = cateto adjacente / hipotenusa · tg θ = oposto / adjacente. Memorize: SOH-CAH-TOA. Valores de 30°, 45°, 60° são os mais cobrados.' },
    { disc:'matematica', area:'➗ MATEMÁTICA', lvl:2, q:'Valores especiais de seno, cosseno e tangente',              a:'30°: sen=½, cos=√3/2, tg=√3/3 | 45°: sen=cos=√2/2, tg=1 | 60°: sen=√3/2, cos=½, tg=√3. Identidade: sen²θ + cos²θ = 1 (sempre!).' },
    { disc:'matematica', area:'➗ MATEMÁTICA', lvl:2, q:'Juros compostos: fórmula e diferença do simples',            a:'Simples: M = C(1+it). Composto: M = C(1+i)ⁿ. No composto, os juros incidem sobre o saldo total (juros sobre juros). É uma PG com razão q=(1+i). Muito cobrado em questões de financiamento e investimento.' },
    { disc:'matematica', area:'➗ MATEMÁTICA', lvl:2, q:'O que é a equação da reta no plano cartesiano?',             a:'Forma reduzida: y = ax + b (a = inclinação, b = coeficiente linear). Forma geral: ax + by + c = 0. Coeficiente angular: a = tg θ = (y₂−y₁)/(x₂−x₁). Retas paralelas: mesma inclinação; perpendiculares: a₁·a₂ = −1.' },
    { disc:'matematica', area:'➗ MATEMÁTICA', lvl:2, q:'Como calcular a distância entre dois pontos no plano?',      a:'d = √[(x₂−x₁)² + (y₂−y₁)²]. Ponto médio: M = ((x₁+x₂)/2, (y₁+y₂)/2). Base da geometria analítica — aparece em questões de mapas, GPS, engenharia.' },
    { disc:'matematica', area:'➗ MATEMÁTICA', lvl:2, q:'Relação de Euler para poliedros convexos',                   a:'V − A + F = 2, onde V = vértices, A = arestas, F = faces. Ex: cubo: 8−12+6 = 2 ✓. Prismas: F = n+2; Pirâmides: F = n+1 (n = lados da base).' },
    { disc:'matematica', area:'➗ MATEMÁTICA', lvl:3, q:'Princípio da Contagem e diferença entre Arranjo e Combinação', a:'Contagem: n₁ × n₂ × ... Arranjo A(n,p) = n!/(n−p)! → a ORDEM importa (senhas, filas). Combinação C(n,p) = n!/(p!(n−p)!) → a ORDEM não importa (grupos, comissões). Ex: 3 de 5 em fila: A=60; em grupo: C=10.' },
    { disc:'matematica', area:'➗ MATEMÁTICA', lvl:3, q:'O que é função composta e função inversa?',                  a:'Composta: (f∘g)(x) = f(g(x)) — aplica g primeiro, depois f. Inversa: f⁻¹ desfaz f → f(f⁻¹(x)) = x. Gráficos de f e f⁻¹ são simétricos em relação à reta y=x. Ex: log é inversa da exponencial.' },

    // ── HUMANAS — NOVOS ────────────────────────────────────────────────────────
    { disc:'humanas', area:'🌍 HUMANAS', lvl:1, q:'O que foi a Abolição da Escravidão no Brasil?',                   a:'A Lei Áurea (13 de maio de 1888) aboliu oficialmente a escravidão no Brasil, sendo o último país das Américas a fazê-lo. Princesa Isabel assinou. O Brasil não indenizou os ex-escravizados nem promoveu inclusão social, gerando desigualdade estrutural até hoje.' },
    { disc:'humanas', area:'🌍 HUMANAS', lvl:1, q:'O que foi a Proclamação da República no Brasil (1889)?',          a:'Golpe militar liderado por Marechal Deodoro da Fonseca, que pôs fim ao Império e instaurou a República. Motivações: insatisfação militar, abolição da escravidão (perdas dos fazendeiros), influência do positivismo. Começou a República Velha (1889–1930).' },
    { disc:'humanas', area:'🌍 HUMANAS', lvl:2, q:'O que foi a Ditadura Militar no Brasil e o AI-5?',               a:'Golpe de 1964 depôs João Goulart. O AI-5 (1968) foi o ato mais duro: fechou o Congresso, suspendeu habeas corpus e instaurou censura total. Período Médici (1969–74): maior repressão + "milagre econômico". Abertura política com Figueiredo e anistia (1979).' },
    { disc:'humanas', area:'🌍 HUMANAS', lvl:2, q:'O que é racismo estrutural?',                                     a:'Racismo que não se limita a atos individuais, mas está embutido nas estruturas da sociedade (leis, instituições, cultura). Conceito de Silvio Almeida: o racismo é um processo que reproduz privilégios e discriminações sistematicamente. ENEM cobra: desigualdade racial, cotas, herança escravocrata.' },
    { disc:'humanas', area:'🌍 HUMANAS', lvl:2, q:'O que é fordismo e taylorismo?',                                  a:'Taylorismo (F. Taylor): organização científica do trabalho — divisão máxima de tarefas, cronometragem, controle de movimentos. Fordismo (H. Ford): linha de montagem, produção em massa + consumo em massa. Base da industrialização do séc. XX. Substituído pelo toyotismo (produção enxuta, just-in-time).' },
    { disc:'humanas', area:'🌍 HUMANAS', lvl:2, q:'O que foi o apartheid e onde ocorreu?',                           a:'Regime de segregação racial institucionalizado na África do Sul (1948–1994). Leis separavam brancos de negros em escolas, bairros, transportes. Nelson Mandela lutou contra ele; preso por 27 anos, se tornou presidente em 1994. Condenado como crime contra a humanidade pela ONU.' },
    { disc:'humanas', area:'🌍 HUMANAS', lvl:2, q:'O que é populismo? Cite exemplos brasileiros.',                   a:'Estilo político que apela diretamente às massas, apresentando o líder como representante do "povo" contra as elites. No Brasil: Getúlio Vargas (trabalhismo, CLT) e João Goulart. Características: discurso carismático, reformismo social, ambiguidade ideológica — pode ser de esquerda ou direita.' },
    { disc:'humanas', area:'🌍 HUMANAS', lvl:2, q:'O que é a questão indígena no Brasil?',                           a:'Povos originários têm direito constitucional (Art. 231, CF/88) às terras que tradicionalmente ocupam. Conflitos: agronegócio × povos indígenas, garimpo ilegal, questão do Marco Temporal (STF derrubou em 2023). FUNAI: órgão governamental de proteção. Brasil tem ~305 povos e 274 línguas indígenas.' },
    { disc:'humanas', area:'🌍 HUMANAS', lvl:3, q:'O que é interseccionalidade?',                                    a:'Conceito de Kimberlé Crenshaw: as opressões (raça, gênero, classe, sexualidade) se cruzam e se potencializam. Uma mulher negra pobre enfrenta mais barreiras que a soma de cada discriminação separada. Ferramenta de análise das desigualdades contemporâneas — muito cobrada no ENEM.' },
    { disc:'humanas', area:'🌍 HUMANAS', lvl:3, q:'Quais as características do capitalismo industrial, financeiro e informacional?', a:'Industrial (séc. XIX): produção fabril, proletariado. Financeiro/Monopolista (séc. XX): fusões, imperialismo, FMI/Banco Mundial. Informacional/Pós-industrial (séc. XXI): tecnologia, serviços, plataformas digitais (GAFAM), trabalho flexível/precarizado, acumulação por dados.' },
    { disc:'humanas', area:'🌍 HUMANAS', lvl:2, q:'O que foi a Revolução Russa (1917)?',                             a:'Fevereiro: derrubou o czar Nicolau II → República. Outubro: bolcheviques (Lenin) tomaram o poder → primeira nação socialista da história (URSS, 1922). Base: marxismo-leninismo. Consequências: Guerra Civil, industrialização forçada, stalinismo, inspiração para movimentos de esquerda mundiais.' },
    { disc:'humanas', area:'🌍 HUMANAS', lvl:1, q:'O que é o capitalismo? Princípios básicos.',                      a:'Sistema econômico baseado em: propriedade privada dos meios de produção, livre mercado, trabalho assalariado e busca do lucro. Surgiu com a Revolução Industrial. Variantes: liberal (mercado livre), social-democrata (Estado de bem-estar) e neoliberal (mínima intervenção estatal).' },

    // ── NATUREZA — NOVOS ───────────────────────────────────────────────────────
    { disc:'natureza', area:'🔬 NATUREZA', lvl:1, q:'Quais são as funções inorgânicas? Exemplos.',                   a:'Ácidos: liberam H⁺ (HCl, H₂SO₄, HNO₃). Bases: liberam OH⁻ (NaOH, Ca(OH)₂). Sais: formados por ácido + base, sem H₂O (NaCl, CaCO₃). Óxidos: binários com O (CO₂, Fe₂O₃, CaO). Hidretos: binários com H (HF, H₂S).' },
    { disc:'natureza', area:'🔬 NATUREZA', lvl:1, q:'O que é cadeia alimentar e fluxo de energia?',                  a:'Produtor → Consumidor primário → Consumidor secundário → Decompositor. A energia passa unidirecionalmente: apenas ~10% passam de um nível ao próximo (Regra dos 10%). Quanto maior o nível trófico, menos energia disponível.' },
    { disc:'natureza', area:'🔬 NATUREZA', lvl:1, q:'O que é respiração celular?',                                   a:'Processo que libera ATP a partir da glicose. Equação geral: C₆H₁₂O₆ + 6O₂ → 6CO₂ + 6H₂O + energia (ATP). Ocorre nas mitocôndrias. Etapas: glicólise (citoplasma) → ciclo de Krebs → fosforilação oxidativa.' },
    { disc:'natureza', area:'🔬 NATUREZA', lvl:2, q:'O que é pH e qual a importância no ENEM?',                      a:'pH = −log[H⁺]. Escala de 0 a 14: pH<7 = ácido; pH=7 = neutro; pH>7 = básico. Cada unidade representa variação de 10× na concentração de H⁺. Aplicações: solo agrícola, piscina, sangue humano (pH ≈ 7,4), antiácidos estomacais.' },
    { disc:'natureza', area:'🔬 NATUREZA', lvl:2, q:'O que é pressão? Fórmula e unidades.',                          a:'P = F/A (pressão = força / área). Unidade SI: Pascal (Pa) = N/m². Também: atm, mmHg, bar. Pressão atmosférica: 1 atm ≈ 101.325 Pa. Princípio de Pascal: pressão se transmite integralmente em fluidos — base das prensas hidráulicas.' },
    { disc:'natureza', area:'🔬 NATUREZA', lvl:2, q:'O que é o princípio de Arquimedes?',                            a:'Um corpo submerso ou parcialmente imerso em fluido recebe um empuxo vertical para cima igual ao peso do fluido deslocado. E = ρ·g·V (ρ = densidade do fluido, V = volume submerso). Explica flutuação, submarinos e balões.' },
    { disc:'natureza', area:'🔬 NATUREZA', lvl:2, q:'O que é energia cinética e potencial?',                         a:'Cinética: Ec = mv²/2 (energia do movimento). Potencial gravitacional: Ep = mgh (energia da posição). Conservação: Ec + Ep = constante (sem atrito). Na queda livre: Ep máxima no topo → Ec máxima embaixo.' },
    { disc:'natureza', area:'🔬 NATUREZA', lvl:2, q:'O que é eletricidade básica? Lei de Ohm.',                      a:'Lei de Ohm: V = R·I (tensão = resistência × corrente). Resistência em série: R_total = R₁+R₂+... (corrente igual). Em paralelo: 1/R_total = 1/R₁+1/R₂+... (tensão igual). Potência: P = V·I = I²·R = V²/R.' },
    { disc:'natureza', area:'🔬 NATUREZA', lvl:2, q:'Como funciona a tabela periódica? Tendências.',                 a:'Organizada por Z crescente, em períodos (linhas) e grupos (colunas). Tendências: raio atômico diminui da esq→dir e aumenta de cima→baixo. Eletronegatividade e potencial de ionização aumentam da esq→dir e de baixo→cima. Metais (esq/baixo), não-metais (dir/cima), gases nobres (grupo 18).' },
    { disc:'natureza', area:'🔬 NATUREZA', lvl:2, q:'O que são carboidratos, lipídios e proteínas?',                 a:'Carboidratos (glicídios): fonte rápida de energia, fórmula Cₙ(H₂O)ₙ — glicose, amido, celulose. Lipídios: reserva energética e estrutura celular — gorduras, óleos, ceras. Proteínas: aminoácidos ligados por peptídeos; funções estruturais, enzimáticas, transportadoras, imunológicas (anticorpos).' },
    { disc:'natureza', area:'🔬 NATUREZA', lvl:3, q:'O que é o efeito estufa e quais são os gases responsáveis?',    a:'Gases (CO₂, CH₄, N₂O, vapor d\'água) absorvem radiação infravermelha refletida pela Terra, mantendo a temperatura. O efeito natural é essencial à vida. O reforço antrópico (queima de combustíveis fósseis, desmatamento) causa aquecimento global. Metas do Acordo de Paris: limitar a +1,5°C.' },
    { disc:'natureza', area:'🔬 NATUREZA', lvl:3, q:'Qual a diferença entre fissão e fusão nuclear?',               a:'Fissão: núcleo pesado (U-235, Pu-239) é dividido liberando energia + nêutrons → usinas nucleares e bomba atômica. Fusão: núcleos leves (H) se unem formando hélio + imensa energia → estrelas e bomba de hidrogênio. Fusão tem potencial energético limpo (projeto ITER), mas é difícil de controlar.' },

    // ── LINGUAGENS — NOVOS ─────────────────────────────────────────────────────
    { disc:'linguagens', area:'📝 LINGUAGENS', lvl:1, q:'Quais as 6 funções da linguagem (Jakobson)?',               a:'Referencial: informar (notícia). Emotiva: expressar sentimentos do emissor (poesia lírica). Conativa: persuadir o receptor (publicidade). Fática: manter o contato ("alô?"). Poética: foco na elaboração estética (literatura). Metalinguística: linguagem falando de si mesma (gramática).' },
    { disc:'linguagens', area:'📝 LINGUAGENS', lvl:1, q:'O que é variação linguística? Tipos.',                      a:'Nenhuma variedade é "errada". Tipos: Regional (diferenças por região — "mandioca/macaxeira/aipim"), Social (gírias, jargões, faixas etárias), Histórica (língua muda com o tempo), Estilística (formal vs. informal). O preconceito linguístico rejeita variedades de grupos marginalizados.' },
    { disc:'linguagens', area:'📝 LINGUAGENS', lvl:2, q:'O que é ironia e como o ENEM a cobra?',                     a:'Dizer o oposto do que se pensa para criticar. Em charges e tirinhas, é o recurso mais cobrado. Identifique: o que está sendo dito x o que acontece visualmente? A contradição revela a crítica. Hipérbole (exagero) e sátira andam juntas com a ironia.' },
    { disc:'linguagens', area:'📝 LINGUAGENS', lvl:2, q:'Modernismo brasileiro: 1ª e 2ª fases',                      a:'1ª fase (1922–1930): ruptura com o parnasianismo, Semana de Arte Moderna, linguagem cotidiana, nacionalismo. Autores: Oswald de Andrade, Mário de Andrade, Cassiano Ricardo. 2ª fase (1930–1945): prosa social e regionalista. Autores: Graciliano Ramos (Vidas Secas), José Lins do Rego, Jorge Amado.' },
    { disc:'linguagens', area:'📝 LINGUAGENS', lvl:2, q:'Qual a diferença entre Romantismo, Realismo e Naturalismo?', a:'Romantismo (séc. XIX): idealização, emoção, amor impossível, fuga da realidade (Alencar, Álvares de Azevedo). Realismo: crítica social objetiva, psicologia, ironia — Machado de Assis (Dom Casmurro). Naturalismo: determinismo biológico/social, personagens vítimas do meio — Aluísio Azevedo (O Cortiço).' },
    { disc:'linguagens', area:'📝 LINGUAGENS', lvl:2, q:'Conectivos mais cobrados na redação ENEM',                  a:'Adição: além disso, ademais, também, não só…mas também. Causa: porque, pois, visto que, já que. Concessão: embora, ainda que, apesar de, mesmo que. Conclusão: portanto, logo, assim, dessa forma. Oposição: porém, contudo, entretanto, todavia. Condição: se, caso, desde que.' },
    { disc:'linguagens', area:'📝 LINGUAGENS', lvl:2, q:'O que é o Modernismo de Guimarães Rosa e Clarice Lispector?', a:'Guimarães Rosa: linguagem inventiva, mistura de regionalismo com universal, neologismos, sertão como espaço existencial. Obra-máxima: Grande Sertão: Veredas (1956). Clarice Lispector: fluxo de consciência, introspecção, questões existenciais — A Maçã no Escuro, A Hora da Estrela. Ambos na 3ª fase modernista.' },
    { disc:'linguagens', area:'📝 LINGUAGENS', lvl:3, q:'O que é crônica e como ela aparece no ENEM?',               a:'Texto jornalístico-literário que comenta o cotidiano com leveza, ironia e subjetividade. Hibridismo entre ficção e realidade. Autores clássicos: Fernando Sabino, Rubem Braga, Carlos Drummond de Andrade. O ENEM usa crônicas para cobrar: intertextualidade, ironia, posição do narrador e temas sociais.' },
    { disc:'linguagens', area:'📝 LINGUAGENS', lvl:1, q:'O que é denotação e conotação?',                            a:'Denotação: sentido literal, dicionarizado. Ex: "pedra" = mineral. Conotação: sentido figurado, contextual. Ex: "fulano tem o coração de pedra" = insensível. O ENEM cobra a diferença em poemas, publicidades e tirinhas onde o sentido conotativo cria o efeito de sentido do texto.' },

    // ── FECHANDO 100 FLASHCARDS ────────────────────────────────────────────────

    // HUMANAS (+ 2)
    { disc:'humanas', area:'🌍 HUMANAS', lvl:2, q:'O que foi o Brasil Colonial (1500–1822)?',                        a:'Exploração portuguesa: Pau-brasil → cana-de-açúcar (Nordeste, séc. XVI-XVII) → ouro/diamantes (Minas Gerais, séc. XVIII). Mão-de-obra: indígena escravizada → africana. Pacto Colonial: metrópole extraía riqueza, colônia não podia comercializar com outros países. Processos de resistência: quilombos, Inconfidência Mineira (1789), Conjuração Baiana (1798).' },
    { disc:'humanas', area:'🌍 HUMANAS', lvl:1, q:'Quais são os fundamentos e objetivos da Constituição de 1988?',   a:'Fundamentos (Art. 1º): soberania, cidadania, dignidade da pessoa humana, valores sociais do trabalho, pluralismo político. Objetivos (Art. 3º): construir sociedade justa; erradicar pobreza; reduzir desigualdades; promover o bem sem distinção. É chamada "Constituição Cidadã" por ampliar direitos sociais e individuais.' },

    // NATUREZA (+ 3)
    { disc:'natureza', area:'🔬 NATUREZA', lvl:1, q:'O que é célula? Diferença entre procarionte e eucarionte.',     a:'Célula é a unidade fundamental da vida. Procariontes (bactérias, arqueas): sem núcleo definido, sem organelas membranosas, DNA circular. Eucariontes (plantas, animais, fungos, protistas): núcleo com membrana, organelas (mitocôndria, ribossomo, retículo, etc.). Todas têm membrana plasmática, citoplasma e material genético.' },
    { disc:'natureza', area:'🔬 NATUREZA', lvl:1, q:'O que são misturas homogêneas e heterogêneas? Métodos de separação.', a:'Homogênea (=1 fase): solução uniforme, ex: água+sal. Heterogênea (≥2 fases): componentes visíveis, ex: água+óleo. Separação: filtração (sólido+líquido), decantação (densidades diferentes), destilação (pontos de ebulição diferentes), centrifugação, evaporação, catação, peneiração.' },
    { disc:'natureza', area:'🔬 NATUREZA', lvl:2, q:'Quais são as principais fontes de energia e sua classificação?', a:'Renováveis: solar, eólica, hidrelétrica, biomassa, geotérmica, maré. Não-renováveis: petróleo, carvão mineral, gás natural, nuclear (urânio). Brasil: ~85% elétrica de fonte renovável (hidro predomina). Combustíveis fósseis: formados em milhões de anos; principal causa do aquecimento global.' },

    // LINGUAGENS (+ 4)
    { disc:'linguagens', area:'📝 LINGUAGENS', lvl:2, q:'Quando se usa a crase?',                                    a:'Crase = fusão de "a" (preposição) + "a" (artigo feminino). Use antes de palavras femininas quando se pode substituir por "ao" (masc.) E "à" soa correto. Ex: "Fui à escola" (ao colégio ✓). NÃO usa antes de: verbos, pronomes pessoais, palavras masculinas sem artigo, "uma", pronomes possessivos (exceto + substantivo fem.).' },
    { disc:'linguagens', area:'📝 LINGUAGENS', lvl:2, q:'Regras principais de concordância verbal',                  a:'O verbo concorda com o sujeito em número e pessoa. Sujeito composto antes do verbo → verbo no plural. Sujeito posposto → pode concordar com o mais próximo. "A maioria de X" → verbo no singular ou plural (ambos aceitos). Pronome relativo "que" → verbo na pessoa do antecedente. Sujeito coletivo + especificador plural → verbo plural aceito.' },
    { disc:'linguagens', area:'📝 LINGUAGENS', lvl:2, q:'Como o ENEM cobra língua espanhola?',                       a:'Prova de Linguagens inclui uma seção em espanhol (5 questões), substituível por inglês. O candidato escolhe no início. O ENEM cobra: interpretação de texto (publicidade, notícia, poema), falsos cognatos (embarazada=grávida, borracha=bêbada), uso do subjuntivo, diferenças fonológicas do espanhol peninsular vs. latino-americano.' },
    { disc:'linguagens', area:'📝 LINGUAGENS', lvl:2, q:'O que é semiótica e linguagem não-verbal?',                 a:'Semiótica estuda os signos e seus significados (Peirce, Saussure). Linguagem não-verbal: imagens, gestos, música, símbolos, cores. No ENEM: charges combinam texto e imagem — a análise deve integrar os dois. Símbolo: arbitrário (✔ = aprovado). Ícone: semelhança real (foto). Índice: relação causal (fumaça = fogo).' },

    // MATEMÁTICA (+ 4)
    { disc:'matematica', area:'➗ MATEMÁTICA', lvl:1, q:'Conversão de unidades de medida: comprimento, área e volume', a:'Comprimento: km→hm→dam→m→dm→cm→mm (÷10 cada passo). Área: ÷100 por passo (km²→m² = ÷1.000.000). Volume: ÷1000 por passo. Litro: 1 L = 1 dm³ = 1000 cm³. Cuidado: ao converter área e volume, o expoente da escala também muda!' },
    { disc:'matematica', area:'➗ MATEMÁTICA', lvl:2, q:'O que é inequação do 1º grau? Como resolver?',               a:'Inequação: expressão com <, >, ≤, ≥. Resolve igual à equação, mas ao multiplicar/dividir por número NEGATIVO, o sinal de desigualdade INVERTE. Ex: −2x > 4 → x < −2. Solução: conjunto de valores (intervalo). Representar na reta numérica ou em notação de intervalo.' },
    { disc:'matematica', area:'➗ MATEMÁTICA', lvl:3, q:'O que são matrizes? Adição e multiplicação.',               a:'Matriz: tabela m×n de números. Adição: soma elemento a elemento (só entre matrizes de mesma ordem). Multiplicação A×B: só se colunas de A = linhas de B; elemento (i,j) = produto linha i de A por coluna j de B. Determinante de ordem 2: det = ad−bc. Inversa: A⁻¹ = (1/det)·adj(A). Usadas em sistemas lineares e transformações geométricas.' },
    { disc:'matematica', area:'➗ MATEMÁTICA', lvl:2, q:'O que é sistema linear? Método da substituição e adição.',  a:'Sistema com 2+ equações e incógnitas. Substituição: isola uma variável em uma equação, substitui na outra. Adição (eliminação): soma/subtrai as equações para eliminar uma variável. Interpretação gráfica: 2 retas → 1 ponto (solução única), paralelas (sem solução), coincidentes (infinitas soluções).' },
];

// ── Dados: Resumos ────────────────────────────────────────────────────────────
const RESUMOS = {
    humanas: { icon:'🌍', name:'Ciências Humanas', topics:[
        {
            title:'Era Vargas (1930–1945)',
            content:`<h4>Fases</h4><ul>
<li><strong>Gov. Provisório (1930–34):</strong> fim da República Velha (café-com-leite), criação do Ministério do Trabalho, Revolução de 1930</li>
<li><strong>Gov. Constitucional (1934–37):</strong> Constituição de 1934, 1º sufrágio feminino no Brasil</li>
<li><strong>Estado Novo (1937–45):</strong> ditadura inspirada no fascismo europeu, Constituição de 1937 ("Polaca"), censura pelo DIP, perseguição ao PCB</li>
</ul>
<h4>Legado econômico-social</h4>
<ul><li>CLT (1943): Consolidação das Leis do Trabalho</li>
<li>Salário mínimo (1940)</li>
<li>CSN — Companhia Siderúrgica Nacional (1941)</li>
<li>Petrobras (1953, no 2º governo Vargas)</li></ul>
<h4>Fim do Estado Novo</h4><p>Pressão popular e crise interna levaram à deposição em 1945. Vargas voltou eleito em 1950 e suicidou-se em 1954, deixando a "Carta Testamento" — "saio da vida para entrar na história".</p>`,
        },
        {
            title:'Segunda Guerra Mundial (1939–1945)',
            content:`<h4>Causas</h4><ul>
<li>Tratado de Versalhes (1919): humilhação alemã, reparações de guerra</li>
<li>Ascensão do totalitarismo: nazismo (Hitler), fascismo (Mussolini), militarismo japonês</li>
<li>Grande Depressão de 1929 e instabilidade política</li>
<li>Política de apaziguamento aliada (Conferência de Munique, 1938)</li></ul>
<h4>Frentes e marcos</h4><ul>
<li><strong>Europa:</strong> invasão da Polônia (set/1939), Batalha da França, Operação Barbarossa (URSS), Dia D (jun/1944)</li>
<li><strong>Pacífico:</strong> Pearl Harbor (dez/1941) → entrada dos EUA; Hiroshima e Nagasaki (ago/1945)</li>
<li><strong>Brasil:</strong> Forças Expedicionárias Brasileiras (FEB) na Itália (1944)</li></ul>
<h4>Consequências</h4><p>~65–80 milhões de mortos, Holocausto (6 mi de judeus), criação da ONU (1945), Plano Marshall, Estado de Israel (1948), início da Guerra Fria.</p>`,
        },
        {
            title:'Guerra Fria (1947–1991)',
            content:`<h4>Blocos</h4><ul>
<li><strong>Capitalista (EUA):</strong> OTAN, Plano Marshall, Doutrina Truman, capitalismo liberal</li>
<li><strong>Socialista (URSS):</strong> Pacto de Varsóvia, COMECON, expansão ao Leste Europeu e países subdesenvolvidos</li></ul>
<h4>Eventos-chave</h4><ul>
<li>Corrida espacial: Sputnik (1957), Neil Armstrong na Lua (1969)</li>
<li>Corrida nuclear: bomba atômica → bomba H → MAAD (destruição mútua assegurada)</li>
<li>Guerras proxy: Coreia (1950-53), Vietnã (1955-75), Afeganistão (1979-89)</li>
<li>Crise dos Mísseis em Cuba (1962): 13 dias mais próximos da guerra nuclear</li></ul>
<h4>Fim</h4><p>Queda do Muro de Berlim (nov/1989) → reunificação alemã · Dissolução da URSS (dez/1991) → 15 repúblicas independentes. Era pós-bipolar: EUA como hiperpotência e globalização acelerada.</p>`,
        },
        {
            title:'Revolução Francesa (1789) e Iluminismo',
            content:`<h4>Contexto</h4><p>Crise fiscal da monarquia absolutista de Luís XVI, desigualdade entre Estados (clero + nobreza x 3º Estado = 97% da pop.), influência iluminista e da Revolução Americana (1776).</p>
<h4>Fases</h4><ul>
<li><strong>Monarquia Constitucional (1789–92):</strong> Declaração dos Direitos do Homem, fim do feudalismo</li>
<li><strong>Convenção Nacional — Terror (1792–94):</strong> guilhotina, Robespierre, 40 mil executados</li>
<li><strong>Diretório (1795–99):</strong> instabilidade, golpe de Napoleão Bonaparte (18 Brumário)</li></ul>
<h4>Iluminismo</h4><ul>
<li><strong>Locke:</strong> direitos naturais, direito à revolução</li>
<li><strong>Montesquieu:</strong> separação dos três poderes</li>
<li><strong>Rousseau:</strong> soberania popular, contrato social</li>
<li><strong>Voltaire:</strong> crítica à Igreja, liberdade de expressão</li></ul>`,
        },
        {
            title:'Brasil República: Períodos e Constituições',
            content:`<h4>Linha do tempo</h4><ul>
<li><strong>República Velha (1889–1930):</strong> Oligarquias, política do café-com-leite (SP×MG), coronelismo, Revolta da Chibata (1910), Semana de Arte Moderna (1922)</li>
<li><strong>Era Vargas (1930–45):</strong> industrialização, trabalhismo, Estado Novo</li>
<li><strong>Democracia Populista (1945–64):</strong> JK (Brasília, 50 anos em 5), Jânio Quadros, João Goulart</li>
<li><strong>Ditadura Militar (1964–85):</strong> 5 AI, AI-5 (1968), milagre econômico, abertura gradual</li>
<li><strong>Nova República (1985–):</strong> Diretas Já, Constituição de 1988 (cidadã), Collor, FHC, Lula, Dilma, Temer, Bolsonaro, Lula</li></ul>
<h4>Constituições</h4><p>1824 (Imperial) · 1891 (1ª República) · 1934 · 1937 · 1946 · 1967/69 · <strong>1988</strong> (atual — redemocratização, direitos sociais amplos).</p>`,
        },
        {
            title:'Ditadura Militar no Brasil (1964–1985)',
            content:`<h4>Contexto e Golpe</h4>
<p>Governo Goulart (João Goulart) propunha Reformas de Base (agrária, urbana, bancária), assustando militares e elites. Em 31/mar/1964, golpe militar com apoio dos EUA (Guerra Fria).</p>
<h4>Atos Institucionais</h4>
<ul>
<li><strong>AI-1 (1964):</strong> cassação de mandatos e suspensão de direitos políticos</li>
<li><strong>AI-2 (1965):</strong> extinção dos partidos; criação de ARENA (governo) e MDB (oposição)</li>
<li><strong>AI-5 (1968):</strong> fechamento do Congresso, censura, suspensão do habeas corpus — período mais violento</li></ul>
<h4>Fases e Presidentes</h4>
<p>Castelo Branco → Costa e Silva → Médici (Milagre Econômico + maior repressão) → Geisel (abertura lenta e gradual) → Figueiredo (anistia 1979, eleições diretas para governadores 1982).</p>
<h4>Resistência e Abertura</h4>
<ul>
<li>Guerrilha do Araguaia (PCdoB), MR-8, ALN (Carlos Marighella)</li>
<li>Campanha Diretas Já! (1983-84) — emenda Dante de Oliveira não aprovada</li>
<li>Tancredo Neves eleito pelo Colégio Eleitoral (1985) — morre antes de tomar posse; José Sarney assume</li></ul>`,
        },
        {
            title:'Direitos Humanos e Cidadania',
            content:`<h4>Declaração Universal dos Direitos Humanos (1948)</h4>
<p>Criada pela ONU após a 2ª Guerra Mundial. 30 artigos garantindo: dignidade humana, igualdade, liberdade, vedação à tortura, direito à vida, à educação, ao trabalho e à saúde. Base do direito internacional contemporâneo.</p>
<h4>Constituição de 1988 — Direitos Fundamentais</h4>
<ul>
<li><strong>Art. 5º:</strong> direitos individuais (igualdade, liberdade, privacidade, contraditório, ampla defesa)</li>
<li><strong>Art. 6º:</strong> direitos sociais (saúde, educação, moradia, trabalho, lazer, previdência)</li>
<li>Princípio da dignidade da pessoa humana como fundamento da República</li></ul>
<h4>Povos Vulneráveis</h4>
<ul>
<li><strong>Indígenas (Art. 231):</strong> direito às terras tradicionalmente ocupadas; FUNAI; questão do Marco Temporal</li>
<li><strong>Afro-brasileiros:</strong> Lei 10.639/2003 (história africana no currículo); políticas de cotas</li>
<li><strong>Pessoas com deficiência:</strong> Lei Brasileira de Inclusão (2015), acessibilidade universal</li>
<li><strong>LGBTQIA+:</strong> criminalização da homofobia (STF, 2019)</li></ul>
<h4>No ENEM</h4><p>Questões cobram: preconceito estrutural, interseccionalidade, violação de direitos, análise de documentos históricos sobre minorias.</p>`,
        },
        {
            title:'Globalização, Geopolítica e Atualidades',
            content:`<h4>Globalização</h4>
<p>Integração econômica, cultural e política acelerada após 1989 (fim da Guerra Fria). Pilares: internet, abertura comercial, fluxo de capitais, corporações multinacionais, padronização cultural ("mcdonaldização").</p>
<h4>Geopolítica Contemporânea</h4>
<ul>
<li><strong>Unipolaridade → Multipolaridade:</strong> EUA como hiperpotência nos anos 90; ascensão da China, Índia, Rússia (BRICS)</li>
<li><strong>Conflitos:</strong> Guerra do Golfo, Atentados de 11/set/2001, Primavera Árabe, Guerra na Ucrânia (2022)</li>
<li><strong>Organismos internacionais:</strong> ONU, OMC, FMI, Banco Mundial, OTAN, Mercosul, União Europeia</li></ul>
<h4>Desigualdade e Desenvolvimento</h4>
<ul>
<li>IDH (Índice de Desenvolvimento Humano): PIB per capita + educação + expectativa de vida</li>
<li>Índice de Gini: mede desigualdade de renda (0 = igualdade total; 1 = máxima desigualdade)</li>
<li>Neoliberalismo × Estado de Bem-Estar Social: privatizações × políticas públicas universais</li></ul>`,
        },
        {
            title:'Questão Ambiental e Desenvolvimento Sustentável',
            content:`<h4>Principais Problemas</h4>
<ul>
<li><strong>Aquecimento global:</strong> efeito estufa (CO₂, CH₄, N₂O), derretimento das calotas, elevação dos oceanos</li>
<li><strong>Desmatamento:</strong> Amazônia (fronteira agrícola), Cerrado ("berço das águas"), Mata Atlântica</li>
<li><strong>Poluição:</strong> plásticos nos oceanos (giro oceânico), chuva ácida (SO₂/NOₓ), smog urbano</li>
<li><strong>Desertificação:</strong> Semiárido nordestino — caatinga e degradação do solo</li></ul>
<h4>Marcos das Conferências</h4>
<ul>
<li><strong>Estocolmo 1972:</strong> 1ª conferência ambiental mundial</li>
<li><strong>ECO-92 (Rio de Janeiro):</strong> Agenda 21, Convenção da Biodiversidade</li>
<li><strong>Kyoto 1997:</strong> metas de redução de emissões para países desenvolvidos</li>
<li><strong>Paris 2015:</strong> limite de 1,5°C de aquecimento; todos os países se comprometem</li></ul>
<h4>Desenvolvimento Sustentável</h4>
<p>"Atender as necessidades do presente sem comprometer as gerações futuras" (Brundtland, 1987). Tripé: econômico + social + ambiental. ODS da ONU: 17 Objetivos de Desenvolvimento Sustentável (Agenda 2030).</p>`,
        },
    ]},
    natureza: { icon:'🔬', name:'Ciências da Natureza', topics:[
        {
            title:'Leis de Mendel e Genética',
            content:`<h4>1ª Lei — Segregação dos Fatores</h4>
<p>Cada caráter é determinado por dois fatores (alelos) que se separam na formação dos gametas, cada gameta recebe um alelo. Ex: Aa → 50% gametas A + 50% gametas a.</p>
<h4>2ª Lei — Segregação Independente</h4>
<p>Genes de cromossomos diferentes se separam de modo independente. Proporção clássica F2 diíbrido: <strong>9:3:3:1</strong>.</p>
<h4>Exceções importantes</h4><ul>
<li><strong>Codominância:</strong> ambos os alelos se expressam (tipo sanguíneo AB)</li>
<li><strong>Dominância incompleta:</strong> fenótipo intermediário (flor rosa = V×B)</li>
<li><strong>Pleiotropia:</strong> 1 gene → múltiplos fenótipos (anemia falciforme)</li>
<li><strong>Epistase:</strong> gene mascara outro (albinismo)</li>
<li><strong>Ligação gênica:</strong> genes no mesmo cromossomo — violam 2ª Lei</li></ul>
<h4>Tipo sanguíneo ABO</h4><p>Iᴬ e Iᴮ são codominantes com i recessivo. Rh: Rr ou RR = Rh+; rr = Rh−.</p>`,
        },
        {
            title:'Funções Orgânicas (Química)',
            content:`<h4>Grupos funcionais principais</h4>
<ul>
<li><strong>Álcool:</strong> –OH ligado a C saturado · Ex: etanol (C₂H₅OH)</li>
<li><strong>Fenol:</strong> –OH ligado a anel benzênico · Ex: fenol, ácido salicílico</li>
<li><strong>Aldeído:</strong> –CHO na extremidade da cadeia · Ex: formaldeído, acetaldeído</li>
<li><strong>Cetona:</strong> C=O no interior da cadeia · Ex: acetona</li>
<li><strong>Ácido carboxílico:</strong> –COOH · Ex: ácido acético (vinagre), ácido cítrico</li>
<li><strong>Éster:</strong> R–COO–R' · responsável por aromas; formado por esterificação (ácido + álcool → éster + água)</li>
<li><strong>Amina:</strong> –NH₂ · Ex: metilamina, dopamina</li>
<li><strong>Amida:</strong> –CO–NH– · Ex: uréia, nylon</li>
<li><strong>Éter:</strong> R–O–R' · Ex: éter etílico (anestésico)</li></ul>
<h4>Dica ENEM</h4><p>Identificar o grupo funcional pelo sufixo: -ol (álcool), -al (aldeído), -ona (cetona), -oico (ácido), -ato (éster), -amina, -amida.</p>`,
        },
        {
            title:'Termodinâmica',
            content:`<h4>1ª Lei — Conservação de Energia</h4>
<p>ΔU = Q − W. Q>0: sistema absorve calor. W>0: sistema realiza trabalho sobre a vizinhança.</p>
<h4>2ª Lei — Entropia e Irreversibilidade</h4>
<p>O calor flui espontaneamente do corpo mais quente para o mais frio. A entropia (desordem) do universo sempre aumenta em processos reais. Impossível construir motor de 100% rendimento.</p>
<h4>Rendimento de máquinas térmicas</h4>
<p>η = W/Q₁ = 1 − Q₂/Q₁. Máquina de Carnot (ideal): η = 1 − Tf/Tq (em Kelvin). T(K) = T(°C) + 273.</p>
<h4>Processos termodinâmicos</h4><ul>
<li>Isotérmico: T constante → ΔU=0 → Q=W</li>
<li>Isobárico: P constante → W=PΔV</li>
<li>Isovolumétrico (isocórico): V constante → W=0 → ΔU=Q</li>
<li>Adiabático: Q=0 → ΔU=−W</li></ul>`,
        },
        {
            title:'Ecologia e Meio Ambiente',
            content:`<h4>Níveis de organização ecológica</h4>
<p>Indivíduo → População → Comunidade → Ecossistema → Biosfera.</p>
<h4>Cadeias e teias alimentares</h4>
<ul>
<li><strong>Produtores:</strong> plantas e algas (fotossíntese)</li>
<li><strong>Consumidores primários:</strong> herbívoros</li>
<li><strong>Consumidores secundários/terciários:</strong> carnívoros</li>
<li><strong>Decompositores:</strong> fungos e bactérias — reciclam nutrientes</li></ul>
<h4>Ciclos biogeoquímicos</h4>
<p>Carbono (fotossíntese/respiração), Nitrogênio (fixação → nitrificação → desnitrificação), Água (evaporação → precipitação → percolação).</p>
<h4>Biomas brasileiros (ENEM adora!)</h4>
<ul>
<li><strong>Amazônia:</strong> maior biodiversidade terrestre; ameaça: desmatamento</li>
<li><strong>Cerrado:</strong> savana tropical; 2ª maior biodiversidade brasileira; "berço das águas"</li>
<li><strong>Mata Atlântica:</strong> 12-13% remanescente; hotspot de biodiversidade</li>
<li><strong>Caatinga:</strong> único bioma exclusivamente brasileiro; semiárido</li>
<li><strong>Pampa e Pantanal:</strong> menor extensão; Pantanal = maior área úmida do mundo</li></ul>`,
        },
        {
            title:'Física Moderna — Relatividade e Quântica',
            content:`<h4>Relatividade Especial (Einstein, 1905)</h4>
<ul>
<li>A velocidade da luz c = 3×10⁸ m/s é constante para todos os observadores</li>
<li><strong>Dilatação do tempo</strong> e <strong>contração do espaço</strong> para corpos em alta velocidade</li>
<li>E = mc²: equivalência massa-energia — base da energia nuclear</li></ul>
<h4>Física Quântica</h4>
<ul>
<li><strong>Efeito fotoelétrico (Einstein, Nobel 1921):</strong> luz em fótons E=hf; elétrons são ejetados quando f ≥ frequência limiar</li>
<li><strong>Modelo atômico de Bohr:</strong> elétrons em órbitas estacionárias; emissão/absorção de luz ao mudar de nível</li>
<li><strong>Dualidade onda-partícula (De Broglie):</strong> matéria tem comportamento ondulatório λ=h/mv</li>
<li><strong>Princípio da Incerteza (Heisenberg):</strong> não é possível medir posição e velocidade simultaneamente com precisão ilimitada</li></ul>`,
        },
        {
            title:'Cinemática e Leis de Newton',
            content:`<h4>Cinemática — MRU e MRUV</h4>
<p><strong>MRU</strong> (velocidade constante): S = S₀ + v·t<br>
<strong>MRUV</strong> (aceleração constante): v = v₀ + a·t · S = S₀ + v₀t + at²/2 · v² = v₀² + 2aΔS</p>
<h4>Leis de Newton</h4>
<ul>
<li><strong>1ª Lei (Inércia):</strong> corpo em repouso ou MRU tende a permanecer assim salvo força resultante ≠ 0</li>
<li><strong>2ª Lei (F=ma):</strong> a força resultante é igual à massa × aceleração; F(N) = m(kg) × a(m/s²)</li>
<li><strong>3ª Lei (Ação e Reação):</strong> para toda força de A sobre B, existe força igual, oposta e aplicada em B sobre A</li></ul>
<h4>Forças importantes</h4>
<ul>
<li>Peso: P = m·g (g ≈ 10 m/s²)</li>
<li>Normal: perpendicular à superfície</li>
<li>Atrito: f = μ·N (estático e cinético)</li>
<li>Gravitação Universal: F = G·m₁·m₂/d²</li></ul>`,
        },
        {
            title:'Ondulatória, Som e Óptica',
            content:`<h4>Ondas</h4>
<p>Perturbação que se propaga transportando energia sem transportar matéria. v = λ·f · T = 1/f.<br>
Transversais: vibração ⊥ à propagação (luz, ondas do mar). Longitudinais: vibração ∥ à propagação (som).</p>
<h4>Som</h4>
<ul>
<li>Frequência: intensidade percebida como altura (grave/agudo); unidade: Hz. Audição humana: 20 Hz – 20 kHz</li>
<li>Intensidade sonora: dB. Cada 10 dB = 10× mais intenso. Limite de dano: >85 dB por longas exposições</li>
<li>Efeito Doppler: fonte se aproxima → frequência percebida aumenta; se afasta → diminui</li></ul>
<h4>Óptica Geométrica</h4>
<ul>
<li>Reflexão: θᵢ = θᵣ (ângulo de incidência = reflexão)</li>
<li>Refração: n₁·sen θ₁ = n₂·sen θ₂ (Lei de Snell-Descartes). Índice de refração n = c/v</li>
<li>Lentes convergentes: ponto focal real; formam imagem real e invertida (se o objeto está além de f)</li>
<li>Lentes divergentes: ponto focal virtual; imagem sempre virtual, direita e menor</li></ul>`,
        },
        {
            title:'Reações Químicas e Estequiometria',
            content:`<h4>Tipos de Reações Inorgânicas</h4>
<ul>
<li><strong>Síntese (adição):</strong> A + B → AB</li>
<li><strong>Análise (decomposição):</strong> AB → A + B; ex: eletrólise da água</li>
<li><strong>Deslocamento (simples troca):</strong> A + BC → AC + B; ex: Fe + CuSO₄ → FeSO₄ + Cu</li>
<li><strong>Dupla troca:</strong> AB + CD → AD + CB; ex: neutralização ácido-base → sal + água</li></ul>
<h4>Estequiometria — Regra de Três Molar</h4>
<p>Balancear a equação → converter massas em mols (n = m/M) → usar proporção dos coeficientes.<br>
Exemplo: 2H₂ + O₂ → 2H₂O. 4g de H₂ (2 mol) reagem com 32g de O₂ (1 mol) → produzem 36g de H₂O (2 mol).</p>
<h4>Velocidade e Equilíbrio</h4>
<ul>
<li>Fatores que aumentam a velocidade: temperatura↑, concentração↑, catalisador, superfície de contato↑</li>
<li>Princípio de Le Chatelier: perturbação → equilíbrio desloca para minimizá-la</li>
<li>Kc e Kp: expressões do equilíbrio; Kc grande → favorece produtos</li></ul>`,
        },
        {
            title:'Biotecnologia, DNA e Saúde',
            content:`<h4>DNA e Biotecnologia</h4>
<ul>
<li><strong>PCR (Reação em Cadeia da Polimerase):</strong> amplifica pequenas amostras de DNA; usada em exames diagnósticos (COVID-19), perícia criminal e pesquisa</li>
<li><strong>Organismos Transgênicos (OGM):</strong> gene de outro organismo inserido; ex: soja Roundup Ready, insulina bacteriana, vacinas de DNA</li>
<li><strong>Células-tronco:</strong> capacidade de se diferenciarem em vários tipos celulares; aplicação em medicina regenerativa</li>
<li><strong>CRISPR-Cas9:</strong> tesoura molecular que edita genes com precisão; revolução em genética aplicada</li></ul>
<h4>Doenças e Saúde Pública</h4>
<ul>
<li><strong>Virais:</strong> dengue (Aedes aegypti), COVID-19, AIDS (HIV), gripe (mutação antigênica)</li>
<li><strong>Bacterianas:</strong> tuberculose, leptospirose, cólera (transmissão hídrica)</li>
<li><strong>Sistema imune:</strong> anticorpos (imunidade humoral), linfócitos T (imunidade celular), vacinas (imunidade ativa artificialmente adquirida)</li></ul>`,
        },
    ]},
    linguagens: { icon:'📝', name:'Linguagens', topics:[
        {
            title:'5 Competências da Redação ENEM',
            content:`<h4>Cada competência vale 0–200 pts (total: 1000)</h4>
<ul>
<li><strong>C1 — Norma culta:</strong> gramática, ortografia, pontuação, concordância. Erros graves zeram a nota!</li>
<li><strong>C2 — Compreensão do tema + repertório:</strong> entender o tema, não fugir, usar dados/citações/leis relevantes. Repertório deve ser pertinente e bem articulado.</li>
<li><strong>C3 — Argumentação:</strong> selecionar, organizar e interpretar informações. Tese clara, argumentos que a sustentam, exemplos e dados concretos.</li>
<li><strong>C4 — Coesão textual:</strong> articulação entre partes usando conectivos, pronomes e sinônimos. Sem repetição e sem incoerências.</li>
<li><strong>C5 — Proposta de intervenção:</strong> obrigatoriamente 5 elementos: ação + agente + modo/instrumento + efeito esperado + finalidade. Deve respeitar os direitos humanos.</li></ul>
<h4>Conectivos mais usados</h4>
<p>Causais: porque, pois, visto que · Concessivos: embora, ainda que, apesar de · Conclusivos: portanto, logo, assim · Adversativos: porém, contudo, entretanto · Aditivos: além disso, também, não só...mas também</p>`,
        },
        {
            title:'Figuras de Linguagem completo',
            content:`<ul>
<li><strong>Metáfora:</strong> comparação implícita — "meu coração é uma pedra"; "tempo é dinheiro"</li>
<li><strong>Metonímia:</strong> substituição por relação — "li Clarice" (autor/obra); "Brasil venceu" (país/time); "beber o cálice" (recipiente/conteúdo)</li>
<li><strong>Catacrese:</strong> metáfora cristalizada — "pé da mesa", "braço do rio", "asa da xícara"</li>
<li><strong>Ironia:</strong> dizer o oposto do que se pensa com intenção crítica — "Que bela ideia!"</li>
<li><strong>Hipérbole:</strong> exagero expressivo — "chorei um oceano"; "te liguei mil vezes"</li>
<li><strong>Eufemismo:</strong> suavizar ideia negativa — "partiu para um lugar melhor"; "colaborador" (empregado)</li>
<li><strong>Antítese:</strong> ideias opostas aproximadas — "era o melhor dos tempos, era o pior dos tempos"</li>
<li><strong>Paradoxo:</strong> contradição aparente mas verdadeira — "morro de tanto viver"; "claridade cega"</li>
<li><strong>Personificação/Prosopopeia:</strong> humanos atributos ao inanimado — "o vento gemeu"; "a esperança suspirou"</li>
<li><strong>Sinestesia:</strong> mistura de sentidos — "voz aveludada"; "cor quente"</li>
<li><strong>Aliteração:</strong> repetição de consoantes — "Peter Piper picked peppers"</li>
<li><strong>Anáfora:</strong> repetição de palavra no início dos versos/frases — discurso de M.L.King: "I have a dream"</li></ul>`,
        },
        {
            title:'Gêneros Textuais e Tipologias',
            content:`<h4>Tipos textuais (como está organizado o texto)</h4>
<ul>
<li><strong>Narrativo:</strong> conta um relato com personagens, enredo, tempo e espaço</li>
<li><strong>Descritivo:</strong> apresenta características de um ser, objeto ou lugar</li>
<li><strong>Dissertativo-argumentativo:</strong> defende tese com argumentos — gênero da redação ENEM</li>
<li><strong>Expositivo:</strong> informa e explica sem argumentar (artigo científico, enciclopédia)</li>
<li><strong>Injuntivo/Instrucional:</strong> orienta ações (receita, manual, bula)</li></ul>
<h4>Gêneros discursivos (como circula na sociedade)</h4>
<p>Cada gênero tem estrutura composicional, estilo e conteúdo temático. Ex: carta, reportagem, charge, tirinha, editorial, blog, post, discurso político, conto, crônica, poema.</p>
<h4>Dica ENEM</h4><p>A prova cobra: inferência, intertextualidade, ironia em charges/tirinhas, variação linguística (norma culta vs. variedades), funções da linguagem (referencial, emotiva, conativa, fática, poética, metalinguística).</p>`,
        },
        {
            title:'Literatura Brasileira — Escolas Literárias',
            content:`<h4>Pré-Modernismo e Modernismo</h4>
<ul>
<li><strong>Realismo (1881):</strong> Machado de Assis — narrativa psicológica, ironia, crítica social. Obras: Dom Casmurro, Quincas Borba</li>
<li><strong>Naturalismo:</strong> Aluísio Azevedo — determinismo, meio e raça. O Cortiço</li>
<li><strong>Pré-Modernismo:</strong> Euclides da Cunha (Os Sertões), Lima Barreto, Graça Aranha</li></ul>
<h4>1ª Fase Modernista (1922–30) — "Destruição"</h4>
<p>Semana de Arte Moderna (fev/1922): liberdade formal, valorização do popular e nacional. Oswald de Andrade (Manifesto Antropófago), Mário de Andrade (Macunaíma).</p>
<h4>2ª Fase Modernista (1930–45) — "Construção"</h4>
<p>Prosa regionalista e maior preocupação social. Carlos Drummond de Andrade (poesia social), Cecília Meireles, João Cabral de Melo Neto. Em prosa: Graciliano Ramos (Vidas Secas), Jorge Amado, José Lins do Rego.</p>
<h4>Literatura Contemporânea (pós-1945)</h4>
<p>Guimarães Rosa (Grande Sertão: Veredas — linguagem inventiva), Clarice Lispector (fluxo de consciência), João Guimarães Rosa, Rubem Fonseca (conto urbano violento). Poesia concreta: Décio Pignatari.</p>`,
        },
        {
            title:'Variação Linguística e Funções da Linguagem',
            content:`<h4>Variação Linguística</h4>
<p>Nenhuma variante é "errada" — cada uma atende a sua função social. Tipos:</p>
<ul>
<li><strong>Regional (diatópica):</strong> sotaques e vocabulários diferentes por região (ex: "saudade" no português → "longing" no inglês; "mandioca/macaxeira/aipim")</li>
<li><strong>Social (diastrática):</strong> variedades de grupos sociais, faixas etárias, profissões (gíria, jargão)</li>
<li><strong>Histórica (diacrônica):</strong> língua muda com o tempo; palavras surgem e desaparecem</li>
<li><strong>Estilística (diafásica):</strong> formal (redação, discurso) × informal (conversa, WhatsApp)</li></ul>
<h4>Funções da Linguagem (Jakobson)</h4>
<ul>
<li><strong>Referencial/Denotativa:</strong> informar objetivamente (notícia, artigo científico) — foco no contexto</li>
<li><strong>Emotiva/Expressiva:</strong> exprime sentimentos do emissor (diário, lírica) — foco no emissor</li>
<li><strong>Conativa/Apelativa:</strong> influenciar o receptor (publicidade, discurso político) — foco no receptor</li>
<li><strong>Fática:</strong> manter o contato ("alô?", "tá me ouvindo?") — foco no canal</li>
<li><strong>Poética:</strong> elaboração estética da mensagem (literatura, slogan) — foco na mensagem</li>
<li><strong>Metalinguística:</strong> a linguagem fala de si mesma (gramática, dicionário) — foco no código</li></ul>`,
        },
        {
            title:'Interpretação de Texto — Estratégias para o ENEM',
            content:`<h4>Multimodalidade</h4>
<p>O ENEM cobra textos que combinam linguagem verbal + não-verbal: charges, tirinhas, infográficos, propagandas, poemas concretos. Sempre analise a imagem em relação ao texto.</p>
<h4>Como interpretar charges e tirinhas</h4>
<ul>
<li>Identify the contexto histórico/social referenciado</li>
<li>Procure a ironia: o que está sendo criticado?</li>
<li>Analise símbolos visuais (tamanho dos personagens, expressões, elementos exagerados)</li>
<li>Conecte ao tema da questão</li></ul>
<h4>Estratégias gerais</h4>
<ul>
<li><strong>Leia o enunciado antes do texto</strong> — saber o que procurar acelera a leitura</li>
<li>Sublinhe ideias-chave e conectivos</li>
<li>Em inferência: o que está implícito mas pode ser deduzido pelo texto?</li>
<li>Cuidado com "pegadinhas": respostas que repetem palavras do texto mas distorcem o sentido</li>
<li>Em comparação com outra obra (intertextualidade): busque o tema em comum</li></ul>
<h4>Gêneros mais cobrados</h4>
<p>Artigo de opinião · Editorial · Carta ao leitor · Charge · Tirinha · Poema · Crônica · Reportagem · Infográfico · Letra de música</p>`,
        },
    ]},
    matematica: { icon:'➗', name:'Matemática', topics:[
        {
            title:'Funções de 1º e 2º Grau',
            content:`<h4>Função Afim — f(x) = ax + b</h4>
<p>Crescente se a>0; decrescente se a<0; constante se a=0. Zero (raiz): x = −b/a. Gráfico: reta.</p>
<h4>Função Quadrática — f(x) = ax² + bx + c</h4>
<p>Gráfico: parábola. Concavidade: ∪ se a>0; ∩ se a<0.<br>
Vértice: xᵥ = −b/2a · yᵥ = −Δ/4a.<br>
Δ = b²−4ac: se Δ>0 → 2 raízes; Δ=0 → 1 raiz dupla; Δ<0 → sem raízes reais.<br>
Bhaskara: x = (−b ± √Δ) / 2a.</p>
<h4>Dicas visuais</h4>
<ul><li>Se a pergunta envolve "maior valor" ou "menor valor" → busque o vértice</li>
<li>Se a parábola corta o eixo x → use Bhaskara ou fatoração</li>
<li>Função afim: velocidade, salário, taxa fixa + variável</li>
<li>Quadrática: trajetória de projéteis, área em função de medida</li></ul>`,
        },
        {
            title:'Geometria Plana — Áreas e Perímetros',
            content:`<h4>Fórmulas essenciais</h4>
<ul>
<li><strong>Quadrado:</strong> A = l² · P = 4l</li>
<li><strong>Retângulo:</strong> A = b × h · P = 2(b+h)</li>
<li><strong>Triângulo:</strong> A = b×h/2 · Equilátero: A = l²√3/4</li>
<li><strong>Círculo:</strong> A = πr² · Comprimento: C = 2πr · Arco: s = rθ (θ em rad)</li>
<li><strong>Trapézio:</strong> A = (B+b)×h/2</li>
<li><strong>Losango:</strong> A = d₁×d₂/2</li>
<li><strong>Paralelogramo:</strong> A = b×h</li></ul>
<h4>Geometria Espacial</h4>
<ul>
<li>Cubo: V = a³ · A = 6a²</li>
<li>Paralelepípedo: V = a×b×c</li>
<li>Cilindro: V = πr²h · Alateral = 2πrh</li>
<li>Cone: V = πr²h/3 · Alateral = πrl (l = geratriz)</li>
<li>Esfera: V = 4πr³/3 · A = 4πr²</li>
<li>Pirâmide: V = Ab×h/3 (Ab = área da base)</li></ul>`,
        },
        {
            title:'Probabilidade e Combinatória',
            content:`<h4>Probabilidade</h4>
<p>P(A) = nº casos favoráveis / nº casos totais. P ∈ [0,1]. P(A') = 1 − P(A).<br>
<strong>Adição:</strong> P(A∪B) = P(A) + P(B) − P(A∩B).<br>
<strong>Multiplicação (independentes):</strong> P(A∩B) = P(A)·P(B).<br>
<strong>Condicional:</strong> P(A|B) = P(A∩B)/P(B).</p>
<h4>Análise Combinatória</h4>
<ul>
<li><strong>Princípio Fundamental da Contagem:</strong> n₁ × n₂ × ... × nₖ</li>
<li><strong>Permutação simples:</strong> Pₙ = n!</li>
<li><strong>Arranjo:</strong> A(n,p) = n!/(n−p)!</li>
<li><strong>Combinação:</strong> C(n,p) = n!/(p!·(n−p)!)</li>
<li><strong>Permutação com repetição:</strong> n!/(n₁!·n₂!···)</li></ul>
<h4>Truque ENEM</h4>
<p>Se a ordem importa → Arranjo/Permutação. Se a ordem NÃO importa → Combinação. Senhas e filas pedem Arranjo; comissões e grupos pedem Combinação.</p>`,
        },
        {
            title:'Progressões Aritméticas e Geométricas',
            content:`<h4>PA — Progressão Aritmética (razão r)</h4>
<ul>
<li>Termo geral: aₙ = a₁ + (n−1)r</li>
<li>Soma dos n termos: Sₙ = n·(a₁+aₙ)/2</li>
<li>Exemplos: 2, 5, 8, 11… (r=3) · salários com aumento fixo</li></ul>
<h4>PG — Progressão Geométrica (razão q)</h4>
<ul>
<li>Termo geral: aₙ = a₁ · qⁿ⁻¹</li>
<li>Soma dos n termos: Sₙ = a₁·(qⁿ−1)/(q−1)</li>
<li>PG infinita (|q|<1): S∞ = a₁/(1−q)</li>
<li>Exemplos: 1, 2, 4, 8… (q=2) · juros compostos · crescimento populacional</li></ul>
<h4>Juros Compostos</h4>
<p>M = C·(1+i)ⁿ, onde C = capital, i = taxa, n = períodos. PG com q = (1+i). Aparecem em questões de investimento, dívida e inflação no ENEM.</p>`,
        },
        {
            title:'Trigonometria e Funções Trigonométricas',
            content:`<h4>Razões no triângulo retângulo</h4>
<p>sen θ = oposto/hipotenusa · cos θ = adjacente/hipotenusa · tg θ = oposto/adjacente</p>
<h4>Valores especiais</h4>
<table style="width:100%;border-collapse:collapse;font-size:12px">
<tr><th style="border:1px solid var(--border-subtle);padding:4px">θ</th><th style="border:1px solid var(--border-subtle);padding:4px">sen</th><th style="border:1px solid var(--border-subtle);padding:4px">cos</th><th style="border:1px solid var(--border-subtle);padding:4px">tg</th></tr>
<tr><td style="border:1px solid var(--border-subtle);padding:4px;text-align:center">30°</td><td style="border:1px solid var(--border-subtle);padding:4px;text-align:center">1/2</td><td style="border:1px solid var(--border-subtle);padding:4px;text-align:center">√3/2</td><td style="border:1px solid var(--border-subtle);padding:4px;text-align:center">√3/3</td></tr>
<tr><td style="border:1px solid var(--border-subtle);padding:4px;text-align:center">45°</td><td style="border:1px solid var(--border-subtle);padding:4px;text-align:center">√2/2</td><td style="border:1px solid var(--border-subtle);padding:4px;text-align:center">√2/2</td><td style="border:1px solid var(--border-subtle);padding:4px;text-align:center">1</td></tr>
<tr><td style="border:1px solid var(--border-subtle);padding:4px;text-align:center">60°</td><td style="border:1px solid var(--border-subtle);padding:4px;text-align:center">√3/2</td><td style="border:1px solid var(--border-subtle);padding:4px;text-align:center">1/2</td><td style="border:1px solid var(--border-subtle);padding:4px;text-align:center">√3</td></tr>
</table>
<h4>Identidades fundamentais</h4>
<p>sen²θ + cos²θ = 1 · tg θ = senθ/cosθ · Lei dos cossenos: a²=b²+c²−2bc·cos A</p>`,
        },
        {
            title:'Estatística — Média, Mediana, Moda e Gráficos',
            content:`<h4>Medidas de Tendência Central</h4>
<ul>
<li><strong>Média aritmética:</strong> soma dos valores ÷ quantidade. Sensível a outliers (valores extremos)</li>
<li><strong>Mediana:</strong> valor central após ordenar os dados. Mais robusta que a média para distribuições assimétricas</li>
<li><strong>Moda:</strong> valor(es) que aparece(m) com maior frequência. Pode ser bimodal, multimodal ou amodal</li></ul>
<h4>Medidas de Dispersão</h4>
<ul>
<li><strong>Amplitude:</strong> maior − menor valor</li>
<li><strong>Desvio médio:</strong> média das distâncias em relação à média</li>
<li><strong>Variância e Desvio Padrão:</strong> σ² = Σ(xᵢ−x̄)²/n · σ = √variância. Quanto maior σ, mais dispersos os dados</li></ul>
<h4>Leitura de Gráficos</h4>
<p>O ENEM adora gráficos de barras, setores (pizza), linhas e tabelas. Habilidades cobradas: interpretar proporções, calcular percentuais, comparar categorias, identificar tendências e detectar distorções visuais em gráficos manipulados.</p>`,
        },
        {
            title:'Logaritmos e Funções Exponenciais',
            content:`<h4>Logaritmo</h4>
<p>logₐb = x ↔ aˣ = b (a>0, a≠1, b>0). log₁₀ = log comum. logₑ = ln (natural).</p>
<h4>Propriedades Operatórias</h4>
<ul>
<li>log(A·B) = log A + log B</li>
<li>log(A/B) = log A − log B</li>
<li>log(Aⁿ) = n·log A</li>
<li>logₐa = 1 · logₐ1 = 0</li>
<li>Mudança de base: logₐb = log b / log a</li></ul>
<h4>Função Exponencial f(x) = aˣ</h4>
<p>Se a>1: crescente · Se 0<a<1: decrescente. Domínio: ℝ · Imagem: (0,+∞) — nunca chega a zero.</p>
<h4>Aplicações no ENEM</h4>
<ul>
<li>Escala de Richter (terremotos), pH, nível sonoro (dB) — todos escalas logarítmicas</li>
<li>Juros compostos · crescimento bacteriano · meia-vida radioativa → modelos exponenciais</li>
<li>Equações exponenciais: iguale as bases ou aplique log em ambos os lados</li></ul>`,
        },
        {
            title:'Grandezas, Proporcionalidade e Regra de Três',
            content:`<h4>Grandezas Proporcionais</h4>
<ul>
<li><strong>Diretamente proporcionais:</strong> uma aumenta → outra aumenta na mesma razão. Razão k = y/x constante. Gráfico: reta pela origem com a>0.</li>
<li><strong>Inversamente proporcionais:</strong> uma aumenta → outra diminui. Produto k = xy constante. Gráfico: hipérbole.</li></ul>
<h4>Regra de Três Simples</h4>
<p>Montar proporção: se direta → mesmos sentidos / se inversa → sentidos opostos. Sempre conferir se faz sentido no contexto do problema.</p>
<h4>Regra de Três Composta</h4>
<p>Envolve mais de duas grandezas. Analise cada uma: direta ou inversamente proporcional à grandeza pedida. Montar produto de razões.</p>
<h4>Porcentagem e Variação</h4>
<ul>
<li>Acréscimo de p%: multiplicar por (1 + p/100)</li>
<li>Desconto de p%: multiplicar por (1 − p/100)</li>
<li>Dois descontos de 20%: 0,8 × 0,8 = 0,64 → desconto total de 36%, não 40%!</li>
<li>Variação percentual: (Vf − Vi) / Vi × 100%</li></ul>`,
        },
    ]},
};

let _fcCards = [...FLASHCARDS];
let _fcIdx   = 0;
let _fcKnown = new Set();      // índices originais dominados
let _fcDifficult = new Set();  // índices originais confusos
let _fcDisc  = '';
let _fcLvl   = 0;
let _fcReviewMode = false;     // true = modo "Revisar confusos"
let _tutorMessages = [];

function renderConteudo() {
    // Inicializar flashcards na primeira vez
    if (_fcCards.length === 0) _fcCards = [...FLASHCARDS];
    renderCurrentFlashcard();
    renderResumosPanel();

    // Mensagem inicial do tutor — recupera histórico da sessão se houver
    if (_tutorMessages.length === 0) {
        try {
            const saved = sessionStorage.getItem('tutor_history');
            if (saved) _tutorMessages = JSON.parse(saved);
        } catch {}
    }
    if (_tutorMessages.length === 0) {
        _tutorMessages = [{
            role: 'ai',
            text: 'Olá! Sou o **Tutor IA** do ENEM Master 🎓\n\nPosso te explicar qualquer assunto do ENEM: *Matemática, Física, Química, Biologia, Humanas, Linguagens e Redação*.\n\nUse as sugestões acima ou faça sua pergunta! 👆',
        }];
    }
    _renderTutorMessages();
}

function switchConteudoTab(tab, btn) {
    document.querySelectorAll('.conteudo-tab').forEach(t => t.classList.remove('active'));
    // Oculta todos os painéis respeitando o display correto de cada um
    document.querySelectorAll('.conteudo-panel').forEach(p => {
        p.classList.remove('active');
        p.style.display = 'none';
    });
    btn.classList.add('active');
    const panel = document.getElementById(`conteudo-panel-${tab}`);
    if (panel) {
        panel.classList.add('active');
        // Tutor precisa de flex para funcionar corretamente
        panel.style.display = (tab === 'tutor') ? 'flex' : 'block';
    }
    if (tab === 'resumos') renderResumosPanel();
    if (tab === 'progresso') renderProgressoPanel();
}

// ── Progresso ─────────────────────────────────────────────────────────────────
function renderProgressoPanel() {
    // Streak
    const streak = (state.user && state.user.streak) || 0;
    const streakEl = document.getElementById('prog-streak-num');
    if (streakEl) streakEl.textContent = streak;

    // Barras por disciplina
    const discs = ['humanas', 'natureza', 'linguagens', 'matematica'];
    const discIcons  = { humanas: '🌍', natureza: '🔬', linguagens: '📝', matematica: '➗' };
    const discNames  = { humanas: 'Humanas', natureza: 'Natureza', linguagens: 'Linguagens', matematica: 'Matemática' };
    const discColors = { humanas: 'var(--teal)', natureza: '#a78bfa', linguagens: 'var(--gold)', matematica: '#f97316' };

    const barsEl = document.getElementById('prog-disc-bars');
    if (barsEl) {
        barsEl.innerHTML = discs.map(disc => {
            const indices = FLASHCARDS.reduce((acc, fc, i) => { if (fc.disc === disc) acc.push(i); return acc; }, []);
            const total = indices.length;
            const known = indices.filter(i => _fcKnown.has(i)).length;
            const pct   = total > 0 ? Math.round((known / total) * 100) : 0;
            return `<div class="prog-bar-row">
  <div class="prog-bar-label">
    <span>${discIcons[disc]} ${discNames[disc]}</span>
    <span class="prog-bar-pct">${pct}% <small>${known}/${total}</small></span>
  </div>
  <div class="prog-bar-track"><div class="prog-bar-fill" style="width:${pct}%;background:${discColors[disc]}"></div></div>
</div>`;
        }).join('');
    }

    // Top 3 tópicos com mais erros
    const errorMap = {};
    _fcDifficult.forEach(i => {
        const fc = FLASHCARDS[i];
        if (!fc) return;
        errorMap[fc.area] = (errorMap[fc.area] || 0) + 1;
    });
    const sorted = Object.entries(errorMap).sort((a, b) => b[1] - a[1]).slice(0, 3);
    const errorsEl = document.getElementById('prog-top-errors');
    if (errorsEl) {
        if (sorted.length === 0) {
            errorsEl.innerHTML = '<li class="prog-no-errors">Nenhum cartão marcado como "confuso" ainda.</li>';
        } else {
            errorsEl.innerHTML = sorted.map(([area, count], idx) =>
                `<li class="prog-error-item">
  <span class="prog-error-rank">${idx + 1}</span>
  <span class="prog-error-area">${area}</span>
  <span class="prog-error-count">${count} ${count === 1 ? 'erro' : 'erros'}</span>
</li>`).join('');
        }
    }
}

// ── Flashcards ────────────────────────────────────────────────────────────────
function selectFlashcardDisc(btn, disc) {
    document.querySelectorAll('#conteudo-panel-flashcard .topic-chip, #conteudo-panel-flashcard .fc-disc-btn').forEach(c => c.classList.remove('selected'));
    btn.classList.add('selected');
    _fcIdx   = 0;
    _fcKnown = new Set();
    _fcDifficult = new Set();
    _fcReviewMode = false;
    _fcDisc  = disc;
    _applyFlashcardFilters();
}

function selectFlashcardLvl(btn, lvl) {
    document.querySelectorAll('.fc-lvl-chip').forEach(c => {
        c.style.fontWeight = '700';
        c.style.opacity = '0.7';
    });
    btn.style.opacity = '1';
    btn.style.fontWeight = '900';
    _fcIdx   = 0;
    _fcKnown = new Set();
    _fcDifficult = new Set();
    _fcReviewMode = false;
    _fcLvl   = lvl;
    _applyFlashcardFilters();
}

function _applyFlashcardFilters() {
    _fcCards = FLASHCARDS.filter(c => {
        const discOk = !_fcDisc || c.disc === _fcDisc;
        const lvlOk  = !_fcLvl  || c.lvl  === _fcLvl;
        return discOk && lvlOk;
    });
    if (!_fcCards.length) {
        _showQuickToast('Nenhum card com esses filtros 😅');
        _fcCards = FLASHCARDS;
    }
    _fcIdx = 0;
    renderCurrentFlashcard();
}

function renderCurrentFlashcard() {
    if (!_fcCards.length) return;
    const card = _fcCards[_fcIdx];

    const fcEl = document.getElementById('flashcard');
    if (fcEl) fcEl.classList.remove('flipped');

    const areaEl      = document.getElementById('fc-area');
    const qEl         = document.getElementById('fc-question');
    const aEl         = document.getElementById('fc-answer');
    const areaBackEl  = document.getElementById('fc-area-back');
    const counterEl   = document.getElementById('fc-counter');
    const knownLbl    = document.getElementById('fc-known-label');
    const difficultLbl= document.getElementById('fc-difficult-label');
    const lvlBadge    = document.getElementById('fc-lvl-badge');
    const reviewBtn   = document.getElementById('fc-review-btn');
    const segKnown    = document.getElementById('fc-seg-known');
    const segDifficult= document.getElementById('fc-seg-difficult');

    if (areaEl)     areaEl.textContent     = card.area;
    if (qEl)        qEl.textContent        = card.q;
    if (aEl)        aEl.textContent        = card.a;
    if (areaBackEl) areaBackEl.textContent = card.area;
    if (counterEl)  counterEl.textContent  = `${_fcIdx + 1} / ${_fcCards.length}`;

    // Barra segmentada: calcula % de dominados e confusos no deck atual
    const total = _fcCards.length;
    const knownPct     = total ? (_fcKnown.size     / total) * 100 : 0;
    const difficultPct = total ? (_fcDifficult.size / total) * 100 : 0;
    if (segKnown)     segKnown.style.width     = knownPct + '%';
    if (segDifficult) segDifficult.style.width = difficultPct + '%';

    // Legenda
    if (knownLbl)     knownLbl.textContent     = `${_fcKnown.size} dominados`;
    if (difficultLbl) difficultLbl.textContent = `${_fcDifficult.size} confusos`;

    // Mostrar botão Revisar confusos somente se houver confusos e não estiver no modo review
    if (reviewBtn) {
        if (_fcDifficult.size > 0 && !_fcReviewMode) {
            reviewBtn.style.display = 'inline-flex';
            reviewBtn.textContent   = `🔁 Revisar ${_fcDifficult.size} confuso${_fcDifficult.size > 1 ? 's' : ''}`;
        } else if (_fcReviewMode) {
            reviewBtn.style.display = 'inline-flex';
            reviewBtn.textContent   = '← Todos os cards';
        } else {
            reviewBtn.style.display = 'none';
        }
    }

    if (lvlBadge) {
        const lvlMap = {
            1: { label:'FÁCIL',   color:'#4ade80', bg:'rgba(74,222,128,0.15)' },
            2: { label:'MÉDIO',   color:'#fbbf24', bg:'rgba(251,191,36,0.15)' },
            3: { label:'DIFÍCIL', color:'#f87171', bg:'rgba(248,113,113,0.15)' },
        };
        const lvl = lvlMap[card.lvl] || lvlMap[1];
        lvlBadge.textContent        = lvl.label;
        lvlBadge.style.color        = lvl.color;
        lvlBadge.style.background   = lvl.bg;
        lvlBadge.style.border       = `1px solid ${lvl.color}55`;
    }
}

function flipFlashcard() {
    const el = document.getElementById('flashcard');
    if (el) el.classList.toggle('flipped');
}

function nextFlashcard() {
    if (_fcIdx < _fcCards.length - 1) {
        _fcIdx++;
    } else {
        _showQuickToast('🎉 Você revisou todos os flashcards!');
        _fcIdx = 0;
    }
    renderCurrentFlashcard();
}

function prevFlashcard() {
    if (_fcIdx > 0) { _fcIdx--; renderCurrentFlashcard(); }
}

function rateFlashcard(known) {
    const globalIdx = FLASHCARDS.indexOf(_fcCards[_fcIdx]);
    if (known) {
        _fcKnown.add(globalIdx);
        _fcDifficult.delete(globalIdx);
        _showQuickToast(`✅ Dominado! ${_fcKnown.size} de ${_fcCards.length}`);
    } else {
        _fcDifficult.add(globalIdx);
        _fcKnown.delete(globalIdx);
        _showQuickToast(`📖 Anotado para revisar`);
    }
    nextFlashcard();
}

function toggleReviewDifficult() {
    if (_fcReviewMode) {
        // Sair do modo revisar
        _fcReviewMode = false;
        _fcIdx = 0;
        _fcKnown     = new Set();
        _applyFlashcardFilters();
        _showQuickToast('📋 Voltando a todos os cards');
    } else {
        // Entrar no modo revisar: filtra apenas os confusos
        const difficultCards = [..._fcDifficult].map(i => FLASHCARDS[i]).filter(Boolean);
        if (!difficultCards.length) { _showQuickToast('Nenhum card marcado como confuso ainda!'); return; }
        _fcReviewMode = true;
        _fcCards = difficultCards;
        _fcIdx   = 0;
        _showQuickToast(`🔁 Revisando ${difficultCards.length} card${difficultCards.length > 1 ? 's' : ''} confuso${difficultCards.length > 1 ? 's' : ''}`);
        renderCurrentFlashcard();
    }
}

// ── Resumos ────────────────────────────────────────────────────────────────────
// Carrega IDs de tópicos estudados do localStorage
function _loadStudiedTopics() {
    try { return new Set(JSON.parse(localStorage.getItem('resumos_studied') || '[]')); }
    catch { return new Set(); }
}
function _saveStudiedTopics(set) {
    try { localStorage.setItem('resumos_studied', JSON.stringify([...set])); } catch {}
}

function renderResumosPanel() {
    const listEl = document.getElementById('resumos-list');
    if (!listEl || listEl.children.length > 0) return; // só renderiza uma vez

    const studied = _loadStudiedTopics();

    Object.entries(RESUMOS).forEach(([disc, data]) => {
        const discBtn = document.createElement('button');
        discBtn.className = 'resumo-disc-btn';

        // Conta tópicos estudados desta disciplina
        const studiedCount = data.topics.filter((_, i) => studied.has(`${disc}_${i}`)).length;
        const allStudied = studiedCount === data.topics.length;

        discBtn.innerHTML = `
            <span class="resumo-disc-icon">${data.icon}</span>
            <div style="flex:1">
                <p class="resumo-disc-name">${data.name}</p>
                <p class="resumo-disc-sub">${studiedCount > 0 ? `${studiedCount}/${data.topics.length} estudados` : `${data.topics.length} tópicos`}</p>
            </div>
            ${allStudied ? '<span style="font-size:11px;font-weight:700;color:#4ade80">&#10003; Completo</span>' : ''}
            <span class="resumo-disc-arrow">›</span>`;
        discBtn.onclick = () => _toggleResumoDisc(disc, discBtn);
        listEl.appendChild(discBtn);

        const contentEl = document.createElement('div');
        contentEl.className = 'resumo-content';
        contentEl.id = `resumo-content-${disc}`;

        data.topics.forEach((topic, i) => {
            const topicKey = `${disc}_${i}`;
            const isStudied = studied.has(topicKey);

            const topicDiv = document.createElement('div');
            topicDiv.className = 'resumo-topic-wrap';
            topicDiv.dataset.key = topicKey;

            const h4 = document.createElement('h4');
            h4.textContent = topic.title;
            topicDiv.appendChild(h4);

            const body = document.createElement('div');
            body.innerHTML = typeof DOMPurify !== 'undefined' ? DOMPurify.sanitize(topic.content) : topic.content;
            topicDiv.appendChild(body);

            // Botão Marcar como estudado
            const markBtn = document.createElement('button');
            markBtn.className = `resumo-mark-btn${isStudied ? ' studied' : ''}`;
            markBtn.textContent = isStudied ? '✓ Estudado' : 'Marcar como estudado';
            markBtn.onclick = () => _toggleTopicStudied(topicKey, markBtn, disc);
            topicDiv.appendChild(markBtn);

            contentEl.appendChild(topicDiv);
        });

        listEl.appendChild(contentEl);
    });

    // Barra de leitura: atualiza ao rolar o painel
    const panel = document.getElementById('conteudo-panel-resumos');
    const bar   = document.getElementById('resumo-read-bar');
    if (panel && bar) {
        panel.addEventListener('scroll', () => {
            const max = panel.scrollHeight - panel.clientHeight;
            bar.style.width = max > 0 ? `${(panel.scrollTop / max) * 100}%` : '0%';
        }, { passive: true });
    }
}

function _toggleResumoDisc(disc, btn) {
    const content = document.getElementById(`resumo-content-${disc}`);
    if (!content) return;
    const isOpen = content.classList.contains('open');

    document.querySelectorAll('.resumo-content').forEach(c => c.classList.remove('open'));
    document.querySelectorAll('.resumo-disc-arrow').forEach(a => a.textContent = '›');

    if (!isOpen) {
        content.classList.add('open');
        const arrow = btn.querySelector('.resumo-disc-arrow');
        if (arrow) arrow.textContent = '˅';
    }
}

function _toggleTopicStudied(key, btn, disc) {
    const studied = _loadStudiedTopics();
    if (studied.has(key)) {
        studied.delete(key);
        btn.textContent = 'Marcar como estudado';
        btn.classList.remove('studied');
    } else {
        studied.add(key);
        btn.textContent = '✓ Estudado';
        btn.classList.add('studied');
        _showQuickToast('✅ Tópico marcado como estudado!');
    }
    _saveStudiedTopics(studied);

    // Atualiza contador na disciplina correspondente
    const data = RESUMOS[disc];
    if (!data) return;
    const discBtn = document.querySelector(`button.resumo-disc-btn[onclick*="'${disc}'"]`) ||
        [...document.querySelectorAll('.resumo-disc-btn')].find(b => b.onclick && b.onclick.toString().includes(`'${disc}'`));
    if (discBtn) {
        const studiedCount = data.topics.filter((_, i) => studied.has(`${disc}_${i}`)).length;
        const subEl = discBtn.querySelector('.resumo-disc-sub');
        if (subEl) subEl.textContent = studiedCount > 0 ? `${studiedCount}/${data.topics.length} estudados` : `${data.topics.length} tópicos`;
        const allStudied = studiedCount === data.topics.length;
        let completeTag = discBtn.querySelector('.resumo-complete-tag');
        if (allStudied && !completeTag) {
            completeTag = document.createElement('span');
            completeTag.className = 'resumo-complete-tag';
            completeTag.style.cssText = 'font-size:11px;font-weight:700;color:#4ade80';
            completeTag.textContent = '✓ Completo';
            discBtn.insertBefore(completeTag, discBtn.querySelector('.resumo-disc-arrow'));
        } else if (!allStudied && completeTag) {
            completeTag.remove();
        }
    }
}

// ── Tutor IA ──────────────────────────────────────────────────────────────────
const _TUTOR_KB = {

    // ════════════════════════════════════════════════════════════════════════
    // MATEMÁTICA
    // ════════════════════════════════════════════════════════════════════════

    'matem[aá]tic.*b[aá]sic|b[aá]sic.*matem|num[eé]ros.*inteiros|opera[cç][oõ]es.*b[aá]sic|aritm[eé]tic':
        '**Matemática Básica — Aritmética:**\n\n**Números Inteiros:** ℤ = {..., -2, -1, 0, 1, 2, ...}. Soma/subtração: sinais iguais → mantém o sinal; sinais diferentes → subtrai e usa o sinal do maior.\n\n**Frações:** a/b. Soma de frações: mmc dos denominadores. Multiplicação: numerador × numerador, denominador × denominador. Divisão: multiplica pelo inverso.\n\n**Potências:** aⁿ = a×a×...×a (n vezes). Regras: aⁿ × aᵐ = aⁿ⁺ᵐ; aⁿ / aᵐ = aⁿ⁻ᵐ; (aⁿ)ᵐ = aⁿ×ᵐ; a⁰ = 1; a⁻ⁿ = 1/aⁿ.\n\n**MMC/MDC:** MDC = maior divisor comum (algoritmo de Euclides). MMC = produto / MDC. Usados para somar frações e resolver problemas de ciclos.',

    'fra[cç][aã]o|fra[cç][oõ]es|numerador|denominador|num.*misto|equiv.*fra':
        '**Frações:**\n\nFração a/b: *a* = numerador; *b* = denominador (b ≠ 0). **Operações:**\n\nSoma/subtração: a/b ± c/d = (ad ± bc) / bd (ou use o MMC). Multiplicação: (a/b) × (c/d) = ac/bd. Divisão: (a/b) ÷ (c/d) = (a/b) × (d/c).\n\n**Número misto:** 2½ = 5/2. **Comparação:** mesme denominador → maior numerador é maior. **Simplificação:** divida numerador e denominador pelo MDC deles.',

    'pot[eê]ncia|raiz.*quadrad|radical|expoente|raiz.*c[uú]bic':
        '**Potências e Radicais:**\n\nPotências: aⁿ×aᵐ = aⁿ⁺ᵐ; aⁿ/aᵐ = aⁿ⁻ᵐ; (aⁿ)ᵐ = aⁿᵐ; a⁰=1; a⁻¹=1/a.\n\nRaízes: √a = a^(1/2); ∛a = a^(1/3). Produto: √a × √b = √(ab). Divisão: √a/√b = √(a/b).\n\nRadicais com índice: ⁿ√aᵐ = a^(m/n). Para racionalizar denominador: multiplique por √a/√a.',

    'mmc|mdc|m[áa]ximo.*comun|m[íi]nimo.*m[uú]ltiplo|m[uú]ltiplo|divisor|divis[íi]vel|fator.*prim':
        '**MMC e MDC:**\n\n**Fatores primos:** decompor em produto de primos (ex: 12 = 2²×3; 18 = 2×3²).\n\n**MDC** (máximo divisor comum): produto dos primos **comuns** com **menor** expoente. Ex: MDC(12,18) = 2¹×3¹ = 6.\n\n**MMC** (mínimo múltiplo comum): produto de **todos** os primos com **maior** expoente. Ex: MMC(12,18) = 2²×3² = 36.\n\n**Regras de divisibilidade:** ÷2: par; ÷3: soma dos dígitos ÷3; ÷5: termina em 0 ou 5; ÷9: soma dos dígitos ÷9; ÷10: termina em 0.',

    'porcentagem|desconto|acr[eé]scimo|taxa.*porcen|percent':
        '**Porcentagem:**\n\nx% de y = (x/100)×y. Ex: 15% de 200 = 30.\n\n**Acréscimo de p%:** multiplica por (1 + p/100). Ex: R$100 + 20% = 100×1,2 = R$120.\n**Desconto de p%:** multiplica por (1 − p/100). Ex: R$100 − 30% = 100×0,7 = R$70.\n\n**Atenção:** dois descontos de 20% NÃO equivalem a 40%! 0,8×0,8 = 0,64 → desconto real de 36%.\n\n**Variação percentual:** (novo − velho) / velho × 100%.',

    'regra.*tr[eê]s|propor[cç][aã]o|proporcional|grandeza':
        '**Regra de Três:**\n\n**Direta:** grandezas crescem juntas. Se a/b = c/d → a×d = b×c.\n**Inversa:** uma cresce, a outra diminui. Se a×b = c×d.\n\nMonte sempre a tabela: escreva grandeza 1 em uma coluna e grandeza 2 na outra, mantendo as unidades. Ex: 5 kg custam R$20, quanto custam 8 kg? → 5/8 = 20/x → x = R$32.',

    'estat[íi]stic|m[eé]dia|mediana|moda|desvio.*padr|vari[aâ]ncia|quartil':
        '**Estatística:**\n\n**Média aritmética** = soma dos valores / quantidade (sensível a valores extremos).\n**Mediana** = valor central após ordenar (robusta a extremos). N ímpar: central; N par: média dos dois centrais.\n**Moda** = valor mais frequente (pode ser a-, uni-, bi- ou multimodal).\n\n**Desvio padrão (σ):** mede dispersão dos dados em torno da média. σ alto = dados espalhados; σ baixo = dados concentrados.\n\nNo ENEM: compare médias de grupos, identifique qual medida é mais adequada (distribuição assimétrica → mediana é mais representativa).',

    'pit[aá]goras|cat[eê]to|hipotenusa':
        'O **Teorema de Pitágoras**: em triângulo retângulo, **a² = b² + c²**, onde *a* = hipotenusa e *b, c* = catetos. Exemplo: catetos 3 e 4 → hipotenusa = √(9+16) = **5**.\n\n**Ternos pitagóricos comuns:** (3,4,5), (5,12,13), (8,15,17), (7,24,25). Multiplique por qualquer constante: (6,8,10) também é ternos.\n\n**Aplicações:** diagonal de retângulo, distância entre pontos, altura do triângulo equilátero (h = l√3/2).',

    'bhaskara|equa[cç][aã]o.*segundo grau|fun[cç][aã]o.*quadr|par[aá]bola|v[eé]rtice.*par':
        'A **Fórmula de Bhaskara** resolve ax²+bx+c=0: **x = (−b ± √Δ) / 2a**, onde **Δ = b²−4ac**.\n\nΔ>0: 2 raízes reais e distintas; Δ=0: 1 raiz dupla (x = −b/2a); Δ<0: sem raízes reais.\n\n**Função Quadrática** f(x) = ax²+bx+c: parábola abre p/ cima se a>0, p/ baixo se a<0. **Vértice:** xₓ = −b/2a; yₓ = −Δ/4a. **Raízes** (somente quando Δ≥0): fórmula de Bhaskara. **Soma das raízes:** x₁+x₂ = −b/a; **Produto:** x₁×x₂ = c/a.',

    'probabilidade|evento|espa[cç]o.*amostral|favor[aá]vel':
        '**Probabilidade:** P(A) = nº de casos favoráveis / nº de casos possíveis. P ∈ [0,1].\n\n**Complementar:** P(A̅) = 1 − P(A). **Interseção (E):** P(A∩B). **União (OU):** P(A∪B) = P(A)+P(B)−P(A∩B).\n\n**Eventos independentes:** P(A∩B) = P(A)×P(B). **Condicional:** P(A|B) = P(A∩B)/P(B).\n\nExemplos clássicos: moeda → P(cara)=1/2; dado → P(4)=1/6; urnas (sem e com reposição).',

    'combinat|fatorial|arranjo|permut':
        '**Análise Combinatória:**\n\n**Princípio Fundamental:** n₁×n₂×...×nₖ possibilidades.\n\n**Fatorial:** n! = n×(n−1)×...×1. Ex: 5!=120. 0!=1.\n\n**Permutação simples** Pₙ=n! (anagramas, arranjar n elementos distintos em n postos).\n\n**Arranjo** A(n,p) = n!/(n−p)! — a ORDEM importa (senhas, pódio). Ex: pódio de 3 em 5 atletas: A(5,3)=60.\n\n**Combinação** C(n,p) = n!/[p!×(n−p)!] — ordem NÃO importa (grupos, comissões). Ex: comissão de 3 de 5: C(5,3)=10.',

    'fun[cç][aã]o.*afim|fun[cç][aã]o.*primeiro grau|fun[cç][aã]o.*linear|coef.*angular':
        '**Função Afim** f(x) = ax+b:\n\na > 0 → crescente; a < 0 → decrescente; a = 0 → constante.\n**Zero (raiz):** x = −b/a (onde a reta corta o eixo x).\n**Coeficiente angular (a):** inclinação da reta; a = (y₂−y₁)/(x₂−x₁).\n**Coeficiente linear (b):** ponto onde a reta corta o eixo y.\n\n**Retas paralelas:** mesma inclinação (a₁=a₂, b₁≠b₂). **Perpendiculares:** a₁×a₂ = −1.',

    'logaritmo|log[₁₀]?\\b|expo?nenci':
        '**Logaritmo:** logₐb = x ↔ aˣ = b (a>0, a≠1, b>0).\n\nPropriedades: log(AB)=logA+logB; log(A/B)=logA−logB; log(Aⁿ)=n×logA; logₐa=1; logₐ1=0.\n\n**Mudança de base:** logₐb = logₓb / logₓa (use log₁₀ ou ln).\n\n**Função exponencial** f(x) = aˣ: b>1 → crescente; 0<b<1 → decrescente. É a inversa do log.\n\n**Aplicações:** pH = −log[H⁺], escala Richter, decibéis, meia-vida, juros compostos.',

    'trigon|seno|cosseno|tangente|secan|co?se?c[an]':
        '**Trigonometria no Triângulo Retângulo (SOH-CAH-TOA):**\n\nsen θ = oposto/hipotenusa; cos θ = adjacente/hipotenusa; tg θ = sen/cos.\n\n**Valores notáveis:**\n30°: sen=1/2, cos=√3/2, tg=√3/3\n45°: sen=cos=√2/2, tg=1\n60°: sen=√3/2, cos=1/2, tg=√3\n\n**Identidades:** sen²θ+cos²θ=1; 1+tg²θ=sec²θ.\n\n**Lei dos Senos:** a/senA = b/senB = c/senC.\n**Lei dos Cossenos:** a² = b²+c²−2bc×cosA.',

    'juros.*compost|juros.*simples|montante|capital.*financ':
        '**Juros:**\n\n**Simples:** M = C×(1+i×t). Os juros incidem só sobre o capital inicial.\n**Compostos:** M = C×(1+i)ⁿ. Juros incidem sobre o saldo acumulado ("juros sobre juros"). É uma PG de razão q=(1+i).\n\nExemplo: R$1000 a 5% a.m. por 3 meses:\nSimples: M = 1000×(1+0,05×3) = R$1150\nCompostos: M = 1000×(1,05)³ = R$1157,63\n\nOs juros compostos sempre rendem mais. Dominam: financiamentos, poupança, crédito rotativo.',

    'geometria.*plana|[aá]rea.*fig|volume.*s[oó]lido|peri[mí]metro|circunfer|pol[íi]gon':
        '**Geometria Plana — Áreas:**\n\nQuadrado: A=l²; Retângulo: A=bh; Triângulo: A=bh/2; Paralelogramo: A=bh; Trapézio: A=(B+b)h/2; Círculo: A=πr², C=2πr.\n\n**Volumes:**\nCubo: V=a³; Paralelepípedo: V=abc; Cilindro: V=πr²h; Cone: V=πr²h/3; Esfera: V=4πr³/3; Pirâmide: V=Abase×h/3.\n\n**Relação de Euler (poliedros):** V−A+F=2.',

    'geometria.*an[aá]l|ponto.*plano.*cart|dist[aâ]ncia.*ponto|equa[cç][aã]o.*reta|equa[cç][aã]o.*circunf':
        '**Geometria Analítica:**\n\n**Distância entre pontos:** d = √[(x₂−x₁)²+(y₂−y₁)²].\n**Ponto médio:** M = ((x₁+x₂)/2, (y₁+y₂)/2).\n**Equação da reta:** y=ax+b (forma reduzida) ou ax+by+c=0 (forma geral).\n**Coeficiente angular:** a = (y₂−y₁)/(x₂−x₁) = tgθ.\n\n**Circunferência:** (x−a)²+(y−b)²=r² com centro (a,b) e raio r.\n\n**Distância de ponto P(x₀,y₀) à reta ax+by+c=0:** d = |ax₀+by₀+c| / √(a²+b²).',

    'PA|progress[aã]o.*aritm|sequ[eê]ncia.*aritm|soma.*PA':
        '**Progressão Aritmética (PA):**\n\nSequência com diferença constante *r* entre termos consecutivos.\n**Termo geral:** aₙ = a₁ + (n−1)×r.\n**Soma dos n primeiros termos:** Sₙ = n×(a₁+aₙ)/2 = n×(2a₁+(n−1)r)/2.\n\nEx: PA (3, 7, 11, 15, ...) → r=4. O 10º termo: a₁₀ = 3+(10−1)×4 = 39. Soma dos 10 primeiros: S₁₀ = 10×(3+39)/2 = 210.',

    'PG|progress[aã]o.*geom|sequ[eê]ncia.*geom|raz[aã]o.*PG':
        '**Progressão Geométrica (PG):**\n\nSequência onde cada termo = anterior × razão q.\n**Termo geral:** aₙ = a₁×qⁿ⁻¹.\n**Soma dos n primeiros termos (q≠1):** Sₙ = a₁×(qⁿ−1)/(q−1).\n**Soma infinita (|q|<1):** S∞ = a₁/(1−q).\n\nEx: PG (2, 6, 18, 54, ...) → q=3. O 5º termo: a₅=2×3⁴=162.\n\n**Modela:** juros compostos, crescimento populacional, meia-vida radioativa, divisão celular.',

    'matriz|determinante|sistema.*linear|cramer|elimina[cç][aã]o|gauss':
        '**Matrizes e Sistemas Lineares:**\n\n**Matriz** m×n: tabela de m linhas e n colunas. Adição: soma elemento a elemento (mesma ordem). Multiplicação A×B: só se colunas(A)=linhas(B).\n\n**Determinante 2×2:** det(A) = ad−bc. **Cofatores** para 3×3 (Regra de Sarrus).\n\n**Sistema 2×2:**\n2x+y=5 / x−y=1 → Substituição: y=x−1 → 2x+(x−1)=5 → x=2, y=1.\nMétodo da adição: some as equações para eliminar uma variável.\n\n**Classificação:** SPD (det≠0, 1 solução), SPI (infinitas), SI (impossível).',

    'fun[cç][aã]o.*modular|m[oó]dulo.*fun[cç]|valor.*absolut':
        '**Função Modular** f(x) = |x|:\n\n|x| = x se x≥0; |x| = −x se x<0. Gráfico: V aberto para cima com vértice na origem.\n\n**Equação |x| = a (a>0):** x=a OU x=−a.\n**Inequação |x| < a:** −a < x < a.\n**Inequação |x| > a:** x < −a ou x > a.\n\n**Cuidado:** |x+b| = a → x+b = ±a → duas equações. Sempre verifique se as soluções satisfazem o domínio.',

    'pa.*pg|matem.*geral|o que.*estudar.*matem|t[oó]picos.*matem|resumo.*matem':
        '**Matemática no ENEM — Tópicos pricipais:**\n\n1. Aritmética: frações, potências, MMC/MDC, porcentagem, razão e proporção\n2. Álgebra: equações 1º e 2º grau, inequações, sistemas lineares, funções (afim, quadrática, exponencial, logarítmica, modular)\n3. Geometria plana: áreas, perímetros, semelhança, Pitágoras, trigonometria\n4. Geometria espacial: volumes e áreas de sólidos\n5. Geometria analítica: distâncias, retas, circunferência\n6. Estatística e Probabilidade: média, mediana, moda, combinatória\n7. Progressões: PA e PG, juros compostos\n8. Matrizes e Determinantes (raramente, mas aparece)',

    // ════════════════════════════════════════════════════════════════════════
    // FÍSICA
    // ════════════════════════════════════════════════════════════════════════

    'lei.*newton|for[cç]a.*massa|din[aâ]mic|newton.*lei':
        '**Leis de Newton (Mecânica):**\n\n**1ª Lei (Inércia):** corpo em repouso ou MRU permanece assim se a resultante de forças for zero.\n**2ª Lei (F=ma):** resultante F = m×a. Se F=10N, m=2kg → a=5 m/s².\n**3ª Lei (Ação e reação):** toda força tem uma reação igual e oposta em outro corpo.\n\n**Peso:** P=m×g (g≈10 m/s²). **Força de atrito:** f=μ×N (μ=coef. de atrito, N=normal). **Força elástica (Hooke):** F=k×x.',

    'cinem[aá]tica|velocidade|acelera[cç][aã]o|MRU|MRUV|queda.*livre|lan[cç]amento':
        '**Cinemática:**\n\n**MRU** (movimento retilíneo uniforme): a=0, v=cte. s = s₀ + v×t.\n**MRUV** (acelerado/desacelerado): s = s₀+v₀t+½at²; v = v₀+at; v²=v₀²+2aΔs.\n\n**Queda livre:** v₀=0, a=g≈10m/s². Tempo de queda: t=√(2h/g). Velocidade ao tocar: v=√(2gh).\n\n**Lançamento horizontal:** horizontal → MRU (v_x=cte); vertical → queda livre. Alcance R=v₀²sen(2θ)/g. Altura máx: H=v₀²sen²θ/(2g).',

    '[oó]ptica|reflex[aã]o|refra[cç][aã]o|lente|espelho|[íi]ndice.*refra[cç]':
        '**Óptica:**\n\n**Reflexão:** ângulo de incidência = ângulo de reflexão. Espelhos planos: imagem virtual, direita e simétrica. Espelhos côncavos/convexos: equação de Gauss 1/f = 1/p + 1/p\'.\n\n**Refração:** Snell-Descartes: n₁×sen(i) = n₂×sen(r). Índice de refração n = c/v. Quanto maior n, menor a velocidade da luz no meio.\n\n**Lentes:** convergente (convexas) formam imagens reais se objeto além do foco; divergente (côncavas) sempre imagem virtual.\n\n**Dispersão:** prisma → decomposição da luz branca (ROYGBIV).',

    'ondas|freq[uü][eê]ncia|comprimento.*onda|amplitude|per[íi]odo.*onda|som|veloc.*onda':
        '**Ondas:**\n\nEquação fundamental: **v = λ×f** (velocidade = comprimento de onda × frequência). Período T = 1/f.\n\n**Tipos:** Mecânicas (precisam de meio — som) × Eletromagnéticas (não precisam — luz, rádio). Transversais (vibração ⊥ propagação — luz) × Longitudinais (vibração ∥ propagação — som).\n\n**Som:** v≈340 m/s no ar; grave → baixa freq; agudo → alta freq. Intensidade em dB. Efeito Doppler: fonte se aproxima → freq percebida sobe.',

    'campo.*mag|indu[cç][aã]o.*eletromag|faraday|lenz|transforma|gerador|motor':
        '**Eletromagnetismo:**\n\n**Lei de Faraday:** variação do fluxo magnético (Φ=B×A×cosθ) induz uma fem = −ΔΦ/Δt. Base de geradores, transformadores e motores elétricos.\n\n**Lei de Lenz:** a corrente induzida sempre se opõe à variação que a gerou (conservação de energia).\n\n**Transformador:** V₁/V₂ = N₁/N₂. Step-up: aumenta tensão, diminui corrente. Step-down: ao contrário.\n\n**Força magnética sobre corrente:** F = B×I×L×senθ. Força sobre carga: F = q×v×B×senθ (regra da mão direita).',

    'termodin[aâ]mica|calor|entropia|carnot|temperat|dilatação|press[aã]o.*gas':
        '**Termodinâmica:**\n\n**1ª Lei:** ΔU = Q − W (variação da energia interna = calor absorvido − trabalho). Conservação de energia.\n**2ª Lei:** calor flui espontaneamente do quente para o frio; entropia total do universo nunca diminui.\n\n**Rendimento de Carnot (máximo teórico):** η = 1 − T_fria/T_quente (temperaturas em **Kelvin!** K = °C + 273).\n\n**Gases ideais:** P×V = n×R×T (R=8,31 J/mol·K). P₁V₁/T₁ = P₂V₂/T₂.\n\n**Dilatação linear:** ΔL = L₀×α×ΔT.',

    'relatividade|einstein|e.*mc[²2]|velocidade.*luz|tempo.*relativ':
        '**Relatividade (Einstein):**\n\n**Relatividade Especial (1905):** dois postulados: (1) leis da física são iguais em todos os referenciais inerciais; (2) velocidade da luz c ≈ 3×10⁸ m/s é constante em qualquer referencial.\n\n**Consequências:** dilatação do tempo (Δt\' = γΔt), contração do espaço (L\' = L/γ), adição de velocidades relativística. **E = mc²**: massa equivale a energia. γ = 1/√(1−v²/c²).\n\n**Relatividade Geral (1915):** gravidade é curvatura do espaço-tempo. Previu buracos negros, ondas gravitacionais e expansão do universo.',

    // ════════════════════════════════════════════════════════════════════════
    // QUÍMICA
    // ════════════════════════════════════════════════════════════════════════

    'tabela.*peri[oó]dic|s[íi]mbolo.*quim|elemento.*quim|n[uú]mero.*at[oô]mic|pr[oó]ton':
        '**Tabela Periódica:**\n\nOrganizada por Z (número atômico = nº de prótons) crescente. **Períodos** (linhas): mesmo nível de energia da camada externa. **Grupos/Famílias** (colunas): mesmo nº de elétrons na camada de valência = propriedades semelhantes.\n\n**Tendências:**\n- Raio atômico: aumenta de cima→baixo, diminui da esq→dir (mais prótons = mais atração).\n- Eletronegatividade e potencial de ionização: aumentam da esq→dir e de baixo→cima.\n\nMetais à esquerda/baixo; não-metais à direita/cima; gases nobres = grupo 18.',

    'liga[cç][oõ]es.*quim|covalente|i[oô]nica|met[aá]lica|polar.*apolar|geometria.*mol':
        '**Ligações Químicas:**\n\n**Iônica:** transferência de elétrons (metal → não-metal). Alta temperatura de fusão, conduz eletricidade quando fundido ou dissolvido. Ex: NaCl.\n**Covalente:** compartilhamento de elétrons entre não-metais. **Polar:** diferença de eletronegatividade → dipolo. **Apolar:** igual eletronegatividade ou geometria simétrica cancela dipolos. Ex: H₂O (polar); CO₂ (apolar, geometria linear).\n**Metálica:** "mar de elétrons" entre cátions. Conduz eletricidade/calor, maleabilidade.\n\n**Geometria molecular:** VSEPR: linear (2), trigonal plana (3), tetraédrica (4), piramidal (4c/1p par), angular (4c/2p pares).',

    'fun[cç][oõ]es.*inorg[aâ]nic|[aá]cido.*quim|base.*quim|sal.*quim|[oó]xido':
        '**Funções Inorgânicas:**\n\n**Ácidos** (Arrhenius): liberam H⁺ em água. Ex: HCl (clorídrico), H₂SO₄ (sulfúrico), HNO₃ (nítrico). Fortes: ionização total. Fracos: ionização parcial.\n**Bases:** liberam OH⁻. Ex: NaOH (soda), Ca(OH)₂ (cal), NH₄OH. Fortes: alcalis (NaOH, KOH, Ca(OH)₂).\n**Sais:** cátion (vem da base) + ânion (vem do ácido). Ex: NaCl (cloreto de sódio), CaCO₃ (carbonato de cálcio).\n**Óxidos:** binários com O₂: ácidos (CO₂, SO₃), básicos (CaO, Na₂O), anfóteros (Al₂O₃), neutros (CO, NO).',

    'ph.*quim|ph.*[aá]cido|indicador|neutraliz|hidron[iî]o':
        '**pH e Neutralização:**\n\npH = −log[H⁺]. Escala 0-14: pH<7 = ácido; 7 = neutro; pH>7 = básico. Cada unidade = variação de 10× na [H⁺].\n\n**Neutralização:** ácido + base → sal + H₂O. n_ácido × V_ácido = n_base × V_base (n=normalidade, equivalentes).\n\n**Indicadores:** tornassol (vermelho em ácido, azul em base); fenolftaleína (incolor em ácido, rosa em base); pH-metro é mais preciso.\n\n**Aplicações:** pH do sangue ≈ 7,4; pH do estômago ≈ 2; solo agrícola ideal ≈ 6-7 (calagem corrige solos ácidos).',

    'oxirredu|oxida[cç][aã]o|redu[cç][aã]o|agente.*oxi|agente.*red|n[uú]mero.*oxid':
        '**Oxirredução:**\n\nQuem **perde** elétrons → **oxidado** (número de oxidação aumenta) → é o **agente redutor**.\nQuem **ganha** elétrons → **reduzido** (número de oxidação diminui) → é o **agente oxidante**.\n\n**Mnemônico OILRIG:** Oxidation Is Loss, Reduction Is Gain.\n\n**Nox (número de oxidação):** O geralmente −2; H geralmente +1; elemento simples = 0; mol neutro = soma 0; mol iônico = carga do íon.\n\n**Aplicações:** pilhas/baterias (reação eletroquímica), galvanização, corrosão (ferrugem = oxidação do Fe).',

    'fun[cç][oõ]es.*org[aâ]nicas|hidrocarboneto|alcool.*quim|[aá]cido.*carboxil|ester|aldei|ceton|amin|amida':
        '**Funções Orgânicas:**\n\n**Hidrocarbonetos:** apenas C e H. Alcanos (C−C simples, CₙH₂ₙ₊₂), Alcenos (C=C, CₙH₂ₙ), Alcinos (C≡C, CₙH₂ₙ₋₂), Aromáticos (benzeno, anel de 6C).\n\n**Funções oxigenadas:**\n- Álcool: −OH (etanol, glicerol)\n- Aldeído: −CHO (formaldeído)\n- Cetona: >C=O (acetona)\n- Ácido carboxílico: −COOH (ác. acético = vinagre)\n- Éster: −COO− (aromas, biodiesel)\n- Éter: −O− (éter dietílico)\n\n**Funções nitrogenadas:** Amina (−NH₂), Amida (−CONH₂).',

    'balanciam|estequiometri|mol.*quim|avogadro|massa.*molar':
        '**Estequiometria:**\n\n**Mol:** unidade da quantidade de matéria. 1 mol = 6,02×10²³ partículas (Nº de Avogadro). **Massa molar (M)** em g/mol = massa em u.m.a.\n\n**Balanciamento:** C balanceie por inspeção ou método de Ox-Red. Lembre: átomos e cargas devem ser iguais nos dois lados.\n\n**Cálculo estequiométrico:**\n1. Balanceie a equação.\n2. Converta massas em moles (n=massa/M_molar).\n3. Use proporção dos coeficientes.\n4. Converta de volta para a unidade pedida.\n\n**Reagente limitante:** é o que se esgota primeiro e determina a quantidade de produto.',

    'solu[cç][oõ]es.*quim|solubilidade|concentra[cç][aã]o.*quim|molaridade|soluto|solvente|diluição':
        '**Soluções Químicas:**\n\n**Concentração comum** (C = m_soluto/V_solução em g/L). **Molaridade** (M = mol_soluto/V_solução em mol/L).\n\n**Lei da diluição:** C₁×V₁ = C₂×V₂ (adicionar solvente dilui).\n\n**Propriedades coligativas** (dependem do nº de partículas, não da natureza): Abaixamento da pressão de vapor, Elevação do ponto de ebulição, Abaixamento do ponto de fusão, Pressão osmótica. Quanto mais soluto → ebulição sobe e fusão desce.\n\n**Solubilidade:** depende de temperatura (sólidos: aumenta com T; gases: diminui com T) e pressão (gases: aumenta com P — Lei de Henry).',

    'qu[íi]mica.*org[aâ]nic.*reac|adi[cç][aã]o.*alc|elimina[cç][aã]o.*quim|substitui[cç][aã]o.*org':
        '**Reações Orgânicas:**\n\n**Adição** (sobre dupla/tripla ligação): alquenos + H₂ → alcano; + HX → haloalcano (Markovnikov: H entra no C com mais H); + H₂O → álcool.\n\n**Eliminação** (forma dupla ligação): álcool + H₂SO₄ → alceno. Regra de Zaitsev: preferencialmente o alceno mais substituído.\n\n**Substituição (radical/nucleofílica):** alcanos + Cl₂ (luz) → halogenação. Benzeno + HNO₃/H₂SO₄ → nitrobenzeno (SE aromatic).\n\n**Oxirredução:** álcool primário → aldeído → ácido carboxílico (oxidação). Ácido + álcool → éster + água (esterificação/Fischer).',

    'polimero|polimeriza[cç][aã]o|pl[aá]stico|borracha.*sint|nylon|polietileno':
        '**Polímeros:**\n\nCadeia de monômeros repetidos. **Polimerização por adição:** eteno → polietileno (PE), propeno → polipropileno (PP), cloreto de vinila → PVC, tetrafluoreteno → teflon (PTFE).\n\n**Polimerização por condensação** (elimina H₂O ou HCl): nylon (poliamida), poliéster (PET), baquelita.\n\n**Borracha natural:** poliisopreno (cis); vulcanização (Goodyear) com S → maior resistência. Borracha sintética: SBR, neoprene.\n\n**No ENEM:** plásticos no meio ambiente, reciclagem (símbolos 1-7), bioplásticos e sustentabilidade.',

    'termoqu[íi]mic|entalpia|calor.*reac|exot[eé]rmic|endot[eé]rmic|hess|energia.*liga':
        '**Termoquímica:**\n\n**Entalpia (ΔH):** variação de energia em reações à pressão constante.\nExotérmica: ΔH<0 (libera calor, ex: combustão). Endotérmica: ΔH>0 (absorve calor, ex: fotossíntese).\n\n**Lei de Hess:** ΔH da reação global = soma dos ΔH das etapas (independe do caminho).\n\n**Energia de ligação:** entalpia = Σ(ligações quebradas) − Σ(ligações formadas). Quebrar ligação: endotérmico (+). Formar: exotérmico (−).\n\n**Combustão completa:** hidrocarboneto + O₂ → CO₂ + H₂O (+ energia). Combustão incompleta → CO (monóxido — tóxico!) + C (fuligem).',

    'equil[íi]brio.*qu[íi]m|le.*chatelier|kc|kp|deslocam.*equilib':
        '**Equilíbrio Químico:**\n\nReação reversível: reagentes ⇌ produtos até que as taxas sejam iguais. **Kc** = [produtos]/[reagentes] (concentrações molares elevadas ao coeficiente estequiométrico). Kc > 1: favorece produtos; Kc < 1: favorece reagentes.\n\n**Princípio de Le Chatelier:** perturbação → sistema reage para minimizá-la.\n- Aumentar [reagentes] → desloca para produtos.\n- Aumentar T em exo → desloca para reagentes (ΔH<0).\n- Aumentar P (gases) → desloca para o lado com **menos** moles gasosos.\n- Catalisador: não desloca, apenas acelera atingir o equilíbrio.',

    // ════════════════════════════════════════════════════════════════════════
    // BIOLOGIA
    // ════════════════════════════════════════════════════════════════════════

    'fotoss[ií]ntese|clorof|prod.*energ.*plant|fase.*clara|ciclo.*calvin':
        '**Fotossíntese:** 6CO₂ + 6H₂O + luz → C₆H₁₂O₆ + 6O₂ (nos cloroplastos).\n\n**Fase clara** (tilacóides): fotólise da água (libera O₂), fotofosforilação (ATP), redução do NADP⁺→NADPH. Fotossistemas I e II em série.\n\n**Fase escura/Ciclo de Calvin** (estroma): CO₂ fixado pela Rubisco; gasto de ATP e NADPH para produzir G3P → glicose.\n\n**Plantas C4 e CAM:** adaptações em ambientes secos; concentram CO₂ antes do Ciclo de Calvin para reduzir fotorrespiração.',

    'respira[cç][aã]o.*celular|atp.*energia|mitoc[oô]ndria|glicol[íi]se|krebs|fosforiliz.*oxidat':
        '**Respiração Celular:** C₆H₁₂O₆ + 6O₂ → 6CO₂ + 6H₂O + ~38 ATP.\n\n**Etapas:**\n1. **Glicólise** (citoplasma): 1 glicose → 2 piruvato + 2 ATP + 2 NADH.\n2. **Ciclo de Krebs** (matriz mitocondrial): piruvato → CO₂ + ATP + NADH + FADH₂.\n3. **Fosforilação oxidativa** (cadeia resp.): NADH/FADH₂ → ~34 ATP via gradiente de prótons (ATP sintase). O₂ é receptor final de elétrons → H₂O.\n\n**Fermentação** (sem O₂): láctica (aguardente, iogurte → lactic acid + 2ATP) ou alcoólica (cerveja, pão → etanol + CO₂ + 2ATP). Muito menos eficiente (2ATP vs. 38ATP).',

    'c[eé]lula.*div|mit[oó]se|mei[oó]se|cromosso|c[íi]clo.*celul':
        '**Divisão Celular:**\n\n**Mitose** (crescimento e regeneração): 1 célula diploide (2n) → 2 células diploides (2n) geneticamente idênticas. Fases: Prófase → Metáfase → Anáfase → Telófase.\n\n**Meiose** (gametogênese): 1 célula diploide (2n) → 4 células haploides (n) geneticamente variadas. Meiose I (redução) + Meiose II (similar à mitose). Gera variabilidade por crossing-over e segregação independente.\n\n**Cromossomos humanos:** 46 (23 pares). Alterações: trissomia 21 (Síndrome de Down), 18 (Edwards), 13 (Patau); alterações nos sexuais (Turner 45,X; Klinefelter 47,XXY).',

    'dna|rna|sintese.*prot|transcri[cç][aã]o|tradu[cç][aã]o|c[oó]don|amin.*[aá]cido.*dna':
        '**Fluxo da Informação Genética:**\n\nDNA (dupla hélice) → transcrição → RNA mensageiro → tradução → proteína. (Dogma Central — com exceções em vírus: RNA→DNA por transcriptase reversa).\n\n**Transcrição:** RNA polimerase desbobina o DNA e sintetiza mRNA complementar. No mRNA: U (uracila) substitui T.\n\n**Tradução** (ribossomos): mRNA é lido em **códons** de 3 bases. tRNA traz o aminoácido correspondente. AUG = metionina (início); UAA, UAG, UGA = stop.\n\n**Mutações:** substituição, inserção, deleção. Podem ser neutras, benéficas ou prejudiciais. Base das doenças genéticas.',

    'dna|gen[eé]tica|alelo|mendel|here[ndt]|genot|fenot|domin|reces':
        '**Genética Mendeliana:**\n\n**DNA:** dupla hélice com bases A-T e C-G. Genótipo = composição alélica; Fenótipo = característica observada.\n\n**1ª Lei de Mendel:** cada indivíduo tem 2 alelos para cada gene, que se separam nos gametas. Dominante (A) × recessivo (a).\n\nQuadro de Punnett Aa × Aa → AA : Aa : aa = 1:2:1 (genótipo); 3 dominantes : 1 recessivo (fenótipo).\n\n**2ª Lei:** genes em cromossomos diferentes segregam independentemente. AaBb × AaBb → 9A_B_ : 3A_bb : 3aaB_ : 1aabb.\n\n**Exceções:** codominância (AB0), herança ligada ao X, epistase, poligência.',

    'evolu|darwin|sele[çc][aã]o.*natural|esp[eé]cie.*evolu|lamarck|deriva.*gen[eé]tica':
        '**Evolução Biológica:**\n\n**Lamarck (1809):** herança dos caracteres adquiridos — superado.\n**Darwin/Wallace (1858):** Seleção Natural — variação hereditária + pressão ambiental → sobrevivência diferencial dos mais adaptados → mudança das populações ao longo do tempo.\n\n**Neodarwinismo (Síntese Evolutiva):** Darwin + Genética. Fontes de variação: mutação e recombinação genética. Mecanismos: seleção natural, deriva genética, fluxo gênico, especiação alopátrica/simpátrica.\n\n**Evidências:** fósseis, anatomia comparada (homóloga e análoga), embriologia, biogeografia, genetica molecular.',

    'ecologia|ecossistema|bioma|cadeia.*aliment|teia.*aliment|n[íi]vel.*tr[oó]fico|ciclo.*bio':
        '**Ecologia:**\n\n**Cadeia alimentar:** Produtor (autótrofo) → Consumidor primário → Cons. Secundário → Decompositor. Energia: ~10% passa de um nível ao próximo (perda por calor).\n\n**Ciclos biogeoquímicos:** Carbono (fotossíntese/respiração/combustão), Nitrogênio (fixação → nitrificação → desnitrificação), Água (evaporação→condensação→precipitação), Fósforo (erosão → absorção).\n\n**Biomas brasileiros:** Amazônia, Cerrado, Caatinga, Mata Atlântica, Pampa, Pantanal. Cada um com fauna, flora e clima específicos.\n\n**Relações ecológicas:** Mutualismo (+/+), Comensalismo (+/0), Parasitismo (+/−), Predatismo (+/−), Competição (−/−).',

    'c[éeê]lula.*biolog|membrana.*celul|procariont|eucariont|organela|mitoc[oô]ndria|retículo':
        '**Biologia Celular:**\n\n**Procarionte** (bactérias, arqueas): sem núcleo delimitado, sem organelas membranosas, DNA circular, parede celular de peptidioglicano.\n**Eucarionte** (animais, plantas, fungos, protistas): núcleo com membrana, organelas especializadas.\n\n**Organelas:** Mitocôndria (respiração, tem DNA próprio), Cloroplasto (fotossíntese, plantas), Retículo Endoplasmático rugoso (síntese de proteínas), RE liso (lipídios), Golgi (secreção/empacotamento), Lisossomo (digestão intracelular), Vacúolo (turgor vegetal).\n\n**Membrana plasmática:** bicamada lipídica com proteínas (modelo mosaico fluido). Transporte: difusão simples, facilitada, osmose, transporte ativo (ATP).',

    'sistema.*nervoso|neur[oô]nio|sinapse|impulso.*nervoso|sistema.*endocrin|horm[oô]nio':
        '**Sistema Nervoso e Endócrino:**\n\n**Neurônio:** corpo celular + dendritos (recebem) + axônio (transmite). Impulso nervoso: despolarização da membrana (Na⁺ entra). **Sinapse:** vesículas liberam neurotransmissores (acetilcolina, dopamina, serotonina) na fenda sináptica.\n\n**SNC:** encéfalo (cérebro, cerebelo, tronco) + medula espinhal.\n**SNP:** somático (voluntário) + autônomo (simpático/parassimpático).\n\n**Sistema Endócrino — glândulas e hormônios:**\nHipófise (GH, TSH, FSH, LH), Tireoide (T3/T4 — metabolismo), Pâncreas (insulina/glucagon — glicemia), Adrenal (cortisol, adrenalina), Gônadas (estrogênio, testosterona).',

    'sistema.*cardiovasc|cora[cç][aã]o.*sangue|circula[cç][aã]o|hemoglobin|grupo.*sangu[íi]neo':
        '**Sistema Cardiovascular:**\n\nCoração humano: 4 câmaras (2 átrios + 2 ventrículos). Circulação **dupla e completa**.\n**Pequena circulação:** VD → pulmões → AE (hematose — troca CO₂/O₂).\n**Grande circulação:** VE → corpo todo → AD (sangue venoso retorna).\n\n**Grupos sanguíneos (ABO):** A (antígeno A, IgM anti-B), B (antígeno B), AB (universal receptor, sem anticorpos), O (universal doador, sem antígenos).\n**Fator Rh:** Rh+ tem o antígeno D; Rh− não tem. Incompatibilidade: Rh− mãe × Rh+ feto = eritroblastose fetal.\n\n**Pressão arterial:** sistólica/diastólica. Hipertensão = "assassina silenciosa".',

    'sistema.*respirat|pulm[aã]o|alv[eê]olo|hemoglobin|troca.*gasosa.*pul':
        '**Sistema Respiratório:**\n\nVias: nariz → faringe → laringe → traqueia → brônquios → bronquíolos → **alvéolos** (troca gasosa).\n\n**Hematose alveolar:** O₂ difunde do alvéolo para o sangue; CO₂ difunde do sangue para o alvéolo (diferença de pressão parcial).\n\n**Hemoglobina (Hb):** proteína quaternária que transporta O₂ (4 moléculas/Hb). HbO₂ = oxi-hemoglobina. Curva de dissociação: forma sigmoide (cooperatividade).\n\n**Regulação:** CO₂ no sangue → queda do pH → centro respiratório (bulbo) aumenta frequência respiratória.',

    'reino.*biolog|classifica[cç][aã]o.*seres|vírus|bacteria|fungi|plant.*reino|animal.*reino':
        '**Classificação dos Seres Vivos:**\n\n**Vírus:** acelular, RNA ou DNA + capsídeo (± envelope lipídico). Parasita intracelular obrigatório. Exemplos: HIV, SARS-CoV-2, gripe, dengue, zika.\n\n**Domínios:** Bacteria (procariotos, eubactérias), Archaea (procariotos extremófilos), Eukarya (todos os eucariontes).\n\n**Reinos tradicionais:**\nMonera (bactérias), Protista (algas unicel., protozoários), Fungi (cogumelos, leveduras — heterótrofos por absorção), Plantae (celula parede celulose, autótrofos), Animalia (sem parede, heterótrofos por ingestão).\n\n**Taxonomia:** Domínio > Reino > Filo > Classe > Ordem > Família > Gênero > Espécie.',

    // ════════════════════════════════════════════════════════════════════════
    // CIÊNCIAS HUMANAS
    // ════════════════════════════════════════════════════════════════════════

    'gr[eé]cia.*antic|atenas|esparta|democracia.*grega|polis.*grega|fil[oó]sof.*grego|socrat|plat[aã]o|arist[oó]teles':
        '**Grécia Antiga:**\n\n**Polis:** cidades-estado independentes. Atenas: berço da democracia direta (assembleia, cidadãos masculinos livres). Esparta: militarismo, oligarquia, helotismo.\n\n**Filosofia grega:** Pré-socráticos (Tales, Heráclito — busca do arkhé). Sócrates: maiêutica, "conhece-te a ti mesmo". Platão: mundo das ideias × mundo sensível, *A República*. Aristóteles: lógica, ética, política ("animal político"), observação empírica.\n\n**Período Helenístico:** Alexandre Magno difundiu a cultura grega pelo Oriente Médio, Egito e Índia (séc. IV a.C.).',

    'roma.*antic|rep[uú]blica.*roman|imp[eé]rio.*roman|c[eé]sar|aug[uú]sto|direito.*roman':
        '**Roma Antiga:**\n\n**Período Monárquico** (753-509 a.C.) → **República** (509-27 a.C.): Senado, cônsules, patronato/clientela, expansão mediterrânea, Guerras Púnicas (vs. Cartago).\n\n**Império** (27 a.C.−476): Augusto → Pax Romana → divisão do Império (395) → queda do Ocidente (476, invaSões germânicas).\n\n**Legado:** Direito Romano (base do direito ocidental), latim (origem das línguas romances), engenharia (aquedutos, estradas, Coliseu), catolicismo como religião oficial (Édito de Milão, 313).',

    'mediev|feudal|servid[aã]o|cruzadas|inquisição|renascen.*mediev|p[eê]ste.*neg':
        '**Idade Média (séc. V–XV):**\n\n**Feudalismo:** sistema econômico e político. Senhor feudal → vassalo (obrigações militares) → servo (preso à terra, trabalho compulsório). Igreja Católica: enorme poder político e cultural (cruzadas, Inquisição, dízimo).\n\n**Cruzadas** (1096-1270): guerras "santas" para retomar Jerusalém. Consequências: comércio, crise do feudalismo, intercâmbio cultural.\n\n**Crise do séc. XIV:** Peste Negra (1/3 da Europa morreu), fome, conflitos → enfraqueceu o feudalismo.\n\n**Transição:** burguesia crescente + comércio itÁlIano → Renascimento.',

    'renasciment|humanismo|reforma.*protest|lutero|calvino|contrarreforma':
        '**Renascimento e Reforma Protestante:**\n\n**Renascimento** (séc. XIV-XVI): retomada da cultura greco-romana, antropocentrismo, racionalismo, empirismo, arte (Leonardo da Vinci, Michelangelo). Centro: Itália (Florença).\n\n**Humanismo:** homem no centro (vs. teocentrismo medieval). Erasmo de Rotterdam, Thomas More.\n\n**Reforma Protestante (1517):** Lutero afixou as 95 Teses → contestou indulgências e autoridade papal. Calvino (predestinação, ética do trabalho). Anglicanismo (Henrique VIII).\n\n**Contrarreforma:** Concílio de Trento, Companhia de Jesus (Jesuítas), Inquisição reforçada.',

    'revolu.*industrial':
        'A **Revolução Industrial** (séc. XVIII, Inglaterra) substituiu o artesanato por fábricas a vapor, gerando urbanização, proletariado e capitalismo industrial.\n\n**1ª Revolução (1760-1840):** carvão, ferro, máquina a vapor, tear mecânico. Centro: Inglaterra.\n**2ª Revolução (1870-1914):** petróleo, eletricidade, aço, química, linha de montagem. Centro: EUA, Alemanha.\n**3ª Revolução:** digital/tecnológica (microprocessadores, automação, informática).\n\n**Consequências sociais:** urbanização rápida, condições de trabalho deploráveis, surgimento do socialismo/marxismo, lutas operárias (sindicatos, 8h de trabalho, trabalho infantil).',

    'imperialismo|colonialismo.*[aá]frica|partilha.*[aá]frica|descoloniz':
        '**Imperialismo e Colonialismo:**\n\n**Imperialismo** (fins séc. XIX): potências industriais dominam África e Ásia em busca de matérias-primas e mercados consumidores. **Conferência de Berlim (1884-85):** "Partilha da África" entre potências europeias sem considerar povos locais.\n\n**Consequências:** exploração econômica, destruição de culturas e estruturas políticas locais, fronteiras artificiais (raiz de conflitos atuais).\n\n**Descolonização (pós-1945):** movimentos de independência na Ásia e África. Índia (Gandhi, não-violência, 1947), África em massa nos anos 1950-70. **Neocolonialismo:** dependência econômica persistiu.',

    'plano*marshall|guerra.*fria|urss|eua.*soci|otan|pacto.*varso|berlin|cuba|corea|vietnam':
        'A **Guerra Fria** (1947-91): EUA (capitalismo/democracia liberal) × URSS (socialismo/partido único).\n\nEventos-chave: Plano Marshall (reconstrução da Europa Ocidental), Bloqueio de Berlim, Corrida armamentista/espacial, Guerra da Coreia (1950-53), Crise dos Mísseis em Cuba (1962 — 13 dias mais perto da guerra nuclear), Guerra do Vietnã (1955-75).\n\n**Fim:** Gorbachev (glasnost/perestroika), queda do Muro de Berlim (1989), dissolução da URSS (1991) → 15 repúblicas independentes.\n\nMundo pós-GF: EUA hiperpotência, globalização, multilateralismo, terrorismo internacional.',

    'revolu.*france|iluminismo|rousseau|montesquieu|locke|voltaire|napo|revoluc.*americ':
        'A **Revolução Francesa (1789)**: derrubou o absolutismo de Luís XVI. Ideais: Liberdade, Igualdade, Fraternidade.\n\nFases: Monarquia Constitucional → Terror (Robespierre, guilhotina, 40 mil mortes) → Diretório → Napoleão Bonaparte.\n\n**Iluminismo:** Locke (direitos naturais, direito à revolução), Montesquieu (tripartição dos poderes), Rousseau (vontade geral, soberania popular), Voltaire (tolerância, crítica à Igreja), Hobbes (soberania do Leviatã).\n\n**Revolução Americana (1776):** Independência dos EUA — influência iluminista. Constituição de 1787: primeira constituição moderna escrita.',

    'fascismo|nazismo|totalitar|hitler|mussolini|holocausto|segunda.*guerra|1ª.*guerra':
        '**Totalitarismo e Guerras Mundiais:**\n\n**1ª GM (1914-18):** assassinato de Franz Ferdinand + sistema de alianças + nacionalismo + imperialismo. Trincheiras, guerra química, ~17 mi mortos. Tratado de Versalhes: humilhou a Alemanha.\n\n**Entreguerras:** Grande Depressão (1929) + Versalhes → ascensão do nazi-fascismo.\n**Fascismo** (Mussolini, 1922): Estado forte, corporativismo, expansionismo.\n**Nazismo** (Hitler, 1933): raça ariana, antissemitismo, Holocausto (6 mi de judeus + outros grupos).\n\n**2ª GM (1939-45):** ~70 mi mortos. Consequências: ONU, Plano Marshall, Guerra Fria, Estado de Israel (1948), Tribunal de Nuremberg.',

    'era vargas|estado novo|get[uú]lio|trabalhismo|clt':
        'A **Era Vargas (1930-45)**: Revolução de 1930 → fim da República Velha (café-com-leite).\n\n**Governo Provisório (1930-34):** Ministério do Trabalho, Código Eleitoral.\n**Gov. Constitucional (1934-37):** Constituição de 1934, voto feminino.\n**Estado Novo (1937-45):** ditadura inspirada no fascismo (Constituição "Polaca"), censura pelo DIP, repressão ao PCB.\n\n**Legado:** CLT (1943), salário mínimo (1940), SENAI/SENAC, IBGE, previdência social. Industrialização: CSN, Petrobras (1953, 2º governo). Vargas suicidou-se em 1954 — "Carta Testamento".',

    'revolu[cç][aã]o.*russa|bolchevique|lenin|urss|socialismo.*sov|estalinismo|comun.*histor':
        '**Revolução Russa (1917):**\n\n**Fevereiro:** derrubou o Czar Nicolau II → República provisória (Kerensky).\n**Outubro:** Bolcheviques (Lenin) tomaram o poder → primeiro Estado socialista mundial.\n\n**Guerra Civil (1918-21):** Bolcheviques (vermelhos) × Monarquistas (brancos) + intervenção estrangeira. Lenin venceu.\n\nURSS fundada em 1922. **NEP** (Nova Política Econômica): mista, recuperou a economia.\n\n**Stálin:** coletivização forçada, industrialização ao custo de milhões de vidas, Gulag, culto à personalidade. Rivalidade Stálin × Trotsky.\n\n**Legado:** inspiração para movimentos de esquerda mundiais, China (Mao, 1949), Cuba (Castro, 1959).',

    'brasil.*colonial|coloniza|cana.*a[cz]uc|ouro.*brasil|quilombo|inconfiden|escrav.*brasil':
        '**Brasil Colonial (1500-1822):**\n\nExploração em ciclos: Pau-brasil → Cana-de-açúcar (séc. XVI-XVII, Nordeste, plantation + escravidão africana) → Ouro/Diamantes (séc. XVIII, Minas Gerais, Ciclo Minerador).\n\n**Pacto Colonial:** exclusividade do comércio com Portugal; metrópole extraía riqueza; colônia não industrializava.\n\n**Resistências:** Quilombos (Palmares, Zumbi), Inconfidência Mineira (1789, Tiradentes), Conjuração Baiana (1798).\n\n**Vinda da família real (1808):** abertura dos portos, fim do pacto colonial formal. Independência (1822): Dom Pedro I — "Fico" → Grito do Ipiranga.',

    'escravid[aã]o.*brasil|trafico.*negr|lei.*[aá]urea|imigra[cç][aã]o|neg.*brasil':
        '**Escravidão no Brasil:**\n\nMaior importador de africanos escravizados das Américas: ~4-5 milhões de pessoas traficadas (1550-1850). Trabalho nas plantações de cana, minas de ouro, café.\n\n**Abolição gradual:** Lei Eusébio de Queirós (1850, proíbe tráfico), Lei do Ventre Livre (1871), Lei dos Sexagenários (1885), **Lei Áurea** (13/05/1888) — última abolição das Américas.\n\n**Pós-abolição:** sem indenização, sem inclusão social → desigualdade racial estrutural persistente. Imigração europeia (italianos, alemães, japoneses) substituiu a mão de obra escravizada no Sul/SP.\n\n**Racismo estrutural** (Silvio Almeida): embutido nas instituições, não apenas atos individuais. ENEM cobra: cotas, herança colonial, desigualdade.',

    'ditadura.*brasil|1964.*brasil|ai.*5|abertura.*politic|militar.*brasil':
        '**Ditadura Militar no Brasil (1964-1985):**\n\n**Golpe de 1964:** depôs João Goulart (reformas de base). Apoio: militares, grande burguesia, EUA (Guerra Fria).\n\n**Atos Institucionais (AI):** bipartidarismo (ARENA × MDB), perseguição política, cassações.\n\n**AI-5 (1968):** ato mais duro. Fechou o Congresso, suspendeu habeas corpus, instaurou censura total (teatro, imprensa, música). Início da tortura sistemática.\n\n**"Milagre econômico" (1969-73):** crescimento ~10%/a.a. + endividamento externo + concentração de renda.\n\n**Abertura:** Geisel (1974, "lenta, gradual e segura"), anistia (1979), multipartidarismo (1979), eleições diretas → Tancredo/Sarney (1985). CF/1988 = "Constituição Cidadã".',

    'redemocrat|diretas.*já|constitui[cç][aã]o.*1988|nova.*rep[uú]blica|collor|fhc|lula.*hist':
        '**Nova República e CF/1988:**\n\n**Diretas Já (1983-84):** movimento por eleições diretas — perdeu no Congresso. Tancredo Neves eleito indiretamente (morreu antes de assumir). José Sarney assumiu.\n\n**Constituição de 1988** ("Cidadã"): redemocratização, direitos individuais e sociais ampliados, SUS, 13º salário, FGTS, voto para analfabetos, 16 anos.\n\n**Collor (1990-92):** neoliberalismo, plano de estabilização (Plano Collor), impeachment por corrupção.\n**FHC (1995-2002):** Plano Real (1994), privatizações, estabilidade econômica.\n**Lula (2003-2010):** Bolsa Família, pré-sal, inclusão social. **Dilma (2011-16):** impeachment controverso (2016). Temer, Bolsonaro, Lula (2023-).',

    'globaliz|neoliberal|privatiz|fmi|banco.*mundial|livre.*mercado':
        '**Globalização e Neoliberalismo:**\n\n**Globalização** (pós-1980): integração econômica, cultural e política, impulsionada pela tecnologia (internet, logística) e ideologia neoliberal.\n\n**Neoliberalismo** (Hayek, Friedman; Thatcher/Reagan nos anos 80): livre mercado, Estado mínimo, privatizações, desregulamentação financeira, abertura comercial.\n\nNo Brasil: Collor/FHC → privatizações (Telebrás, Vale, CSN); abertura comercial → desindustrialização relativa.\n\n**Críticas:** desigualdade crescente, precarização do trabalho, crises financeiras (1997 Ásia, 1999 Brasil, 2008 EUA). **Globalização cultural:** McDonaldização, americanização × valorização de culturas locais.',

    'marx|marxismo|luta.*class|materialismo.*histor|mais.*valia|weber|durkheim|sociol.*class':
        '**Sociologia Clássica:**\n\n**Marx:** materialismo histórico — a história é movida por conflitos de classe (modo de produção → infraestrutura define a superestrutura). Mais-valia: excedente do trabalho não pago ao operário. Comunismo: sociedade sem classes como objetivo histórico.\n\n**Weber:** compreensão da ação social subjetiva. Tipos de dominação: tradicional, carismática, racional-legal. Ética protestante e o espírito do capitalismo. Burocracia como dominação racional.\n\n**Durkheim:** fatos sociais (coerção, exterioridade), solidariedade mecânica (tradição) × orgânica (divisão do trabalho), anomia, suicídio como fenômeno social. Funcionalismo.',

    'fil[oó]sof.*il|des?cart|kant|hegel|nietzsche|exist.*sartre|posit|empirism':
        '**Filosofia Moderna e Contemporânea:**\n\n**Descartes** (racionalismo): "Cogito, ergo sum" — dúvida metódica, razão como fonte do conhecimento. Dualismo mente-corpo.\n\n**Kant** (idealismo transcendental): conhecimento = intuição (espaço/tempo) + categorias do entendimento + razão. "O que posso conhecer, fazer e esperar?" Imperativo categórico: age só segundo máximas que pudessem ser leis universais.\n\n**Hegel (dialética):** tese × antítese → síntese. Espírito Absoluto. Influência no marxismo.\n\n**Nietzsche:** morte de Deus, eterno retorno, vontade de potência, crítica à moral cristã. **Sartre (existencialismo):** "a existência precede a essência"; liberdade e responsabilidade totais.',

    'crise.*ambiental|aquecimento.*global|efeito.*estufa|sustentab|agenda.*2030|ods|climatica':
        '**Questão Ambiental:**\n\n**Efeito estufa (antrópico):** CO₂, CH₄, N₂O e vapor d\'água absorvem calor, causando aquecimento global. Principal causa: queima de combustíveis fósseis + desmatamento.\n\n**Consequências:** aumento do nível do mar, eventos climáticos extremos (secas, inundações), extinção de espécies, desertificação.\n\n**Acordos internacionais:** Protocolo de Kyoto, **Acordo de Paris (2015):** meta de limitar a +1,5°C em relação ao pré-industrial. ODS (Objetivos de Desenvolvimento Sustentável) — 17 metas da ONU para 2030.\n\n**Brasil:** CAR, Código Florestal, Desmatamento da Amazônia (INPE acompanha), REDD+, bioeconomia.',

    'direitos.*humanos|cidadania|cf.*88|constitui[cç][aã]o.*bras|art.*5|art.*3':
        '**Constituição Federal de 1988 e Direitos Humanos:**\n\n**Fundamentos (Art. 1°):** soberania, cidadania, dignidade da pessoa humana, valores sociais do trabalho e da livre iniciativa, pluralismo político.\n\n**Objetivos (Art. 3°):** construir sociedade justa; erradicar pobreza; reduzir desigualdades; promover o bem sem distinção.\n\n**Direitos fundamentais (Art. 5°):** igualdade, livre expressão, inviolabilidade do domicílio, habeas corpus, mandado de segurança, devido processo legal.\n\n**Direitos Sociais (Art. 6°):** saúde, educação, trabalho, moradia, lazer, segurança, previdência, proteção à maternidade e infância.\n\n**ONU/Declaração Universal (1948):** direitos inalienáveis, indivisíveis, universais.',

    'geog.*brasil|regi[aõ]o.*brasil|nordeste|amaz[oô]nia|urbaniz|campo.*cidad|fluxo.*migrat':
        '**Geografia do Brasil:**\n\n**5 Regiões:** Norte (maior área, menor densidade, Amazônia), Nordeste (maior pop. %, semiárido, caatinga, maior desigualdade), Centro-Oeste (cerrado, agronegócio), Sudeste (maior PIB, maior urbanização), Sul (colonização europeia, clima subtropical, maior IDH médio).\n\n**Biomas:** Amazônia (56% do país), Cerrado (2°maior biodiversidade), Caatinga (único bioma exclusivamente brasileiro), Mata Atlântica (mais degradada, 12% resiste), Pantanal, Pampa.\n\n**Urbanização:** 87% da pop. vive em áreas urbanas. Megalópoles: SP-RJ (Macrometrópole Paulista). Problemas: favelização, violência, deficiência de infraestrutura.',

    // ════════════════════════════════════════════════════════════════════════
    // LINGUAGENS E REDAÇÃO
    // ════════════════════════════════════════════════════════════════════════

    'reda[cç][aã]o.*enem|dissertativ|proposta.*interven|competênci|nota.*1000|red.*enem':
        'A **Redação ENEM** é dissertativo-argumentativa (nota 0–1000, em 5 competências de 200 pts cada).\n\n**Estrutura:** Introdução (contextualização + tese) → Desenvolvimento 1 (argumento + exemplificação) → Desenvolvimento 2 (segundo argumento + dados/repertório) → Conclusão (proposta de intervenção completa).\n\n**5 elementos da proposta:** Ação (o quê), Agente (quem), Modo/instrumento (como), Efeito esperado (resultado), Finalidade (por quê). Todos em 1-2 frases coesas.\n\n**Competências:** C1 = domínio da escrita formal; C2 = compreensão da proposta e repertório; C3 = organização e argumentação; C4 = coesão; C5 = proposta de intervenção. **Nota 0** por: fuga do tema, em branco, cópia do texto motivador, texto injurioso.',

    'met[aá]fora|metoním|hip[eé]rbole|eufemismo|ironia.*ling|sinestesia|paradox|antítese|personif|anafor|assind|polissínd|figur.*ling':
        '**Figuras de Linguagem:**\n\n**Figuras de pensamento:** Metáfora (comparação implícita: "a vida é um palco"), Metonímia (parte pelo todo, autor pela obra: "li Clarice"), Hipérbole (exagero: "chorei um rio"), Eufemismo (suavização: "passou para um lugar melhor"), Ironia (dizer o oposto), Antítese (opostos justapostos: "amor é fogo que arde sem se ver"), Paradoxo (contradição verdadeira), Personificação (humano ao inanimado).\n\n**Figuras de construção:** Anáfora (repetição no início de versos), Assíndeto (sem conectivos), Polissíndeto (excesso de conectivos), Zeugma (omissão de termo já citado), Anacoluto (frase sem estrutura sintática completa), Elipse (omissão de palavra subentendida).\n\n**Figuras de som:** Aliteração (repetição de consoantes), Assonância (repetição de vogais), Onomatopeia.',

    'intertextual|paródia|paráfrase|alusão.*lit|citação.*tex':
        '**Intertextualidade:** quando um texto dialoga com outro por citação, paródia, paráfrase ou alusão.\n\n**Paráfrase:** reformula o texto original mantendo o sentido (concordância). **Paródia:** deforma com humor, ironia ou crítica (discordância). **Pastiche:** imitação sem crítica, homenagem ao estilo.\n\n**Como identificar no ENEM:** charges e tirinhas frequentemente fazem referência a filmes, músicas, pinturas ou textos clássicos. O efeito de sentido depende de reconhecer a referência.\n\n**Polifonia** (Bakhtin): texto com múltiplas vozes sociais que dialogam — presente em artigos de opinião, charges, discursos políticos.',

    'coes[aã]o.*tex|coer[eê]ncia.*tex|conectiv|articulad|estrut.*tex':
        '**Coesão e Coerência:**\n\n**Coesão** (como se liga): pronomes, sinônimos, hiperônimos, conectivos, elipse. Mecanismos: referência (ele, este, aquele), substituição, conjunção (porém, porque, portanto...). C4 da Redação ENEM.\n\n**Conectivos essenciais:**\n- Adição: além disso, ademais, também, não só… mas também\n- Oposição: porém, contudo, entretanto, todavia, no entanto\n- Causa: porque, pois, visto que, já que, dado que\n- Conclusão: portanto, logo, assim, dessa forma, por conseguinte\n- Condição: se, caso, desde que, a menos que\n- Concessão: embora, ainda que, apesar de (+ subjuntivo)\n\n**Coerência** (sentido lógico): não pode haver contradição nem mudança de tema. Progressão temática linear ou com retomada.',

    'g[eê]nero.*text|tipo.*text|narrativ.*tex|descritiv|dissertat.*tex|injuntiv|expositiv|crônica.*gênero|carta.*tex|email':
        '**Gêneros e Tipos Textuais:**\n\n**Tipos textuais** (modo de construção): Narrativo (conto, crônica, romance — conta eventos com personagens, tempo, espaço), Descritivo (retrata características), Expositivo (informa sem defender), Dissertativo-argumentativo (defende tese com argumentos — redação ENEM, artigo de opinião), Injuntivo (instrui — receita, manual, lei).\n\n**Gêneros discursivos** (circulação social): artigo de opinião, editorial, charge, tirinha, HQ, reportagem, carta ao leitor, resenha, blog, notícia, propaganda, discurso político.\n\n**Gêneros cobrados no ENEM:** charge, tirinha (interpretação visual + linguagem não-verbal), poema, conto, crônica, reportagem, artigo de opinião, infográfico.',

    'modernismo.*brasil|semana.*arte|modern.*1922|1ª.*fase.*modern|2ª.*fase.*modern|3ª.*fase.*modern':
        '**Modernismo Brasileiro:**\n\n**1ª fase (1922-1930) — "Fase heroica":** Semana de Arte Moderna (fev/1922, SP). Ruptura com o parnasianismo/simbolismo. Linguagem cotidiana, humor, ironia, verso livre, temas nacionais.\nAutores: Oswald de Andrade (Manifesto Antropófago: devorar e transformar a cultura europeia), Mário de Andrade (*Macunaíma* — herói sem nenhum caráter), Cassiano Ricardo.\n\n**2ª fase (1930-1945) — "Fase de consolidação":** prosa social, regionalismo crítico. Graciliano Ramos (*Vidas Secas*, seco como o sertão), José Lins do Rego, Rachel de Queiroz, Jorge Amado. Poesia: Carlos Drummond de Andrade.\n\n**3ª fase (1945-) — "Pós-modernismo":** Guimarães Rosa (*Grande Sertão: Veredas* — linguagem inventiva), Clarice Lispector (fluxo de consciência), João Cabral de Melo Neto (poesia-engenharia).',

    'romantism|realismo.*lit|natural.*lit|barr[o0]co|arcad|parnasian|simbolism':
        '**Periodização Literária no Brasil:**\n\n**Barroco** (séc. XVII): cultismo + conceptismo, antíteses, Padre Antônio Vieira, Gregório de Matos ("Boca do Inferno").\n**Arcadismo** (séc. XVIII): razão, natureza, "áureo medíocre", Tomás Antônio Gonzaga, Cláudio Manuel da Costa. Ligado à Inconfidência Mineira.\n\n**Romantismo** (séc. XIX, 1830-1870): subjetividade, sentimentalismo, indianismo.\n1ª geração: Gonçalves Dias ("Canção do Exílio"), José de Alencar (*O Guarani*, *Iracema*).\n2ª (ultra-romântica): Álvares de Azevedo ("Noite na Taverna").\n3ª (social/condoreirismo): Castro Alves ("O Navio Negreiro").\n\n**Realismo** (1881-): Machado de Assis (ironia, psicologia — *Memórias Póstumas*, *Dom Casmurro*, "Capitu traiu?").\n**Naturalismo:** Aluísio Azevedo (*O Cortiço* — determinismo biológico/social).\n**Parnasianismo:** "arte pela arte", Olavo Bilac. **Simbolismo:** Alphonsus de Guimaraens, Cruz e Sousa.',

    'variação.*ling|dialeto|registro|norma.*culta|preconceit.*ling|l[íi]ngua.*port':
        '**Variação Linguística:**\n\nA língua é heterogênea e muda constantemente. Não existe variedade "errada" — o preconceito linguístico é uma forma de discriminação social.\n\n**Tipos de variação:**\n- **Diatópica (regional):** "mandioca/macaxeira/aipim", "ônibus/busão", sotaques regionais.\n- **Diastrática (social):** gírias de grupos, jargões profissionais, faixa etária.\n- **Diafásica (estilo):** formal vs. informal; oral vs. escrito.\n- **Diacrônica (histórica):** a língua muda com o tempo (latim → português).\n\n**Norma culta:** variedade de prestígio usada em situações formais, analisada pela gramática normativa. ENEM pede domínio da norma culta na redação, mas valoriza a análise de variações em questões de interpretação.',

    'concordância.*verbal|concordância.*nom|sujeito.*verbo|regência|crase.*gram|acento.*gram|ortog':
        '**Gramática — Concordância, Regência e Crase:**\n\n**Concordância verbal:** verbo concorda com o sujeito em pessoa e número. Coletivo no singular → verbo no singular. Sujeito composto antes do verbo → plural. "A maioria/parte de X" → verbo conc. com o nome coletivo (singular) ou com o especificador (plural — ambos aceitos).\n\n**Concordância nominal:** adjetivo concorda com o substantivo. Vários substantivos + 1 adjetivo posterior → plural; anterior e adjacente ao último → singular.\n\n**Regência verbal:** "Assistir a um filme" (transitivo indireto com "a"); "Obedecer ao pai" (com preposição "a"). "Ir a/para" (ambas aceitas com diferença semântica).\n\n**Crase:** fusão de "a" (prep.) + "a" (art. fem.). Use antes de palavras femininas precedidas de preposição "a" quando o masculino ficaria "ao". NÃO usa antes de: verbos, pronomes pessoais, palavras masc. sem artigo, "uma".',

    'interpreta.*text|leitura.*tex|inferência|sentido.*tex|texto.*enem|vocábulo|conotaç|denotaç':
        '**Interpretação de Texto:**\n\nEstratégias para o ENEM:\n1. **Leia o enunciado primeiro** para saber o que procurar.\n2. **Sublinhe tese e argumentos** enquanto lê.\n3. **Denotação vs. Conotação:** sentido literal (dicionarizado) × sentido figurado (contextual).\n4. **Identificar o gênero:** charge, conto, poema, relatório — cada um tem convenções.\n5. **Inferência:** ir além do explícito com base em pistas do texto e contexto.\n\n**Em charges e tirinhas:** a ironia está geralmente na contradição entre texto e imagem. O que é dito ≠ o que se critica.\n\n**Em poemas:** atente para figuras de linguagem, ritmo, estrutura dos versos (verso livre × metrificado) e imagens poéticas.',

    'espanh[oó]l|ingl[eê]s.*enem|falsos.*cog|idioma.*enem':
        '**Língua Estrangeira no ENEM:**\n\nO candidato escolhe **Inglês ou Espanhol** (5 questões, não pode mudar durante a prova).\n\n**Inglês:** textos de publicidade, notícias, músicas, poemas. Vocabulário de contexto (deduzir pelo contexto). Formação de palavras (prefixos/sufixos). Estude phrasal verbs e falsos cognatos (actual = real, not = atual).\n\n**Espanhol:** interpreta textos (publicidade, notícia, poema). **Falsos cognatos:** embarazada = grávida; borracha = bêbada; polvo = pó; vaso = copo; borrar = apagar; exquisito = delicioso.\n\n**Dica geral:** o contexto quase sempre revela o sentido de palavras desconhecidas. Priorize entender a ideia geral do texto antes de palavras isoladas.',

    'sem[i]ótica|linguagem.*não.*verbal|charge.*analise|símbolo.*ícone|tirinha':
        '**Semiótica e Linguagem Não-Verbal:**\n\n**Semiótica** (Peirce): estudo dos signos. Signo = Representamen + Objeto + Interpretante.\n\n**Tipos de signos:**\n- **Ícone:** semelhança com o objeto (foto, pintura realista, onomatopeia).\n- **Índice:** relação causal (fumaça = fogo; febre = infecção).\n- **Símbolo:** convencional/arbitrário (palavras, bandeiras, ✔ = aprovado).\n\n**Análise de charges:** identifique os elementos visuais, o contexto histórico/político, o que está sendo criticado e como a ironia é construída pela contradição texto×imagem.\n\n**Linguagem publicitária:** apelos racionais (eficiência, preço) e emocionais (prestígio, beleza, pertencimento). Figuras de linguagem + linguagem visual.',

    'fon[eé]tic|fon[oô]logic|sílaba|díton|hiato|encontr.*voc|acent.*tôn':
        '**Fonética e Fonologia:**\n\n**Fonema vs. Letra:** fonema = som; letra = representação gráfica. "Cama" tem 4 letras e 4 fonemas; "fixo" tem 4 letras mas 5 fonemas (f-i-k-s-o).\n\n**Sílabas:** o tônico é a sílaba de maior intensidade. Monossílabos, dissílabos, trissílabos, polissílabos.\n\n**Encontros vocálicos:**\n- Ditongo: vogal+semivogal (pai, coisa)\n- Tritongo: semivogal+vogal+semivogal (Uruguai)\n- Hiato: duas vogais em sílabas separadas (sa-ú-de, po-e-ta)\n\n**Nova Ortografia (2009):** eliminados trema (exceto em nomes estrangeiros), acento de palavras como "para", "pela", "pelo", "polo"; hífen em palavras com prefixos revisado (sub-reitor, anti-inflamatório).',

    // ════════════════════════════════════════════════════════════════════════
    // MATEMÁTICA (continuação)
    // ════════════════════════════════════════════════════════════════════════

    'inequa[cç][aã]o|conjunto.*solução.*inequ|desigualdade.*algebr':
        '**Inequações:**\n\n**1º grau:** resolve igual à equação, **mas:** ao multiplicar/dividir por número **negativo**, o sinal de desigualdade **inverte!**\nEx: −2x > 4 → x < −2 ✓\n\n**2º grau (ax²+bx+c < 0):**\n1. Calcule as raízes (Bhaskara).\n2. a > 0: a parábola abre p/ cima. f(x) < 0 entre as raízes (x₁ < x < x₂).\n3. a < 0: parábola p/ baixo. f(x) < 0 fora das raízes.\n\n**Representação:** reta numérica (● = fechado/inclui; ○ = aberto/exclui) ou notação de intervalo [a,b], (a,b), [a,b).',

    'fun[cç][aã]o.*inversa|fun[cç][aã]o.*compost|injet|sobrj|bijet':
        '**Funções — Composição e Inversa:**\n\n**Função composta (f∘g)(x) = f(g(x)):** aplica g primeiro, depois f. Em geral f∘g ≠ g∘f.\nEx: f(x)=x+1, g(x)=2x → (f∘g)(x) = f(2x) = 2x+1; (g∘f)(x) = g(x+1) = 2(x+1) = 2x+2.\n\n**Função inversa f⁻¹:** desfaz f. Existe somente se f é **bijetora** (injetora + sobrejetora).\nPara encontrar: escreva y=f(x), isole x em função de y, então f⁻¹(y) = resultado.\nGráfico de f e f⁻¹ são **simétricos em relação à reta y=x**.\nExemplo: log é a inversa da exponencial.',

    'conv.*unidade|unidade.*medida|metro.*quadrado|metro.*c[uú]bico|kg|litro.*m3':
        '**Conversão de Unidades:**\n\n**Comprimento:** km → hm → dam → m → dm → cm → mm (×10 a cada passo p/ esquerda; ÷10 p/ direita).\n\n**Área:** a unidade de área é quadrada, então cada "passo" = ×100 (não ×10).\n1 m² = 100 dm² = 10.000 cm² = 1.000.000 mm². 1 km² = 1.000.000 m².\n\n**Volume:** a unidade de volume é cúbica, cada "passo" = ×1000.\n1 m³ = 1.000 dm³ = 1.000.000 cm³. 1 L = 1 dm³ = 1.000 cm³ = 0,001 m³.\n\n**Massa:** kg → hg → dag → g → dg → cg → mg (×10 cada).',

    'sistema.*linear|equa[cç][aã]o.*sistem|substitui[cç][aã]o.*equa|adi[cç][aã]o.*equa':
        '**Sistemas de Equações Lineares:**\n\n**2 equações, 2 incógnitas:**\n\n**Método da Substituição:** isola uma variável em uma equação e substitui na outra.\n\n**Método da Adição/Eliminação:** some as equações de forma que uma variável seja eliminada (multiplique uma delas por uma constante se necessário).\n\n**Interpretação gráfica:** 2 retas → solução única (ponto de interseção), paralelas (sem solução — SI), coincidentes (infinitas soluções — SPI).\n\n**Regra de Cramer:** xᵢ = det(Aᵢ)/det(A), onde Aᵢ é A com a coluna i substituída por B.',

    // ════════════════════════════════════════════════════════════════════════
    // GERAL / INTERDISCIPLINAR
    // ════════════════════════════════════════════════════════════════════════

    'o que cai.*enem|como.*estudar.*enem|dica.*enem|t[oó]picos.*enem|disciplina.*enem|enem.*dica':
        '**ENEM — Como estudar e o que cai:**\n\n**Estrutura da prova:**\n- Dia 1 (45 questões): Linguagens, Códigos e suas Tecnologias (40) + Redação + Língua Estrangeira (5).\n- Dia 2 (45 questões cada): Ciências Humanas e suas Tecnologias; Ciências da Natureza e suas Tecnologias; Matemática e suas Tecnologias.\n\n**Temas quentes de cada área:**\nMatemática: funções, geometria, probabilidade, estatística, PA/PG, juros.\nNatureza: genética, ecologia, eletrodim., termoquímica, funções org.\nHumanas: modernidade, ditadura, questões socioambientais, filosofia.\nLinguagens: redação (1000 pts), figuras de retórica, variação linguística, gêneros.\n\n**Dica de ouro:** o ENEM foca em **contextualização** — os temas sempre aparecem associados a situações reais. Pratique questões anteriores!',

    'resumo.*biologia|o que cai.*bio|biolog.*enem|dica.*biolog':
        '**Biologia no ENEM — Tópicos mais frequentes:**\n\n1. Ecologia: cadeias alimentares, relações ecológicas, ciclos biogeoquímicos, biomas brasileiros\n2. Genética: Mendel, DNA, síntese de proteínas, mutações\n3. Evolução: Darwin, seleção natural, especiação\n4. Biologia Celular: mitose, meiose, organelas, metabolismo energético\n5. Fisiologia: sistemas cardiovascular, respiratório, nervoso, digestório, endócrino\n6. Botânica: fotossíntese, classificação vegetal\n7. Saúde: doenças, vacinação, imunologia\n8. Biotecnologia: engenharia genética, clonagem, transgênicos\n9. Microbiologia: vírus, bactérias, fungos (doenças e importância)',

    'resumo.*qui|o que cai.*quim|quim.*enem|dica.*quim.*enem':
        '**Química no ENEM — Tópicos mais frequentes:**\n\n1. Funções inorgânicas: ácidos, bases, sais, óxidos\n2. Reações: balanceamento, oxirredução, combustão\n3. Estequiometria: mol, massa molar, cálculos\n4. Tabela periódica e ligações químicas\n5. Soluções: concentração, pH, neutralização\n6. Química orgânica: hidrocarbonetos, funções (álcool, ácido, éster)\n7. Termoquímica: entalpia, Lei de Hess\n8. Eletroquímica: pilhas, eletrólise, corrosão\n9. Polímeros e plásticos (ambiental)\n10. Equilíbrio químico: Le Chatelier',

    'resumo.*fis|o que cai.*fis|fisica.*enem|dica.*fis.*enem':
        '**Física no ENEM — Tópicos mais frequentes:**\n\n1. Mecânica: Leis de Newton, cinemática (MRU, MRUV, queda livre)\n2. Energia: cinética, potencial, conservação, trabalho, potência\n3. Termologia: temperatura, calor, dilatação, termodinâmica (leis)\n4. Óptica: reflexão, refração, lentes, espelhos\n5. Ondulatória: características das ondas, som, efeito Doppler\n6. Eletricidade: Lei de Ohm, circuitos, potência, segurança elétrica\n7. Magnetismo: campo magnético, força magnética, indução eletromagnética\n8. Física Moderna: radioatividade, modelos atômicos, efeito fotoelétrico\n9. Gravitação: Lei de Gravitação Universal, satélites',

    'resumo.*hum|o que cai.*hum|huma.*enem|dica.*huma':
        '**Humanas no ENEM — Tópicos mais frequentes:**\n\n1. História do Brasil: Colonial, Império, República, Era Vargas, Ditadura, Redemocratização\n2. História Geral: Revoluções (Francesa, Industrial, Russa), GF, Guerras Mundiais\n3. Sociologia: Marx, Weber, Durkheim, movimentos sociais\n4. Filosofia: Iluminismo, Contratualismo, Existencialismo, Ética\n5. Geografia brasileira: regiões, biomas, urbanização, questão agrária\n6. Geografia mundial: globalização, blocos econômicos, geopolítica\n7. Temas transversais: racismo, feminismo, questão indígena, desigualdade, meio ambiente, direitos humanos',

    // ════════════════════════════════════════════════════════════════════════
    // MATEMÁTICA — TÓPICOS ADICIONAIS
    // ════════════════════════════════════════════════════════════════════════

    'conjunto|uni[aã]o.*conjunto|interse[cç][aã]o|complementar.*conjunto|diagram.*venn|pertenc':
        '**Teoria dos Conjuntos:**\n\n**Notação:** A = {1, 2, 3}. x∈A (pertence); x∉A (não pertence). Subconjunto: A⊂B (todo elemento de A está em B).\n\n**Operações:**\n- **União (A∪B):** todos os elementos de A ou B (ou ambos). |A∪B| = |A|+|B|−|A∩B|.\n- **Interseção (A∩B):** elementos comuns a A e B.\n- **Diferença (A−B):** elementos de A que não estão em B.\n- **Complementar (A̅):** elementos do universo que não estão em A.\n\n**Diagrama de Venn:** representação visual. Muito cobrado no ENEM em problemas de "quantas pessoas fazem X e Y" — use a fórmula da união.',

    'l[oó]gica.*mat|proposi[cç][aã]o|conectivo.*l[oó]g|tabela.*verdade|se.*ent[aã]o|bicondicional|tautologia':
        '**Lógica Matemática:**\n\n**Proposição:** afirmação verdadeira (V) ou falsa (F). Ex: "2+2=4" é V; "o céu é verde" é F.\n\n**Conectivos:**\n- **Negação (¬p / não p):** inverte o valor lógico.\n- **Conjunção (p∧q / p E q):** V só se ambas V.\n- **Disjunção (p∨q / p OU q):** F só se ambas F.\n- **Condicional (p→q / se p então q):** F somente quando p=V e q=F.\n- **Bicondicional (p↔q):** V quando p e q têm o mesmo valor.\n\n**Tautologia:** sempre V independente dos valores. **Negação do condicional:** ¬(p→q) = p∧¬q.\n\n**Contrapositiva:** p→q equivale a ¬q→¬p (sempre).',

    'n[uú]mero.*natural|n[uú]mero.*inteiro|n[uú]mero.*racional|n[uú]mero.*irracional|n[uú]mero.*real|n[uú]mero.*complex|conjunto.*num|ℕ|ℤ|ℚ|ℝ':
        '**Conjuntos Numéricos:**\n\n**Naturais (ℕ):** {0, 1, 2, 3, ...} — contagem e ordem.\n**Inteiros (ℤ):** {..., −2, −1, 0, 1, 2, ...} — inclui negativos. ℕ⊂ℤ.\n**Racionais (ℚ):** qualquer fração a/b com b≠0, incluindo decimais finitos e dízimas periódicas. ℤ⊂ℚ.\n**Irracionais:** números que não são fração — πdecimais infinitos não periódicos. Ex: √2, π, e.\n**Reais (ℝ):** ℚ ∪ irracionais = todos os pontos da reta numérica.\n**Complexos (ℂ):** z = a+bi, onde i²=−1. Todo real é complexo com b=0. Módulo: |z|=√(a²+b²).',

    '[aâ]ngulo|pol[íi]gono|tri[aâ]ngulo.*ang|quad[rR]il[áa]tero|raz[aã]o.*semel|semelhan|congruên':
        '**Ângulos, Polígonos e Semelhança:**\n\n**Ângulos:** agudo (0°<ϴ<90°), reto (90°), obtuso (90°<ϴ<180°). Suplementares: somam 180°. Complementares: somam 90°.\n\n**Polígonos:** Soma dos ângulos internos = (n−2)×180°. Ex: triângulo=180°, quadrilátero=360°, pentágono=540°.\n\n**Semelhança de triângulos (AA, LAL, LLL):** triângulos semelhantes têm ângulos iguais e lados proporcionais. Razão de semelhança k → áreas em razão k².\n\n**Casos de congruência:** LLL, LAL, ALA, LAAo. Congruentes = mesma forma e tamanho.',

    'c[íi]rculo.*trig|seno.*c[íi]rculo|lei.*seno|lei.*cosseno|arco|radiano|360.*grau':
        '**Trigonometria no Círculo e Leis:**\n\n**Ciclo trigonométrico:** circunferência de raio 1. Ponto P(cosθ, senθ). Radiano: π rad = 180°. Portanto 1 rad ≈ 57,3°.\n\n**Sinais por quadrante:** 1°Q (+,+); 2°Q (−,+); 3°Q (−,−); 4°Q (+,−). Mnemônico: Todos Sortirão Contentes (Todos, Seno, Cosseno, Tg).\n\n**Funções inversas:** arcsen, arccos, arctg (usadas para encontrar ângulos).\n\n**Lei dos Senos:** a/senA = b/senB = c/senC = 2R. **Lei dos Cossenos:** a² = b²+c²−2bc×cosA. Usada quando não há ângulo reto.',

    'trabalho.*f[íi]sic|energia.*mec[aâ]nica|pot[eê]ncia.*fis|conserva[cç][aã]o.*energia|energia.*cin|energia.*pot':
        '**Trabalho, Energia e Potência:**\n\n**Trabalho** (τ): τ = F×d×cosθ (força × deslocamento × cos do ângulo entre eles). Joule (J). τ>0: a força favorece o movimento; τ<0: a força se opõe.\n\n**Energia Cinética:** Ec = mv²/2. **Energia Potencial Gravitacional:** Ep = mgh. **Energia Elástica:** Ee = kx²/2.\n\n**Teorema trabalho-energia:** τ_resultante = ΔEc. **Conservação de energia mecânica** (sem atrito): Ec+Ep = constante.\n\n**Potência:** P = τ/t = F×v. Unidade: Watt (W) = J/s. Rendimento (η) = P_útil/P_total.',

    'impulso|quantidade.*movimento|momento.*linear|colis[aã]o|conserva[cç][aã]o.*momento':
        '**Quantidade de Movimento e Impulso:**\n\n**Quantidade de movimento (momento linear):** p = m×v (kg·m/s).\n\n**Impulso:** I = F×Δt = Δp (variação da quantidade de movimento). Δp = m×Δv.\n\n**Conservação do momento linear:** em sistema isolado (sem forças externas), Σpantes = Σpdepois.\n\n**Colisões:**\n- **Perfeitamente elástica:** conserva energia cinética e momento (bilhar).\n- **Perfeitamente inelástica:** os corpos ficam juntos; conserva só o momento; máxima perda de Ec.\n- **Parcialmente inelástica:** caso intermediário (mais comum).\n\n**Aplicações:** foguetes, explosões, freios de veículos, acidentes de trânsito.',

    'calorimetria|calor.*espec[íi]fico|Q.*mc|calor.*latente|mudan[cç]a.*estado|isotérmico|isob[áa]ric|isocor|adiabát':
        '**Calorimetria:**\n\n**Calor sensível:** Q = m×c×ΔT (m=massa em kg, c=calor específico em J/kg·K, ΔT=variação de temperatura).\n- Água: c = 4.186 J/kg·K ≈ 1 kcal/kg·°C.\n\n**Calor latente (mudança de fase):** Q = m×L (sem variação de temperatura). Fusão (sólido→líquido) e vaporização (líquido→gás) absorvem calor; solidificação e condensação liberam.\n\n**Equilíbrio térmico:** calor cedido = calor recebido. Q_cedido + Q_recebido = 0. Usado em exercícios de mistura de líquidos.\n\n**Escalas:** K = °C + 273; °F = 1,8×°C + 32; °C = (°F−32)/1,8.',

    'modelo.*at[oô]mico|Thomson|Rutherford|Bohr|mecânica.*qu[aâ]ntica.*at[oö]m|nível.*energia|orbital':
        '**Modelos Atômicos:**\n\n**Dalton (1808):** átomos são esferas maciças indivisíveis. Cada elemento tem um tipo de átomo.\n\n**Thomson (1897):** "pudim de passas" — elétrons negativos espalhados numa esfera positiva. Descobriu o elétron.\n\n**Rutherford (1911):** ouro bombardeado por partículas α → núcleo denso e positivo + espaço vazio. Átomo = núcleo + eletrosfera.\n\n**Bohr (1913):** elétrons em órbitas circulares com energias fixas (níveis). Absorvem (nível sobe) ou emitem (nível desce) fótons de luz com E=hf. Explica o espectro do hidrogênio.\n\n**Modelo atual (mecânica quântica):** orbitais = nuvem de probabilidade (s, p, d, f). Configuração eletrônica: 1s²2s²2p⁶...',

    'efeito.*fotoel[eé]trico|f[oó]ton|luz.*quant|planck|dualidade.*onda|comprimento.*onda.*luz':
        '**Física Moderna — Efeito Fotoelétrico e Quantização:**\n\n**Efeito fotoelétrico (Einstein, 1905):** luz incide em metal e ejecta elétrons. Isso prova que a luz tem natureza **corpuscular** (fótons). A energia do fóton: E = h×f (h = cte de Planck = 6,63×10⁻³⁴ J·s).\n\nFrequência limiar f₀: abaixo dela, não há ejeção independente da intensidade. Acima: máx. energia cinética do elétron = hf − φ (φ = trabalho de extração).\n\n**Dualidade onda-partícula** (De Broglie): toda partícula tem comprimento de onda λ = h/mv. Confirmado na difração de elétrons.\n\n**Quantização:** Planck: energia emitida/absorvida em "quanta" E=nhf. Base da mecânica quântica.',

    'gravita[cç][aã]o|lei.*newton.*gravit|acelera[cç][aã]o.*gravidade|sat[eé]lite|[oó]rbita|peso.*planeta':
        '**Gravitação Universal:**\n\n**Lei de Newton:** F = G×m₁×m₂/d² (G = 6,67×10⁻¹¹ N·m²/kg²). A força é sempre atrativa, proporcional às massas e inversamente proporcional ao quadrado da distância.\n\n**Peso:** P = m×g. g depende do local: na superfície terrestre g ≈ 9,8 ≈ 10 m/s². Em outro planeta: g = G×M/R².\n\n**Satélites (órbita circular):** Fg = Fcp → G×M×m/r² = m×v²/r → v = √(GM/r). Quanto maior a órbita, menor a velocidade.\n\n**Kepler:** 1ª Lei (órbitas elípticas), 2ª Lei (áreas iguais em tempos iguais), 3ª Lei: T²/r³ = constante para todos os satélites de um mesmo corpo central.',

    // ════════════════════════════════════════════════════════════════════════
    // QUÍMICA — TÓPICOS ADICIONAIS
    // ════════════════════════════════════════════════════════════════════════

    'eletrqu[íi]mica|eletrolise|pilha|[aâ]nodo|c[aâ]todo|oxida[cç][aã]o.*poten|pot.*redu[cç]|ddp.*quim|galv[aâ]nica':
        '**Eletroquímica:**\n\n**Pilha (Daniell e outras):** converte energia química em elétrica. **Ânodo (−):** oxidação (perde e⁻). **Cátodo (+):** redução (ganha e⁻). Mnemônico: **ORANC/RCAP** — Oxidação no Ânodo Negativo / Redução no Cátodo Positivo.\n\n**ddp (fem):** diferença de potencial da pilha = E°cátodo − E°ânodo. Se positive → reação espontânea.\n\n**Eletrólise:** processo NÃO espontâneo (força elétrica externa). Fonte positiva → ânodo (oxidação); negativa → cátodo (redução). Aplicações: galvanoplastia (cromação, niquelagem), produção de Al, Cl₂, NaOH.\n\n**Lei de Faraday:** massa depositada = (M×i×t) / (n×F). F = 96500 C/mol.',

    'isomeria|isômer|óptica.*org|geométrica.*org|posic[aã]o.*org|cadeia.*isomeria|estereoisomeria':
        '**Isomeria Orgânica:**\n\n**Isômeros:** mesma fórmula molecular, estruturas diferentes.\n\n**Isomeria Plana (Constitutional):**\n- Cadeia: diferente tipo de cadeia (aberta×fechada, ramificada×linear)\n- Posição: mesmo grupo funcional em C diferente\n- Função: grupos funcionais diferentes (álcool×éter, aldeído×cetona, ácido×éster)\n- Metameria: heteroátomo em posição diferente (éteres diferentes)\n- Tautomeria: equilíbrio dinâmico (ceto-enólica)\n\n**Isomeria Espacial:**\n- Geométrica (cis/trans): em alcenos ou anéis — grupos iguais no mesmo lado (cis) ou lados opostos (trans)\n- Óptica: carbonos assimétricos (quiral) → dextrógiro (+) ou levógiro (−) → atividade óptica',

    'gases.*lei|lei.*boyle|lei.*charles|lei.*gay.lussac|transformação.*gas|l.*gas.*ideais':
        '**Leis dos Gases:**\n\n**Gás ideal:** partículas com volume desprezível e sem interações entre si. Equação geral: P×V = n×R×T (R = 8,31 J/mol·K).\n\n**Transformações:**\n- **Isotérmica** (T=cte, Boyle): P₁×V₁ = P₂×V₂ — pressão e volume inversamente proporcionais.\n- **Isobárica** (P=cte, Charles): V₁/T₁ = V₂/T₂ — volume proporcional à temperatura.\n- **Isocórica/Isométrica** (V=cte, Gay-Lussac): P₁/T₁ = P₂/T₂ — pressão proporcional à temperatura.\n- **Adiabática** (Q=0): sem troca de calor com o exterior.\n\n**Transformação geral:** P₁V₁/T₁ = P₂V₂/T₂. Sempre use temperatura em Kelvin!',

    'coloide|sol.*coloidal|efeito.*tyndall|emuls[aã]o|gel|aerossol|dispersão':
        '**Sistemas Dispersos e Coloides:**\n\n**Tipos de sistemas dispersos** (pelo tamanho das partículas):\n- **Solução verdadeira:** partículas < 1 nm (íons, moléculas). Transparente, não separa por filtração. Ex: água salgada.\n- **Coloide/Solução coloidal:** partículas 1–1000 nm. Efeito Tyndall (desvio de luz visível). Ex: leite, névoa, sangue, gelatina, maionese.\n- **Suspensão:** partículas > 1000 nm. Turvo, separa por filtração ou decantação. Ex: água com argila.\n\n**Tipos de coloides:** gel (sólido em líquido), aerossol (líquido ou sólido em gás — spray, neblina), emulsão (líquido em líquido — maionese), espuma (gás em líquido). **Tyndall:** feixe de luz visível em coloide, invisível em solução verdadeira.',

    'biomol[eé]cula|vitamina|mineral.*nutri|carbo.*org|lip[íi]dio|prote[íi]na.*bioquim|enzima|hormônio.*quim':
        '**Biomoléculas:**\n\n**Carboidratos:** fórmula geral Cₙ(H₂O)ₙ. Monossacarídeos (glicose, frutose, galactose), dissacarídeos (sacarose=glicose+frutose; lactose=glicose+galactose), polissacarídeos (amido, celulose, glicogênio). Fonte de energia rápida; celulose=fibra (não digerida).\n\n**Lipídios:** ácidos graxos + glicerol → triglicerídeos. Saturados (gordura animal, sólidos), insaturados (vegetal, líquidos). Fosfolipídios = membrana celular. Colesterol: precursor hormônios e bile.\n\n**Proteínas:** polipeptídeos = cadeia de aminoácidos ligados por ligações peptídicas (−CO−NH−). Estrutura 1°, 2°, 3°, 4°. Enzimas (catalisadores biológicos) são proteínas. Desnaturação: perde estrutura 3D (calor, pH extremo).',

    // ════════════════════════════════════════════════════════════════════════
    // BIOLOGIA — TÓPICOS ADICIONAIS
    // ════════════════════════════════════════════════════════════════════════

    'imunolog|vacina|anticorp|antígeno|sistema.*imune|imunidade|resposta.*imune|linf[oó]cito|linfoc':
        '**Imunologia e Vacinação:**\n\n**Imunidade inata:** inespecífica, rápida; barreiras físicas (pele, muco), fagócitos (neutrófilos, macrófagos), inflamação, febre.\n\n**Imunidade adaptativa:** específica e com memória. **Linfócitos B** (produzem anticorpos/imunoglobulinas). **Linfócitos T** (auxiliares, citotóxicos).\n\n**Anticorpos:** proteínas em forma de Y que reconhecem e se ligam ao antígeno específico → marcam para destruição.\n\n**Vacinas:** introduzem antígenos atenuados, mortos ou fragmentos → sistema imune "aprende" sem adoecer → memória imunológica. Tipos: atenuadas (mais eficaces, ex: sarampo), inativadas (ex: gripe), subunitárias, mRNA (COVID-19).\n\n**Soros:** anticorpos prontos para neutralização imediata (veneno de cobra, tétano de emergência).',

    'sistema.*digest[oó]r|digest[aã]o|intestin|est[oô]mago|f[íi]gado.*digest|p[aâ]ncreas.*digest|encopropasm|enzimap.*diget':
        '**Sistema Digestório:**\n\nBoca → Faringe → Esôfago → Estômago → Intestino Delgado → Intestino Grosso → Reto → Ânus.\n\n**Boca:** amilase salivar (amido→maltose). **Estômago:** ácido clorídrico (pH 1-2), pepsina (proteínas). **Fígado:** produz bile (emulsifica gorduras). **Pâncreas:** suco pancreático (amilase, lipase, proteases).\n\n**Intestino delgado** (12m): maior absorção — vilosidades e microvilosidades ampliam área. Absorsão: glucose, AAs, ácidos graxos entram nos capilares/vasos linfáticos (quilo).\n\n**Intestino grosso:** absorção de água e sais minerais; flora intestinal; formação e eliminação das fezes.',

    'sistema.*excretor|rim|n[eé]fron|urina|filtração.*gl|t[úu]bulo|diurese|ureter|bexiga':
        '**Sistema Excretor:**\n\n**Rins** (principal órgão excretor): filtram ~180L de plasma/dia. Cada rim tem ~1 milhão de néfrons.\n\n**Néfron:** glomérulo (filtração por pressão) → cápsula de Bowman (ultrafiltrado) → túbulos (reabsorção de glicose, AAs, H₂O, sais) → ducto coletor.\n\nA urina final (1-2L/dia) contém: ureia (produto do catabolismo de proteínas), ácido úrico, creatinina, sais e água em excesso.\n\n**Hormônios reguladores:** ADH (vasopressina, do hipotálamo) → aumenta reabsorção de H₂O. Aldosterona (adrenal) → aumenta reabsorção de Na⁺.\n\n**Outros órgãos excretores:** pulmões (CO₂ e vapor d\'água), pele (suor = água + sais + ureia), fígado (bile).',

    'reprodu[cç][aã]o.*humana|fecunda[cç][aã]o|embriol|gesta[cç][aã]o|gameta|espermatozo|[oó]vulo|menstrua|hormônio.*sexual':
        '**Reprodução Humana e Embriologia:**\n\n**Gametogênese:** Espermatogênese (testículos, 4 espermatozoides/meiose). Oogênese (ovários, 1 óvulo maduro + 3 corpos polares).\n\n**Fecundação:** espermatozóide + óvulo → zigoto (2n). Ocorre nas tubas uterinas. **Desenvolvimento:** Mórula → Blástula → Gástrula → Organogênese (3 folhetos: ectoderma, mesoderma, endoderma → órgãos).\n\n**Hormônios:** LH e FSH (hipófise) controlam o ciclo menstrual (28 dias). Estrogênio e progesterona (ovário). hCG: hormone da gravidez (detectado no teste).\n\n**Métodos contraceptivos:** barreira (camisinha — também previne DSTs), hormonais (pílula, DIU hormonal), cirúrgico (laqueadura, vasectomia), comportamental (menos eficientes).',

    'biotecnolog|transg[eê]nico|engenharia.*gen[eé]tica|clonagem|pcr|crispr|sequenci.*dna|oms.*gen':
        '**Biotecnologia e Engenharia Genética:**\n\n**DNA recombinante:** gene de interesse cortado por enzimas de restrição e inserido em vetor (plasmídeo bacteriano). Bactéria expressa a proteína humana. Ex: insulina humana produzida por *E. coli*.\n\n**PCR (Polymerase Chain Reaction):** amplifica fragmentos específicos de DNA bilhões de vezes. Aplicações: diagnóstico de doenças, identificação forense, paternidade, Covid-19.\n\n**CRISPR-Cas9:** "tesoura molecular" que edita genes com precisão. Potencial para curar doenças genéticas. Gera debates éticos sobre "bebês de design".\n\n**Transgênicos:** soja RR (resistente a herbicida), milho Bt (produz inseticida). Debate: segurança alimentar, biodiversidade, monopólio de sementes.\n\n**Clonagem:** reprodutiva (Dolly, 1996) e terapêutica (células-tronco).',

    'bot[aâ]nica|plant.*celul|fototr[oó]fico|briófita|pterid[oó]fit|gimnosperma|angiosperma|flor|semente|fruto.*biolog':
        '**Botânica — Classificação Vegetal:**\n\n**Divisão principal:**\n- **Briófitas** (musgos): sem raiz, caule ou folha verdadeiros; sem vasos condutores; reprodução por esporos; necessitam de água para fecundação.\n- **Pteridófitas** (samambaias, avencas): têm vasos condutores (xilema/floema); sem sementes; se reproduzem por esporos.\n- **Gimnospermas** (pinheiros, araucárias): têm sementes, mas sem fruto; sementes "nuas" em cones/estrobilos. Pólen pelo vento.\n- **Angiospermas** (maioria das plantas): têm flor, fruto e semente envolta. As mais evoluídas. Monocotiledôneas (milho, grama — 1 cotilédone, folhas paralelas) vs. Dicotiledôneas (feijão, roseiras — 2 cotilédones, folhas reticuladas).',

    'parasitol|doen[cç]a.*infec|dengue|malaria|esquistossomose|doença.*chagas|verminose|leptospiros|hiv.*aids|hepatite.*virus':
        '**Doenças Infecciosas e Parasitárias:**\n\n**Viroses:** Dengue (Aedes aegypti, 4 sorotipos, febre alta + dor), Zika (microcefalia, Aedes), HIV/AIDS (retrovírus, destrói linfócitos T CD4+), Sarampo (preventável por vacina), COVID-19 (SARS-CoV-2, coronavírus).\n\n**Bacterioses:** Tuberculose (Mycobacterium tuberculosis, vias aéreas), Hanseníase, Leptospirose (contato com água contaminada), Sífilis (DST, Treponema pallidum).\n\n**Protozooses:** Malária (Plasmodium, veiculado pelo Anopheles), Doença de Chagas (Trypanosoma cruzi, barbeiro), Leishmaniose.\n\n**Helmintoses (vermes):** Esquistossomose (Schistosoma mansoni, água doce), Ascaris lumbricoides (lombriga, fecal-oral).\n\n**Prevenção:** saneamento básico, vacinas, mosquiteiros, higiene.',

    // ════════════════════════════════════════════════════════════════════════
    // CIÊNCIAS HUMANAS — TÓPICOS ADICIONAIS
    // ════════════════════════════════════════════════════════════════════════

    'egito.*anti|mesopotamia|gr[eé]cia.*anti|fenícia|impérios.*anti|civiliza[cç][aã]o.*anti':
        '**Civilizações Antigas:**\n\n**Mesopotâmia** (entre Tigre e Eufrates, atual Iraque): Sumérios (escrita cuneiforme, primeiros registros históricos), Babilônios (Código de Hamurabi — "olho por olho"), Assírios, Persas.\n\n**Egito Antigo:** teocracia (Faraó = deus-rei), hieróglifos, pirâmides, escrita no papiro, inundações do Nilo fertilizavam o solo. Divisão: Antigo, Médio e Novo Império.\n\n**Fenícios:** grandes comerciantes mediterrâneos; criaram o alfabeto fonético (base do alfabeto latino/grego).\n\n**Grécia Antiga:** polis, democracia ateniense, filosofia, teatro, Jogos Olímpicos. Alexandre Magno → Helenismo (fusão greco-oriental, séc. IV a.C.).',

    'quest[aã]o.*agr[aá]ria|latif[uú]ndio|reforma.*agr[aá]ria|mst|sem.*terra|agro.*brasil|agroneg[oó]cio|desiguald.*terra':
        '**Questão Agrária Brasileira:**\n\n**Concentração fundiária:** Brasil tem um dos piores índices de Gini da terra do mundo. Herança colonial: sesmarias, capitanias hereditárias → latifúndios. Sem reforma agrária estruturada.\n\n**MST (Movimento dos Sem Terra):** maior movimento social da América Latina. Faz ocupações de terras improdutivas reivindicando a Função Social da Propriedade (Art. 186, CF/88).\n\n**Agronegócio vs. Agricultura familiar:** agronegócio (soja, cana, pecuária) domina exportações, mas concentra terra e usa intensivamente defensivos. Agricultura familiar: 70% dos alimentos consumidos internamente, mais emprego por hectare.\n\n**Conflitos:** garimpo e grilagem em terras indígenas e quilombolas, violência no campo (relatórios CPT).',

    'movimentos.*sociais|feminism|lgb|racismo.*social|cotas.*uni|desigualdade.*social|direitos.*negr|afirmat':
        '**Movimentos Sociais Contemporâneos:**\n\n**Feminismo:** lutas pela igualdade de gênero. Ondas: sufrágio (1ª), igualdade de direitos/sexualidade (2ª), interseccionalidade (3ª), digital/MeToo (4ª). No Brasil: Lei Maria da Penha (2006), "Não é não", feminicídio como crime hediondo.\n\n**Movimento Negro:** combate ao racismo estrutural (Silvio Almeida). Cotas raciais (Lei 12.711/2012): reserva vagas em universidades e concursos federais. STF validou em 2012/2024. Consciência Negra: 20 de novembro (Zumbi).\n\n**LGBTQIA+:** criminalização da homofobia (STF, 2019). Casamento igualitário (resolução CFJ, desde 2013). Ainda sem proteção legal específica no Congresso.\n\n**Interseção:** Kimberlé Crenshaw — opressões se somam. Mulher negra pobre enfrenta mais barreiras que qualquer combinação parcial.',

    'blocos.*econ[oô]m|uni[aã]o.*europ[eé]|mercosul|brics|nafta.*usmca|alca|asean|geopolit':
        '**Blocos Econômicos e Geopolítica:**\n\n**União Europeia (UE):** bloco de integração mais avançado. Mercado comum, moeda única (euro, 20 países), livre circulação de pessoas. Parlamento Europeu. Brexit: Reino Unido saiu em 2020.\n\n**MERCOSUL:** Brasil, Argentina, Uruguai, Paraguai + associados. Zona de livre comércio + negociações com a UE (acordo assinado, em ratificação). Renda e tamanho tornam o Brasil o líder.\n\n**BRICS:** Brasil, Rússia, Índia, China, África do Sul (+ novos membros desde 2024). Cooperação Sul-Sul, alternativa ao FMI/BM ocidental.\n\n**USMCA (ex-NAFTA):** EUA, Canadá e México. **ASEAN:** Sudeste Asiático.\n\n**Geopolítica atual:** ascensão da China, conflito Rússia-Ucrânia (2022), tensões Taiwan, unipolaridade americana em questão, multilateralismo.',

    'desigualdade.*mundo|desigualdade.*brasil|gini|pobreza|idhm?|desenvolvimento.*human|vulnerabilidade.*social':
        '**Desigualdade e Desenvolvimento Humano:**\n\n**Índice de Gini:** mede desigualdade de renda. 0 = perfeita igualdade; 1 = máxima desigualdade. Brasil ≈ 0,52 (um dos mais desiguais).\n\n**IDH** (ONU): combina longevidade (saúde), educação e renda. Brasil é IDH alto (~0,76, mas cai quando ajustado pela desigualdade).\n\n**Causas da desigualdade no Brasil:** herança escravocrata, concentração fundiária, sistema tributário regressivo (paga mais quem consome → penaliza pobres), acesso desigual à educação de qualidade.\n\n**Políticas de redução:** Bolsa Família (transferência condicionada), cotas, PROUNI/FIES, acesso ao SUS, CRAS/SUAS, salário mínimo, reforma tributária (progressividade).',

    '[eé]tica|moral.*filos|utilitarismo|kant.*[eé]tica|virtude.*[eé]|deontolog|bioética':
        '**Ética e Moral — Filosofia:**\n\n**Ética:** estudo filosófico dos valores morais e princípios que guiam a conduta humana.\n**Moral:** conjunto de normas e costumes de uma sociedade específica (pode variar).\n\n**Principais teorias éticas:**\n- **Ética das Virtudes** (Aristóteles): ser virtuoso é agir pelo justo meio entre extremos. Virtudes = felicidade (eudaimonia).\n- **Deontologia/Ética do Dever** (Kant): age só conforme máximas que possam ser leis universais. O dever é absoluto, independente das consequências.\n- **Utilitarismo** (Bentham, Mill): a ação moralmente correta maximiza a utilidade/felicidade do maior número de pessoas. Consequencialista.\n- **Ética do Cuidado** (Carol Gilligan): relações interpessoais e responsabilidade pelo outro.\n\n**Bioética:** dilemas éticos na medicina e ciências da vida (aborto, eutanásia, clonagem, transgênicos).',

    'filosofia.*pol[íi]tica|estado.*nasc|contratualismo|hobbes|locke.*pol|montesquieu|poder|soberania.*povo':
        '**Filosofia Política e o Estado:**\n\n**Problema:** por que os seres humanos precisam de Estado/governo?\n\n**Contratualistas:** sociedade civil surge de um "contrato social" que substitui o estado de natureza:\n- **Hobbes** (*Leviatã*): natureza = guerra de todos contra todos ("homo homini lupus"). Para a paz, cede-se todo poder ao soberano absoluto.\n- **Locke:** natureza é relativamente pacífica. Contrato garante vida, liberdade e propriedade. O povo pode resistir a governos tirânicos — base do liberalismo.\n- **Rousseau:** natureza = homem bom. A sociedade o corrompeu. Soberania emana da "vontade geral" do povo — soberania popular inalienável.\n\n**Montesquieu:** separação dos três poderes (Executivo, Legislativo, Judiciário) para evitar o despotismo. Base do constitucionalismo moderno.',

    'mídia|fake.*news|redes.*sociais.*soc|comunica[cç][aã]o.*massa|jornalismo.*cr[íi]t|desinforma|p[oó]s.*verdade':
        '**Mídia, Comunicação e Desinformação:**\n\n**Meios de comunicação de massa:** rádio, TV, jornal, internet. Influenciam a opinião pública, constroem narrativas e podem impor ou questionar hegemonias.\n\n**Teoria da Agenda Setting:** a mídia não diz ao público O QUE pensar, mas SOBRE O QUE pensar — determina quais assuntos têm relevância.\n\n**Fake News e Desinformação:** conteúdo falso ou enganoso disseminado intencionalmente. Potencializado por algoritmos de redes sociais (câmeras de eco, bolhas informativas). Consequências: saúde pública (antivacinas), democracia (eleições), violência.\n\n**Pós-verdade:** apelos emocionais e crenças pessoais importam mais do que fatos verificáveis. Ferramentas de verificação: fact-checking (Agência Lupa, Aos Fatos, Estadão Verifica).',

    'meio.*ambiente|sustentab|desmatam|amazônia.*desmat|clima|carbon|emiss[aã]o|renov[aá]vel|poluição':
        '**Meio Ambiente e Sustentabilidade:**\n\n**Problemas ambientais:** desmatamento (Amazônia perde ~11.000 km²/ano), degradação do Cerrado, poluição hídrica, plásticos nos oceanos, extinção de espécies, emissões de GEE.\n\n**Aquecimento global:** CO₂, CH₄, N₂O e outros gases → efeito estufa reforçado → aumento de temperatura → eventos extremos, acidificação dos oceanos, derretimento das geleiras.\n\n**Desenvolvimento sustentável** (Brundtland): satisfazer as necessidades presentes sem comprometer as gerações futuras. Pilares: econômico, social, ambiental.\n\n**Instrumentos de política ambiental:** Código Florestal, Licenciamento Ambiental, PSA (Pagamento por Serviços Ambientais), mercado de carbono, transição energética (solar/eólica).\n\n**ODS e Agenda 2030:** 17 objetivos, 169 metas da ONU para um mundo mais sustentável e justo.',

    'egito.*ant|mesopotam|fenicia|babilon|grecia.*ant|roma.*ant|antiguidade':
        '**Antiguidade Oriental e Ocidental:**\n\n**Mesopotâmia:** Sumérios (escrita cuneiforme, ciudad-estado), Babilônios (Código de Hamurabi, Jardins Suspensos), Assírios (militarismo), Persas (Ciro, Zoroastrismo). Entre os rios Tigre e Eufrates (atual Iraque/Irã/Síria).\n\n**Egito:** 3 mil anos de civilização. Faraó (deus-rei), hieróglifos, escrita em papiro, múmias, pirâmides. Agricultura dependente do Nilo. Cleopatra = último faraó (I a.C.). Conquistado por Roma em 30 a.C.\n\n**Fenícios:** no atual Líbano. Grandes navegadores e comerciantes. Criaram o alfabeto fonético (~22 letras) — base do nosso.\n\n**Hebreus:** monoteísmo (judaísmo), Torá, Moisés, período dos Juízes e Reis (Davi, Salomão), Diáspora.',

    // ════════════════════════════════════════════════════════════════════════
    // LINGUAGENS — TÓPICOS ADICIONAIS
    // ════════════════════════════════════════════════════════════════════════

    'fun[cç][oõ]es.*linguagem|jakobson|emotiva|conativa|[áa]tica|metalinguíst|referencial.*ling|poética.*ling':
        '**Funções da Linguagem (Jakobson):**\n\n**Referencial/Denotativa:** foco no contexto/assunto — transmite informações objetivas. Linguagem denotativa. Ex: notícias, textos científicos.\n\n**Emotiva/Expressiva:** foco no emissor — exprime emoções, sentimentos, subjetividade. Uso de 1ª pessoa. Ex: poesia lírica, relatos pessoais.\n\n**Conativa/Apelativa:** foco no receptor — persuadir ou incitar uma ação. Verbos no imperativo. Ex: publicidade, discursos políticos.\n\n**Fática:** foco no canal — verificar se a comunicação funciona. Ex: "Alô? Está me ouvindo?".\n\n**Poética:** foco na mensagem — valorizar a forma, o estilo. Ex: literatura, slogan criativo, trocadilhos.\n\n**Metalinguística:** foco no código — a linguagem fala de si mesma. Ex: dicionário, gramática, crítica literária.',

    'publicidade|propaganda.*ling|slogan|anúncio.*tex|discurso.*publicit|argumento.*publi':
        '**Publicidade e Propaganda:**\n\n**Diferença:** **Publicidade** promove produtos/serviços (fim comercial). **Propaganda** difunde ideias, valores ou candidatos (fim político/ideológico).\n\n**Recursos retóricos:**\n- **Pathos:** apelo emocional (medo, amor, pertencimento, desejo)\n- **Logos:** apelo racional (dados, eficiência, preço, características)\n- **Ethos:** apelo à credibilidade (especialista, celebridade, tradição)\n\n**Figuras frequentes:** hipérbole (exagero do benefício), metáfora, eufemismo, slogan (frase curta e memorável), jingle.\n\n**Ideologia na publicidade:** perpetua padrões de beleza, consumismo, estereótipos de gênero/raça ou pode questioná-los (publicidade inclusiva). O ENEM cobra análise crítica dessas mensagens.',

    'g[eê]nero.*digital|texto.*digital|meme|blog|redes.*soc.*texto|hipertexto|infogr[aá]fico':
        '**Gêneros Digitais e Linguagem na Internet:**\n\n**Hipertexto:** texto não linear com links que conectam outros textos, imagens, vídeos. Leitura em rede, não sequencial.\n\n**Gêneros digitais:** e-mail, chat, tweet/post, blog, podcast, videoaula, meme, story, feed. Cada um tem linguagem, formato e propósito próprios.\n\n**Meme:** unidade cultural que se replica e muta (conceito de Dawkins, 1976). Na internet: imagem+texto humorístico com referência cultural. Intertextualidade veloz.\n\n**Infográfico:** combina dados + imagens + texto curto para visualizar informações complexas. Exige leitura multimodal. Muito cobrado no ENEM: interprete o visual e os números juntos.\n\n**Linguagem nos chats:** abreviações, emoticons, ausência de pontuação → variedade informal. Contraste com norma padrão — variação linguística situacional.',

    'análise.*sintát|sujeito.*predicado|objeto.*direct|objeto.*indir|adjunto|predicat|ora[cç][aã]o.*subord|per[íi]odo.*composto':
        '**Análise Sintática Básica:**\n\n**Período simples:** uma oração. **Período composto:** duas ou mais orações.\n\n**Termos essenciais:**\n- **Sujeito:** de quem se fala. Pode ser determinado (simples/composto), indeterminado ou inexistente (oração sem sujeito: "Choveu"; "Há falta de água"; "É tarde").\n- **Predicado:** o que se diz do sujeito. Verbal (VP, com VTD/VTI/VITD/VI), nominal (contém predicativo), verbo-nominal.\n\n**Termos integrantes:** objeto direto (sem preposição), objeto indireto (com preposição), complemento nominal, agente da passiva.\n\n**Termos acessórios:** adjunto adnominal (qualifica o substantivo), adjunto adverbial (modifica verbo/adj/adv), aposto (explica), vocativo (chamamento).\n\n**Subordinadas:** substantivas (função de substantivo), adjetivas (função de adj., incluindo relativas), adverbiais (função de advérbio — causais, concessivas, condicionais, etc.).',

    'literatura.*portugu[eê]sa|cam[oõ]es|fernan.*pessoa|eça.*queir|lua.*camilo|florbela|s[eé]culo.*portug':
        '**Literatura Portuguesa — Principais Autores:**\n\n**Trovadorismo** (séc. XII-XVI): cantigas de amor (homem fala de amada), de amigo (mulher fala do namorado), de escárnio e maldizer (satírica). Primeiros textos em galego-português.\n\n**Classicismo/Humanismo** (séc. XVI): Luís de Camões — *Os Lusíadas* (epopeia, narrando a viagem de Vasco da Gama), sonetos líricos ("Amor é fogo que arde sem se ver"). Gil Vicente: teatro — *Auto da Barca do Inferno*.\n\n**Realismo/Naturalismo** (séc. XIX): Eça de Queirós — *O Crime do Padre Amaro*, *O Primo Basílio*. Crítica à hipocrisia da burguesia portuguesa.\n\n**Modernismo português** (séc. XX): Fernando Pessoa (ortônimo + heterônimos: Alberto Caeiro, Ricardo Reis, Álvaro de Campos). Mensagem (única obra em português). *"Fingidor"*: "O poeta é um fingidor...".',

    'literatura.*african|mpb.*liter|lusofon|angola.*liter|mo[cç]ambi|cabo.*verde.*lit|negritude':
        '**Literaturas de Língua Portuguesa — África:**\n\n**Negritude:** movimento literário e político que valoriza a identidade e cultura negra africana. Motivado pela descolonização e resistência ao colonialismo. Autores: Léopold Sédar Senghor (Senegal), Aimé Césaire (Martinica — influência no Brasil).\n\n**Angola:** José Saramago de Andrade (Agostinho Neto, primeiro presidente), Pepetela (*Mayombe*, *A Geração da Utopia*).\n\n**Moçambique:** Mia Couto (mistura de português e línguas bantu — *Terra Sonâmbula*, *O Último Voo do Flamingo*). Metáforas da guerra e identidade.\n\n**Cabo Verde:** Eugênio Tavares, os "claridosos" — mistura de culturas europeia e africana.\n\nNo ENEM: temas de colonialismo, identidade, hibridismo cultural e resistência.',

    'estilística|registros.*ling|formalidade|norma.*padrão|língua.*cult|norma.*cult|diafásic':
        '**Registro e Níveis de Formalidade:**\n\n**Norma culta/padrão:** variedade de prestígio, descrita pelas gramáticas normativas. Usada em situações formais: documentos oficiais, redação, discursos acadêmicos.\n\n**Norma popular/coloquial:** variedade usada no cotidiano. NÃO é errada — é adequada ao contexto. O preconceito linguístico rejeita injustamente essas variedades associadas a grupos marginalizados.\n\n**Adequação ao contexto (Diafasia):** o falante habilidoso adapta o registro à situação. Falar com amigos (informal) ≠ escrever uma petição (formal). O ENEM nunca pergunta "qual forma está errada", mas "qual forma é adequada à situação X".\n\n**Estilística:** estudo dos recursos expressivos da língua. O autor escolhe as palavras, estruturas e figuras de acordo com o efeito que quer produzir.',

    // ════════════════════════════════════════════════════════════════════════
    // BROAD DISCIPLINA PATTERNS — capturam qualquer pergunta ampla
    // ════════════════════════════════════════════════════════════════════════

    '\\bfísica\\b|\\bfisica\\b|explique.*física|estud.*física|aprend.*física|me.*fale.*fís|o que [eé].*física|resumo.*física':
        '**Física — Visão Geral para o ENEM:**\n\nA Física do ENEM está organizada em grandes temas:\n\n**Mecânica (mais cobrada):** Leis de Newton (F=ma, ação-reação), cinemática (MRU, MRUV, queda livre), trabalho/energia/potência, quantidade de movimento, gravitação.\n\n**Termologia:** temperatura, calor, calorimetria (Q=mcΔT), dilatação, leis da termodinâmica, gases ideais (PV=nRT).\n\n**Óptica:** reflexão, refração (Snell-Descartes), lentes e espelhos, dispersão da luz.\n\n**Ondulatória:** v=λf, som, efeito Doppler, espectro eletromagnético.\n\n**Eletricidade:** Lei de Ohm (V=RI), circuitos série/paralelo, potência, campo e força elétrica.\n\n**Física Moderna:** radioatividade, modelos atômicos, efeito fotoelétrico, relatividade.\n\nPergunta qual tema específico você quer aprofundar!',

    '\\bquímica\\b|\\bquimica\\b|explique.*química|estud.*química|aprend.*química|o que [eé].*química|resumo.*química':
        '**Química — Visão Geral para o ENEM:**\n\nOs principais temas cobrados são:\n\n**Química Geral:** tabela periódica, modelos atômicos, ligações químicas (iônica, covalente, metálica).\n\n**Química Inorgânica:** funções (ácidos, bases, sais, óxidos), reações, balanceamento, oxirredução, estequiometria.\n\n**Físico-Química:** soluções, pH, termoquímica (entalpia, Lei de Hess), cinética química, equilíbrio (Le Chatelier), eletroquímica (pilhas, eletrólise).\n\n**Química Orgânica:** hidrocarbonetos, funções (álcool, aldeído, cetona, ácido, éster), reações (adição, eliminação, substituição), isomeria, polímeros.\n\nO ENEM quase sempre contextualiza Química com aplicações cotidianas, ambientais e de saúde. Diga qual tema quer revisar!',

    '\\bbiologia\\b|explique.*biolog|estud.*biolog|aprend.*biolog|o que [eé].*biolog|resumo.*biolog':
        '**Biologia — Visão Geral para o ENEM:**\n\nOs temas mais cobrados são:\n\n**Biologia Celular:** bioquímica celular, estrutura da célula, metabolismo (fotossíntese, respiração, fermentação), divisão celular (mitose e meiose).\n\n**Genética:** Leis de Mendel, DNA e síntese de proteínas, mutações, biotecnologia.\n\n**Evolução:** Darwin, seleção natural, especiação, evidências evolutivas.\n\n**Ecologia:** cadeias e teias alimentares, ciclos biogeoquímicos, biomas, relações ecológicas, impactos ambientais.\n\n**Fisiologia Humana:** sistemas circulatório, respiratório, digestório, nervoso, endócrino, excretor, reprodutor, imunológico.\n\n**Diversidade biológica:** reinos, vírus, bactérias, protistas, fungos, plantas, animais.\n\nQual tema quer aprofundar?',

    '\\bmatemática\\b|\\bmatematica\\b|explique.*matemát|estud.*matemát|aprend.*matemát|o que [eé].*matemát':
        '**Matemática — Visão Geral para o ENEM:**\n\nOs temas mais frequentes são:\n\n**Números e Operações:** frações, potências, radiciação, MMC, MDC, porcentagem, razão e proporção, regra de três.\n\n**Álgebra:** equações 1° e 2° grau (Bhaskara), inequações, sistemas lineares, funções (afim, quadrática, exponencial, logarítmica, modular).\n\n**Geometria:** plana (áreas, perímetros, Pitágoras, semelhança), espacial (volumes), analítica (retas, distâncias, circunferência).\n\n**Trigonometria:** razões no triângulo retângulo (sen, cos, tg), valores notáveis, lei dos senos e cossenos.\n\n**Estatística e Probabilidade:** média, mediana, moda, combinatória, probabilidade.\n\n**PA e PG:** progressões, juros simples e compostos.\n\nDiga qual tópico específico quer revisar!',

    '\\bhumanas\\b|ciências.*humanas.*exp|estud.*humanas|aprend.*humanas|resumo.*huma|o que [eé].*humanas|história.*enem|geograf.*enem':
        '**Ciências Humanas — Visão Geral para o ENEM:**\n\nAs Ciências Humanas integram **História, Geografia, Filosofia e Sociologia**:\n\n**História:** Brasil (Colonial → Republicano → Contemporâneo) + Geral (Antiguidade, Idade Média, Moderna, Contemporânea).\n\n**Geografia:** brasileira (regiões, biomas, urbanização, questão agrária, hidrografia) + mundial (blocos econômicos, geopolítica, climatologia, questão ambiental).\n\n**Filosofia:** pré-socráticos, Sócrates/Platão/Aristóteles, Iluminismo, filosofia moderna (Kant, Descartes), contemporânea (Nietzsche, Sartre), ética.\n\n**Sociologia:** Marx (classes, capitalismo), Weber (ação social, burocracia), Durkheim (fatos sociais), movimentos sociais, desigualdade.\n\n**Temas transversais:** racismo estrutural, feminismo, questão indígena, diversidade, cidadania, direitos humanos, meio ambiente.',

    '\\blinguagens\\b|ciências.*linguag|estud.*linguag|redação.*geral|portugu[eê]s.*enem|literatura.*enem|aprend.*linguag':
        '**Linguagens — Visão Geral para o ENEM:**\n\nLinguagens cobre: **Língua Portuguesa, Literatura, Redação, Artes, Educação Física e Língua Estrangeira (Inglês ou Espanhol)**.\n\n**Interpretação de Texto:** gêneros (charge, tirinha, poema, conto, crônica, artigo, publicidade, infográfico), inferência, linguagem verbal e não-verbal.\n\n**Gramática:** variação linguística, figuras de linguagem, coesão/coerência, concordância, regência, crase, ortografia.\n\n**Literatura Brasileira:** do Barroco ao Modernismo, análise de autores e obras canônicas.\n\n**Redação:** texto dissertativo-argumentativo — estrutura (intro+2 Ds+conclusão), 5 competências (200 pts cada), proposta de intervenção com 5 elementos.\n\n**Língua Estrangeira:** 5 questões de Inglês ou Espanhol (escolha no início da prova).\n\nQual aspecto quer aprofundar?',

};


// ── Fallback inteligente: detecta qualquer palavra-chave acadêmica ───────────
// Remove acentos para comparação robusta
function _removeAccents(s) {
    return s.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
}

function _looseTutorMatch(text) {
    const t = _removeAccents(text.toLowerCase());

    const disc = [
        {
            re: /\b(matem[aá]?tic|algebr|geometri[ac]|calc[uú]lo|equa[cç][aã]o|fun[cç][aã]o|funcao|numero|frac[aã]o|porcentagem|probabilidade|estatistic|trigonometri|logaritm|exponencial|matriz|combinat|pitag|bhaskara|progres[sã]|juros|conjunto|inequa[cç]|poliedro|polígono|angulo|area|volume|perimetro)\b/,
            titulo: 'Matemática',
            resposta: '**Matemática — o que você quer saber?**\n\nDetectei que sua dúvida é sobre Matemática. Posso explicar qualquer tópico com detalhes!\n\n**Álgebra:** funções afim, quadrática, exponencial, logarítmica, inversas e compostas, inequações, sistemas lineares, matrizes.\n\n**Aritmética:** frações, potências, radiciação, MMC/MDC, porcentagem, regra de três, razão e proporção.\n\n**Geometria:** plana (áreas, perímetros, Pitágoras, semelhança, trigonometria), espacial (volumes), analítica (retas, distâncias, circunferência).\n\n**Estatística e Probabilidade:** média, mediana, moda, combinatória, análise combinatória (PA, PG, arranjo, permutação).\n\nDigite um tópico específico e eu explico com fórmulas e exemplos!'
        },
        {
            re: /\b(f[íi]?sic[ao]|mecanica|forca|velocidad|aceleracao|energia|eletricidad|magnet|otica|onda|termodinam|atom|nuclear|gravit[aã]o|calor|temperatura|pressao|impulso|trabalho.*fisic|cinematica|dinamica|hidrostat|calorimetr|induçao|eletromagnetism)\b/,
            titulo: 'Física',
            resposta: '**Física — o que você quer saber?**\n\nDetectei que sua dúvida é sobre Física. Posso explicar com fórmulas e exemplos práticos!\n\n**Mecânica:** Leis de Newton, cinemática (MRU, MRUV, queda livre), trabalho, energia (cinética, potencial, conservação), quantidade de movimento, gravitação.\n\n**Termologia:** temperatura, escalas, calorimetria, dilatação, leis da termodinâmica, gases ideais.\n\n**Óptica:** reflexão, refração, lentes, espelhos, dispersão.\n\n**Ondulatória:** ondas mecânicas e eletromagnéticas, som, efeito Doppler.\n\n**Eletricidade:** Lei de Ohm, circuitos, potência, campo elétrico, Coulomb.\n\n**Física Moderna:** modelos atômicos, radioatividade, efeito fotoelétrico, relatividade.\n\nQual tópico específico você quer aprofundar?'
        },
        {
            re: /\b(qu[íi]?mic[ao]|atomo|molecul|element[oa]|reac[aã]o|ligac[aã]o|acido|base|salt|tabela.*peri|organica|polimer|estequiometr|soluc[aã]o|oxidacao|reducao|entalpic|termoquimic|eletroquimic|isomer|gas.*lei)\b/,
            titulo: 'Química',
            resposta: '**Química — o que você quer saber?**\n\nDetectei que sua dúvida é sobre Química. Posso explicar com equações e exemplos!\n\n**Química Geral:** tabela periódica (tendências, grupos, períodos), modelos atômicos, ligações químicas (iônica, covalente, metálica, intermoleculares).\n\n**Inorgânica:** funções (ácidos, bases, sais, óxidos), balanceamento, oxirredução, estequiometria (mol, massa molar).\n\n**Físico-Química:** soluções e concentrações, pH e neutralização, termoquímica, equilibrio (Le Chatelier), eletroquímica (pilhas/eletrólise), gases (Boyle, Charles).\n\n**Orgânica:** hidrocarbonetos, funções oxigenadas e nitrogenadas, reações orgânicas, isomeria, polímeros, biomoléculas.\n\nQual tópico específico você quer aprofundar?'
        },
        {
            re: /\b(biolog|celula|genetica|dna|rna|protein|evolucao|ecolog|ecossistem|organism|animal|planta|fungi|virus|bacteri|fisiolog|anatom|fotossintet|respirac|mitose|meiose|imunolog|vacina|digestao|excrecao|reprodu[cç])\b/,
            titulo: 'Biologia',
            resposta: '**Biologia — o que você quer saber?**\n\nDetectei que sua dúvida é sobre Biologia. Posso explicar qualquer tema!\n\n**Biologia Celular:** estrutura celular, organelas, membrana plasmática, metabolismo (fotossíntese, respiração, fermentação), divisão celular (mitose e meiose).\n\n**Genética:** Mendel (leis e exceções), DNA e síntese proteica (transcrição, tradução), mutações, biotecnologia (transgênicos, CRISPR, PCR).\n\n**Evolução:** Darwin, seleção natural, especiação, evidências evolutivas, neodarwinismo.\n\n**Ecologia:** cadeias alimentares, ciclos biogeoquímicos, biomas brasileiros, relações ecológicas, impactos ambientais.\n\n**Fisiologia Humana:** sistemas circulatório, respiratório, digestório, nervoso, endócrino, excretor, reprodutor e imunológico.\n\n**Biodiversidade:** vírus, bactérias, protistas, fungos, plantas, animais, classificação taxonômica.\n\nQual tópico específico você quer aprofundar?'
        },
        {
            re: /\b(histori[ao]|geografi[ao]|sociologi[ao]|filosof|politica|sociedade|cultura|econom|capitalismo|socialismo|democraci|direito|cidadan|guerra|revolucao|colonialismo|imperialism|ditadura|republica|escravidao|feudalismo|renasciment|iluminismo|marx|kant|plat[aã]o)\b/,
            titulo: 'Ciências Humanas',
            resposta: '**Ciências Humanas — o que você quer saber?**\n\nDetectei que sua dúvida é sobre Humanas. Posso explicar com contexto e análise!\n\n**História do Brasil:** Colônia (1500-1822), Império, República Velha, Era Vargas, Ditadura Militar (1964-85), Redemocratização e CF/1988.\n\n**História Geral:** Antiguidade (Egito, Grécia, Roma), Idade Média (feudalismo, cruzadas), Revoluções (Francesa, Industrial, Russa), Guerras Mundiais, Guerra Fria.\n\n**Filosofia:** pré-socráticos, Sócrates/Platão/Aristóteles, Iluminismo (Locke, Rousseau, Montesquieu, Voltaire, Kant), filosofia contemporânea, ética.\n\n**Sociologia:** Marx (classes e capitalismo), Weber (ação social, burocracia), Durkheim (fatos sociais), movimentos sociais, desigualdade, racismo, feminismo.\n\n**Geografia:** regiões e biomas do Brasil, urbanização, globalização, blocos econômicos, geopolítica, questões ambientais.\n\nQual tópico específico você quer aprofundar?'
        },
        {
            re: /\b(portugues|redacao|literatur|lingua|gramatic|texto|figur|metafor|poem|conto|romanc|narrat|modern[íi]?smo|romanticismo|realismo|linguagem|coesao|coerenci|publicidad|intertextual|genero.*textual|concordancia|crase|semiotica)\b/,
            titulo: 'Linguagens',
            resposta: '**Linguagens — o que você quer saber?**\n\nDetectei que sua dúvida é sobre Linguagens. Posso explicar qualquer aspecto!\n\n**Redação ENEM:** estrutura dissertativo-argumentativa (intro + 2 desenvolvimentos + conclusão), 5 competências, proposta de intervenção com 5 elementos obrigatórios.\n\n**Interpretação de Texto:** gêneros textuais (charge, tirinha, poema, crônica, artigo), inferência, coesão, coerência, figuras de linguagem, linguagem não-verbal.\n\n**Gramática:** variação linguística, concordância verbal e nominal, regência, crase, ortografia (nova ortografia), análise sintática básica.\n\n**Literatura Brasileira:** Barroco → Arcadismo → Romantismo → Realismo/Naturalismo → Parnasianismo → Simbolismo → Modernismo (3 fases) → Literatura contemporânea.\n\n**Língua Estrangeira:** Inglês ou Espanhol — 5 questões, interpretação de texto em contexto.\n\nQual aspecto específico você quer aprofundar?'
        },
    ];

    const t2 = _removeAccents(text.toLowerCase());
    for (const d of disc) {
        if (d.re.test(t2)) return d.resposta;
    }

    // Super fallback: qualquer texto que pareça uma pergunta de estudo
    if (/\b(o que [eé]|como funciona|explique|me fale|me conte|preciso|ajuda|duvida|dúvida|aprend|estudar|entend|saber|defin|conceit)\b/i.test(t2)) {
        return '**Pode perguntar! Aqui estão os temas que domino:**\n\n**➗ Matemática:** funções, equações, geometria, trigonometria, probabilidade, estatística, PA/PG, juros compostos\n\n**⚡ Física:** leis de Newton, energia, termodinâmica, óptica, eletricidade, ondas, física moderna\n\n**🧪 Química:** tabela periódica, ligações, reações, pH, estequiometria, química orgânica, eletroquímica\n\n**🔬 Biologia:** célula, genética, evolução, ecologia, fisiologia humana, microbiologia, biotecnologia\n\n**🌍 Humanas:** história do Brasil e geral, geografia, sociologia (Marx/Durkheim/Weber), filosofia, geopolítica\n\n**📝 Linguagens:** redação ENEM, literatura brasileira, figuras de linguagem, gramática, gêneros textuais\n\nReescreva sua pergunta sendo mais específico, por exemplo: *"O que é célula tronco?"* ou *"Como calcular porcentagem?"*';
    }

    return null;
}

// Escapa caracteres HTML especiais antes de processar markdown,
// prevenindo XSS via input do usuário ou resposta manipulada da IA.
function _escapeTutorText(str) {
    return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
}

function _renderTutorMessages() {
    const el = document.getElementById('tutor-messages');
    if (!el) return;
    el.innerHTML = _tutorMessages.map(m => {
        if (m.role === 'typing') return `<div class="tutor-msg ai"><div class="tutor-avatar tutor-avatar-ai">🤖</div><div class="tutor-bubble tutor-typing"><span></span><span></span><span></span></div></div>`;
        // Escape HTML primeiro, depois aplica markdown - evita XSS
        const safe = _escapeTutorText(m.text);
        const bubble = safe.replace(/\*\*(.+?)\*\*/g,'<strong>$1</strong>').replace(/\*(.+?)\*/g,'<em>$1</em>').replace(/\n/g,'<br>');
        if (m.role === 'ai') {
            return `<div class="tutor-msg ai"><div class="tutor-avatar tutor-avatar-ai">🤖</div><div class="tutor-bubble">${bubble}</div></div>`;
        }
        const userInitial = (typeof state !== 'undefined' && state?.user?.name) ? state.user.name[0].toUpperCase() : 'EU';
        return `<div class="tutor-msg user"><div class="tutor-bubble">${bubble}</div><div class="tutor-avatar tutor-avatar-user">${userInitial}</div></div>`;
    }).join('');
    el.scrollTop = el.scrollHeight;

    // Oculta grid de sugestões após a primeira mensagem do usuário
    const grid = document.getElementById('tutor-suggestions');
    const hasUserMsg = _tutorMessages.some(m => m.role === 'user');
    if (grid) grid.style.display = hasUserMsg ? 'none' : 'grid';

    // Persiste histórico na sessionStorage
    try { sessionStorage.setItem('tutor_history', JSON.stringify(_tutorMessages.filter(m => m.role !== 'typing'))); } catch {}
}

function tutorNovaConversa() {
    _tutorMessages = [{
        role: 'ai',
        text: 'Olá! Sou o **Tutor IA** do ENEM Master 🎓\n\nPosso te explicar qualquer assunto do ENEM: *Matemática, Física, Química, Biologia, Humanas, Linguagens e Redação*.\n\nUse as sugestões acima ou faça sua pergunta! 👆',
    }];
    try { sessionStorage.removeItem('tutor_history'); } catch {}
    _renderTutorMessages();
    // Reexibe o grid
    const grid = document.getElementById('tutor-suggestions');
    if (grid) grid.style.display = 'grid';
    _showQuickToast('📣 Nova conversa iniciada');
}

async function sendTutorMessage() {
    const input = document.getElementById('tutor-input');
    const text  = (input?.value || '').trim();
    if (!text) return;
    input.value = '';
    await _processTutorText(text);
}

function sendTutorSuggestion(text) {
    const input = document.getElementById('tutor-input');
    if (input) { input.value = text; }
    // Limpa o input após um tick para o usuário ver o que foi enviado
    setTimeout(() => { if (input) input.value = ''; }, 80);
    _processTutorText(text);
}

async function _processTutorText(text) {
    _tutorMessages.push({ role:'user', text });
    _tutorMessages.push({ role:'typing' });
    _renderTutorMessages();

    let response = null;
    for (const [pattern, answer] of Object.entries(_TUTOR_KB)) {
        if (new RegExp(pattern, 'i').test(text)) { response = answer; break; }
    }

    if (!response) {
        const groqKey = localStorage.getItem('groq_key');
        if (groqKey) {
            try {
                const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
                    method: 'POST',
                    headers: { 'Content-Type':'application/json', 'Authorization':`Bearer ${groqKey}` },
                    body: JSON.stringify({
                        model: 'llama-3.3-70b-versatile',
                        messages: [
                            { role:'system', content:`Você é o Tutor IA do ENEM Master, um professor altamente especializado em todas as disciplinas do ENEM brasileiro. Seu objetivo é explicar qualquer conteúdo de forma didática, clara e completa.

DISCIPLINAS que você domina completamente:
- MATEMÁTICA: aritmética, álgebra, funções (afim, quadrática, exponencial, logarítmica, modular), trigonometria, geometria plana e espacial, geometria analítica, estatística, probabilidade, combinatória, PA, PG, matrizes, sistemas lineares, inequações, juros simples e compostos
- FÍSICA: mecânica (Newton, cinemática, dinâmica), energia, termodinâmica, óptica, ondulatória, eletricidade, eletromagnetismo, física moderna, relatividade, gravitação
- QUÍMICA: tabela periódica, ligações químicas, funções inorgânicas, estequiometria, soluções, termoquímica, eletroquímica, equilíbrio químico, química orgânica (funções, reações, polímeros), radioatividade
- BIOLOGIA: biologia celular, genética molecular (DNA, RNA, proteínas), genética mendeliana, evolução, ecologia, fisiologia humana (todos os sistemas), botânica, zoologia, virologia, microbiologia, biotecnologia
- CIÊNCIAS HUMANAS: história do Brasil (colônia ao contemporâneo), história geral (Antiguidade ao contemporâneo), geografia brasileira e mundial, sociologia (Marx, Weber, Durkheim), filosofia (grega, moderna, contemporânea), questões sociais (racismo, feminismo, desigualdade, meio ambiente)
- LINGUAGENS: redação dissertativo-argumentativa do ENEM (estrutura, competências, proposta de intervenção), análise literária (todos os períodos literários brasileiros), figuras de linguagem, gêneros textuais, coesão e coerência, gramática normativa, variação linguística, inglês e espanhol

REGRAS DE RESPOSTA:
1. Responda SEMPRE em português brasileiro
2. Use formatação **negrito** para termos-chave, *itálico* para ênfase
3. Use exemplos práticos e contextualizados quando possível
4. Estruture a resposta com clareza (introdução → desenvolvimento → exemplo/aplicação)
5. Para matemática: inclua fórmulas, passo a passo e exemplos numéricos
6. Para ciências: inclua equações/reações quando relevante
7. Para humanas: inclua datas, contexto e consequências
8. Para linguagens: inclua exemplos literários ou textuais
9. Seja completo mas conciso: máximo 4 parágrafos ou uma lista bem organizada
10. Se a pergunta for muito ampla, dê uma visão geral e pergunte qual aspecto aprofundar` },
                            ..._tutorMessages.filter(m=>m.role!=='typing').slice(-10).map(m=>({ role: m.role==='ai'?'assistant':'user', content: m.text })),
                        ],
                        temperature: 0.4, max_tokens: 700,
                    }),
                });
                if (res.ok) { const d = await res.json(); response = d.choices?.[0]?.message?.content || null; }
            } catch { /* ignore */ }
        }
    }

    // 2º fallback: detecção ampla por palavras-chave de disciplina
    if (!response) response = _looseTutorMatch(text);

    // 3º fallback: resposta genérica amigável (praticamente nunca deve chegar aqui)
    if (!response) response = '**Pode perguntar de outra forma?** 😊\n\nSou especialista em todas as disciplinas do ENEM! Tente reformular, por exemplo:\n\n*"O que é fotossíntese?"*, *"Como calcular área de um triângulo?"*, *"O que foi a Revolução Francesa?"*, *"Como escrever a proposta de intervenção?"*\n\nOu pergunte diretamente: *"Me explique Matemática"*, *"Quero revisar Biologia"*, *"Fale sobre a Era Vargas"*';

    _tutorMessages = _tutorMessages.filter(m => m.role !== 'typing');
    _tutorMessages.push({ role:'ai', text: response });
    _renderTutorMessages();
}

