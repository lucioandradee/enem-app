// =====================================================
// CONTE├ÜDO ÔÇö FLASHCARDS, RESUMOS, TUTOR IA
// =====================================================

// ÔöÇÔöÇ Dados: Flashcards ÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇ
// lvl: 1=F├ícil ┬À 2=M├®dio ┬À 3=Dif├¡cil
const FLASHCARDS = [
    // ÔöÇÔöÇ HUMANAS ÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇ
    { disc:'humanas', area:'­ƒîì HUMANAS', lvl:1, q:'O que ├® "Estado Laico"?',                                        a:'Estado que n├úo adota religi├úo oficial e garante a liberdade religiosa, separando as esferas p├║blica (pol├¡tica) e privada (religi├úo).' },
    { disc:'humanas', area:'­ƒîì HUMANAS', lvl:1, q:'O que foi a Revolu├º├úo Industrial?',                               a:'Transforma├º├úo econ├┤mica que substituiu o trabalho artesanal por f├íbricas com m├íquinas a vapor, iniciada na Inglaterra no s├®c. XVIII. Gerou o proletariado e o capitalismo industrial.' },
    { disc:'humanas', area:'­ƒîì HUMANAS', lvl:1, q:'O que ├® democracia direta?',                                      a:'Sistema em que os cidad├úos participam diretamente das decis├Áes pol├¡ticas, sem representantes. Origem na Gr├®cia Antiga (Atenas, s├®c. V a.C.). Hoje praticada em referendos e plebiscitos.' },
    { disc:'humanas', area:'­ƒîì HUMANAS', lvl:2, q:'Qual foi o principal objetivo do Plano Marshall?',                a:'Reconstruir economicamente a Europa Ocidental ap├│s a 2┬¬ Guerra Mundial (1948-52), contendo tamb├®m a expans├úo do comunismo sovi├®tico. Os EUA investiram ~13 bilh├Áes de d├│lares.' },
    { disc:'humanas', area:'­ƒîì HUMANAS', lvl:2, q:'O que ├® imperialismo?',                                           a:'Pol├¡tica de expans├úo territorial e econ├┤mica de pa├¡ses industrializados sobre regi├Áes subdesenvolvidas, especialmente na ├üfrica e ├üsia no s├®c. XIX. Motivada por mat├®ria-prima, mercados e poder.' },
    { disc:'humanas', area:'­ƒîì HUMANAS', lvl:2, q:'Qual foi a principal causa da 1┬¬ Guerra Mundial?',                a:'Assassinato do arquiduque Franz Ferdinand em 1914, somado ao sistema de alian├ºas (Tr├¡plice Entente x Tr├¡plice Alian├ºa), nacionalismo exacerbado e disputa colonial imperial.' },
    { disc:'humanas', area:'­ƒîì HUMANAS', lvl:2, q:'O que foi a Revolu├º├úo Francesa (1789)?',                          a:'Ruptura com o Absolutismo que instituiu os ideais de Liberdade, Igualdade e Fraternidade. Fases: Monarquia Constitucional ÔåÆ Conven├º├úo Nacional (Terror) ÔåÆ Diret├│rio ÔåÆ Napole├úo.' },
    { disc:'humanas', area:'­ƒîì HUMANAS', lvl:2, q:'O que foi o Estado Novo (1937-1945) no Brasil?',                  a:'Governo ditatorial de Get├║lio Vargas, com centraliza├º├úo do poder, censura pelo DIP, suspens├úo da Constitui├º├úo e repress├úo aos opositores. Coincidiu com industrializa├º├úo e trabalhismo.' },
    { disc:'humanas', area:'­ƒîì HUMANAS', lvl:2, q:'O que ├® globaliza├º├úo?',                                           a:'Processo de integra├º├úo econ├┤mica, cultural e pol├¡tica entre pa├¡ses, impulsionado pelo avan├ºo tecnol├│gico, liberaliza├º├úo do com├®rcio e fluxo de capitais. Intensificou-se ap├│s 1989.' },
    { disc:'humanas', area:'­ƒîì HUMANAS', lvl:3, q:'Quais s├úo as principais ideias do contrato social (Rousseau)?',   a:'Os homens nascem livres e iguais; cedem parte da liberdade ao Estado em troca de prote├º├úo coletiva. A soberania emana do povo ("vontade geral"). Base filos├│fica para a democracia moderna.' },
    { disc:'humanas', area:'­ƒîì HUMANAS', lvl:3, q:'O que foram as "ondas" do feminismo?',                            a:'1┬¬ onda (s├®c. XIXÔÇôXX): sufr├ígio. 2┬¬ onda (anos 60-80): igualdade de direitos e sexualidade. 3┬¬ onda (anos 90+): interseccionalidade, diversidade. 4┬¬ onda (2010+): feminismo digital e MeToo.' },
    { disc:'humanas', area:'­ƒîì HUMANAS', lvl:3, q:'O que ├® "neoliberalismo"?',                                       a:'Corrente econ├┤mica que defende: Estado m├¡nimo, privatiza├º├Áes, livre mercado, corte de gastos p├║blicos e abertura comercial. Emergiu nos anos 1970 com Hayek/Friedman; aplicado por Thatcher e Reagan.' },

    // ÔöÇÔöÇ NATUREZA ÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇ
    { disc:'natureza', area:'­ƒö¼ NATUREZA', lvl:1, q:'O que ├® DNA?',                                                  a:'├ücido desoxirribonucleico ÔÇö mol├®cula dupla-h├®lice que armazena informa├º├Áes gen├®ticas em sequ├¬ncias de bases nitrogenadas (Adenina-Timina e Citosina-Guanina).' },
    { disc:'natureza', area:'­ƒö¼ NATUREZA', lvl:1, q:'O que diferencia ├ícidos de bases (Arrhenius)?',                 a:'├ücidos liberam ├¡ons HÔü║ em solu├º├úo aquosa; bases liberam OHÔü╗. pH < 7 = ├ícido; pH = 7 = neutro; pH > 7 = b├ísico (alkalino).' },
    { disc:'natureza', area:'­ƒö¼ NATUREZA', lvl:1, q:'O que ├® fotoss├¡ntese?',                                         a:'Processo pelo qual plantas e algas convertem luz solar, COÔéé e HÔééO em glicose e OÔéé. Equa├º├úo: 6COÔéé + 6HÔééO + luz ÔåÆ CÔéåHÔéüÔééOÔéå + 6OÔéé. Ocorre nos cloroplastos.' },
    { disc:'natureza', area:'­ƒö¼ NATUREZA', lvl:2, q:'Qual ├® a 1┬¬ Lei da Termodin├ómica?',                             a:'A energia de um sistema isolado se conserva: ╬öU = Q ÔêÆ W. O calor absorvido (Q) ├® igual ├á varia├º├úo da energia interna mais o trabalho realizado (W). Princ├¡pio da conserva├º├úo de energia.' },
    { disc:'natureza', area:'­ƒö¼ NATUREZA', lvl:2, q:'O que ├® sele├º├úo natural (Darwin)?',                             a:'Mecanismo evolutivo em que organismos com caracter├¡sticas mais adaptadas sobrevivem e se reproduzem mais. Junto com muta├º├úo e deriva gen├®tica, explica a diversidade da vida.' },
    { disc:'natureza', area:'­ƒö¼ NATUREZA', lvl:2, q:'O que ├® for├ºa el├®trica (Lei de Coulomb)?',                      a:'F = kqÔéüqÔéé/d┬▓, onde k = 9├ù10Ôü╣ N┬Àm┬▓/C┬▓. Cargas de mesmo sinal se repelem; sinais opostos se atraem. A for├ºa ├® proporcional ao produto das cargas e inversamente proporcional ao quadrado da dist├óncia.' },
    { disc:'natureza', area:'­ƒö¼ NATUREZA', lvl:2, q:'O que ├® uma rea├º├úo de oxirredu├º├úo?',                            a:'Rea├º├úo onde ocorre transfer├¬ncia de el├®trons: a subst├óncia que perde el├®trons ├® oxidada (agente redutor); a que ganha el├®trons ├® reduzida (agente oxidante). Exemplo: ferrugem do ferro.' },
    { disc:'natureza', area:'­ƒö¼ NATUREZA', lvl:2, q:'O que ├® liga├º├úo i├┤nica vs. covalente?',                         a:'I├┤nica: transfer├¬ncia de el├®trons entre metal e n├úo-metal; forma cristais s├│lidos (ex: NaCl). Covalente: compartilhamento de el├®trons entre n├úo-metais; pode ser apolar ou polar (ex: HÔééO).' },
    { disc:'natureza', area:'­ƒö¼ NATUREZA', lvl:2, q:'O que s├úo ondas eletromagn├®ticas?',                             a:'Ondas que se propagam sem meio material, na velocidade da luz (3├ù10Ôü© m/s). Espectro: r├ídio ÔåÆ micro-ondas ÔåÆ infravermelho ÔåÆ vis├¡vel ÔåÆ UV ÔåÆ raios X ÔåÆ gama. Energia ÔêØ frequ├¬ncia.' },
    { disc:'natureza', area:'­ƒö¼ NATUREZA', lvl:3, q:'Explique as Leis de Mendel e suas exce├º├Áes.',                   a:'1┬¬ Lei: segrega├º├úo ÔÇö cada indiv├¡duo porta 2 alelos que se separam nos gametas (Aa ÔåÆ 50%A + 50%a). 2┬¬ Lei: segrega├º├úo independente em genes n├úo ligados. Exce├º├Áes: codomin├óncia, epistase, liga├º├úo g├¬nica.' },
    { disc:'natureza', area:'­ƒö¼ NATUREZA', lvl:3, q:'O que ├® radioatividade? Cite os tipos.',                        a:'Emiss├úo espont├ónea de radia├º├úo por n├║cleos inst├íveis. Tipos: ╬▒ (part├¡cula He, menor penetra├º├úo), ╬▓ (el├®tron, penetra├º├úo m├®dia), ╬│ (onda EM de alta energia, maior penetra├º├úo). Aplica-se em medicina e energia nuclear.' },

    // ÔöÇÔöÇ LINGUAGENS ÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇ
    { disc:'linguagens', area:'­ƒôØ LINGUAGENS', lvl:1, q:'O que ├® uma met├ífora?',                                     a:'Figura de linguagem que aproxima dois conceitos por semelhan├ºa impl├¡cita, sem "como" ou "que nem". Ex: "a vida ├® um palco"; "ele ├® uma pedra" (= insens├¡vel).' },
    { disc:'linguagens', area:'­ƒôØ LINGUAGENS', lvl:1, q:'O que ├® meton├¡mia?',                                        a:'Substitui├º├úo de uma palavra por outra com rela├º├úo real de contiguidade. Ex: "Leio Machado" (autor pela obra); "Brasil venceu" (pa├¡s pelo time); "o c├ílice" (continente pelo conte├║do).' },
    { disc:'linguagens', area:'­ƒôØ LINGUAGENS', lvl:1, q:'O que ├® intertextualidade?',                                a:'Di├ílogo entre textos: cita├º├úo, par├│dia, alus├úo ou par├ífrase de um texto em outro. Frequente em charges, tirinhas e publicidade no ENEM ÔÇö requer repert├│rio cultural.' },
    { disc:'linguagens', area:'­ƒôØ LINGUAGENS', lvl:2, q:'Qual ├® a estrutura da reda├º├úo ENEM?',                       a:'Dissertativo-argumentativa: Introdu├º├úo (contextualiza├º├úo + tese) ÔåÆ Duas vezes Desenvolvimento (argumento + exemplifica├º├úo) ÔåÆ Conclus├úo (proposta de interven├º├úo com 5 elementos).' },
    { disc:'linguagens', area:'­ƒôØ LINGUAGENS', lvl:2, q:'Quais s├úo os 5 elementos da proposta de interven├º├úo do ENEM?', a:'1) A├º├úo (o que fazer), 2) Agente respons├ível (quem executa), 3) Modo/meio (como), 4) Efeito esperado (qual o resultado), 5) Finalidade (por qu├¬). Todos em 1-2 frases coesas.' },
    { disc:'linguagens', area:'­ƒôØ LINGUAGENS', lvl:2, q:'O que ├® coes├úo textual?',                                   a:'Encadeamento lingu├¡stico entre partes do texto por meio de pronomes, conjun├º├Áes, adv├®rbios e sin├┤nimos. Sem coes├úo o texto fica fragmentado. Compet├¬ncia 4 da reda├º├úo ENEM.' },
    { disc:'linguagens', area:'­ƒôØ LINGUAGENS', lvl:2, q:'Qual a diferen├ºa entre narrador onisciente e observador?',  a:'Onisciente: sabe os pensamentos e sentimentos dos personagens; voz em 3┬¬ pessoa. Observador: relata apenas o que se v├¬ externamente, sem acessar a mente dos personagens ÔÇö como uma c├ómera.' },
    { disc:'linguagens', area:'­ƒôØ LINGUAGENS', lvl:2, q:'O que ├® eufemismo? D├¬ um exemplo.',                         a:'Figura que suaviza uma ideia desagrad├ível ou agressiva. Ex: "ele passou para um lugar melhor" (= morreu); "colaborador" (= empregado); "conflito armado" (= guerra).' },
    { disc:'linguagens', area:'­ƒôØ LINGUAGENS', lvl:3, q:'Como usar repert├│rio sociocultural legitimamente na reda├º├úo?', a:'Citar dados, leis, fil├│sofos, obras liter├írias, filmes ou pesquisas para embasar a tese ÔÇö com autoria e pertin├¬ncia. Valem na C2 (repert├│rio). Evitar cita├º├Áes gen├®ricas do tipo "como dizia um fil├│sofo".' },
    { disc:'linguagens', area:'­ƒôØ LINGUAGENS', lvl:3, q:'O que ├® polifonia em Bakhtin?',                             a:'Conceito de que um texto ├® composto por m├║ltiplas vozes/perspectivas que dialogam. No ENEM aparece em quest├Áes de an├ílise do discurso: charges e reportagens t├¬m vozes impl├¡citas e expl├¡citas.' },

    // ÔöÇÔöÇ MATEM├üTICA ÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇ
    { disc:'matematica', area:'Ô×ù MATEM├üTICA', lvl:1, q:'Teorema de Pit├ígoras',                                       a:'Em tri├óngulo ret├óngulo: a┬▓ = b┬▓ + c┬▓, onde a ├® a hipotenusa (lado oposto ao ├óngulo reto) e b, c s├úo os catetos. Exemplo: catetos 3 e 4 ÔåÆ hipotenusa = 5.' },
    { disc:'matematica', area:'Ô×ù MATEM├üTICA', lvl:1, q:'O que ├® probabilidade?',                                     a:'P(A) = casos favor├íveis / casos poss├¡veis. P Ôêê [0, 1]. Ex: lan├ºar dado ÔåÆ P(4) = 1/6. Evento imposs├¡vel: P=0; Evento certo: P=1.' },
    { disc:'matematica', area:'Ô×ù MATEM├üTICA', lvl:1, q:'F├│rmula do volume da esfera',                                a:'V = (4/3)¤Çr┬│. ├ürea da superf├¡cie: A = 4¤Çr┬▓. Lembre: esfera, cubo (V=a┬│), cilindro (V=¤Çr┬▓h), cone (V=¤Çr┬▓h/3).' },
    { disc:'matematica', area:'Ô×ù MATEM├üTICA', lvl:2, q:'F├│rmula de Bhaskara',                                        a:'Para ax┬▓+bx+c=0: x = (ÔêÆb ┬▒ ÔêÜ╬ö) / 2a, onde ╬ö = b┬▓ÔêÆ4ac. Se ╬ö>0: 2 ra├¡zes distintas; ╬ö=0: 1 raiz dupla; ╬ö<0: sem ra├¡zes reais.' },
    { disc:'matematica', area:'Ô×ù MATEM├üTICA', lvl:2, q:'O que ├® fun├º├úo afim (1┬║ grau)?',                             a:'f(x) = ax + b. Se a>0: crescente; a<0: decrescente; a=0: constante. Zero em x = ÔêÆb/a. Gr├ífico: reta. Exemplo: velocidade constante v = vÔéÇ + at.' },
    { disc:'matematica', area:'Ô×ù MATEM├üTICA', lvl:2, q:'O que ├® uma progress├úo geom├®trica (PG)?',                    a:'Sequ├¬ncia em que cada termo ├® o anterior ├ù raz├úo q. Termo geral: aÔéÖ = aÔéü ┬À qÔü┐Ôü╗┬╣. Soma dos n termos: SÔéÖ = aÔéü(qÔü┐ÔêÆ1)/(qÔêÆ1). Exemplo: 2, 4, 8, 16... (q=2).' },
    { disc:'matematica', area:'Ô×ù MATEM├üTICA', lvl:2, q:'F├│rmula da ├írea do tri├óngulo com base e altura',             a:'A = (base ├ù altura) / 2. Com os 3 lados (Heron): s = (a+b+c)/2, A = ÔêÜ(s(s-a)(s-b)(s-c)). Em tri├óngulo equil├ítero: A = (l┬▓ÔêÜ3)/4.' },
    { disc:'matematica', area:'Ô×ù MATEM├üTICA', lvl:2, q:'O que ├® combina├º├úo simples C(n,k)?',                         a:'N├║mero de grupos de k elementos tirados de n sem considerar ordem: C(n,k) = n! / (k! ┬À (nÔêÆk)!). Ex: C(5,2) = 10 pares poss├¡veis de 5 pessoas.' },
    { disc:'matematica', area:'Ô×ù MATEM├üTICA', lvl:3, q:'O que ├® logaritmo? Propriedades b├ísicas.',                   a:'logÔéÉb = x Ôåö a╦ú = b. Propriedades: log(AB) = logA + logB; log(A/B) = logA ÔêÆ logB; log(AÔü┐) = n┬ÀlogA; logÔéÉa = 1; logÔéÉ1 = 0. Muito usado em escalas (pH, Richter, dB).' },
    { disc:'matematica', area:'Ô×ù MATEM├üTICA', lvl:3, q:'O que ├® uma fun├º├úo exponencial?',                            a:'f(x) = a┬Àb╦ú (b>0, bÔëá1). Se b>1: crescente; 0<b<1: decrescente. Modela crescimento/decaimento: popula├º├úo, juros compostos, meia-vida radioativa. Inversa do logaritmo.' },
];

// ÔöÇÔöÇ Dados: Resumos ÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇ
const RESUMOS = {
    humanas: { icon:'­ƒîì', name:'Ci├¬ncias Humanas', topics:[
        {
            title:'Era Vargas (1930ÔÇô1945)',
            content:`<h4>Fases</h4><ul>
<li><strong>Gov. Provis├│rio (1930ÔÇô34):</strong> fim da Rep├║blica Velha (caf├®-com-leite), cria├º├úo do Minist├®rio do Trabalho, Revolu├º├úo de 1930</li>
<li><strong>Gov. Constitucional (1934ÔÇô37):</strong> Constitui├º├úo de 1934, 1┬║ sufr├ígio feminino no Brasil</li>
<li><strong>Estado Novo (1937ÔÇô45):</strong> ditadura inspirada no fascismo europeu, Constitui├º├úo de 1937 ("Polaca"), censura pelo DIP, persegui├º├úo ao PCB</li>
</ul>
<h4>Legado econ├┤mico-social</h4>
<ul><li>CLT (1943): Consolida├º├úo das Leis do Trabalho</li>
<li>Sal├írio m├¡nimo (1940)</li>
<li>CSN ÔÇö Companhia Sider├║rgica Nacional (1941)</li>
<li>Petrobras (1953, no 2┬║ governo Vargas)</li></ul>
<h4>Fim do Estado Novo</h4><p>Press├úo popular e crise interna levaram ├á deposi├º├úo em 1945. Vargas voltou eleito em 1950 e suicidou-se em 1954, deixando a "Carta Testamento" ÔÇö "saio da vida para entrar na hist├│ria".</p>`,
        },
        {
            title:'Segunda Guerra Mundial (1939ÔÇô1945)',
            content:`<h4>Causas</h4><ul>
<li>Tratado de Versalhes (1919): humilha├º├úo alem├ú, repara├º├Áes de guerra</li>
<li>Ascens├úo do totalitarismo: nazismo (Hitler), fascismo (Mussolini), militarismo japon├¬s</li>
<li>Grande Depress├úo de 1929 e instabilidade pol├¡tica</li>
<li>Pol├¡tica de apaziguamento aliada (Confer├¬ncia de Munique, 1938)</li></ul>
<h4>Frentes e marcos</h4><ul>
<li><strong>Europa:</strong> invas├úo da Pol├┤nia (set/1939), Batalha da Fran├ºa, Opera├º├úo Barbarossa (URSS), Dia D (jun/1944)</li>
<li><strong>Pac├¡fico:</strong> Pearl Harbor (dez/1941) ÔåÆ entrada dos EUA; Hiroshima e Nagasaki (ago/1945)</li>
<li><strong>Brasil:</strong> For├ºas Expedicion├írias Brasileiras (FEB) na It├ília (1944)</li></ul>
<h4>Consequ├¬ncias</h4><p>~65ÔÇô80 milh├Áes de mortos, Holocausto (6 mi de judeus), cria├º├úo da ONU (1945), Plano Marshall, Estado de Israel (1948), in├¡cio da Guerra Fria.</p>`,
        },
        {
            title:'Guerra Fria (1947ÔÇô1991)',
            content:`<h4>Blocos</h4><ul>
<li><strong>Capitalista (EUA):</strong> OTAN, Plano Marshall, Doutrina Truman, capitalismo liberal</li>
<li><strong>Socialista (URSS):</strong> Pacto de Vars├│via, COMECON, expans├úo ao Leste Europeu e pa├¡ses subdesenvolvidos</li></ul>
<h4>Eventos-chave</h4><ul>
<li>Corrida espacial: Sputnik (1957), Neil Armstrong na Lua (1969)</li>
<li>Corrida nuclear: bomba at├┤mica ÔåÆ bomba H ÔåÆ MAAD (destrui├º├úo m├║tua assegurada)</li>
<li>Guerras proxy: Coreia (1950-53), Vietn├ú (1955-75), Afeganist├úo (1979-89)</li>
<li>Crise dos M├¡sseis em Cuba (1962): 13 dias mais pr├│ximos da guerra nuclear</li></ul>
<h4>Fim</h4><p>Queda do Muro de Berlim (nov/1989) ÔåÆ reunifica├º├úo alem├ú ┬À Dissolu├º├úo da URSS (dez/1991) ÔåÆ 15 rep├║blicas independentes. Era p├│s-bipolar: EUA como hiperpot├¬ncia e globaliza├º├úo acelerada.</p>`,
        },
        {
            title:'Revolu├º├úo Francesa (1789) e Iluminismo',
            content:`<h4>Contexto</h4><p>Crise fiscal da monarquia absolutista de Lu├¡s XVI, desigualdade entre Estados (clero + nobreza x 3┬║ Estado = 97% da pop.), influ├¬ncia iluminista e da Revolu├º├úo Americana (1776).</p>
<h4>Fases</h4><ul>
<li><strong>Monarquia Constitucional (1789ÔÇô92):</strong> Declara├º├úo dos Direitos do Homem, fim do feudalismo</li>
<li><strong>Conven├º├úo Nacional ÔÇö Terror (1792ÔÇô94):</strong> guilhotina, Robespierre, 40 mil executados</li>
<li><strong>Diret├│rio (1795ÔÇô99):</strong> instabilidade, golpe de Napole├úo Bonaparte (18 Brum├írio)</li></ul>
<h4>Iluminismo</h4><ul>
<li><strong>Locke:</strong> direitos naturais, direito ├á revolu├º├úo</li>
<li><strong>Montesquieu:</strong> separa├º├úo dos tr├¬s poderes</li>
<li><strong>Rousseau:</strong> soberania popular, contrato social</li>
<li><strong>Voltaire:</strong> cr├¡tica ├á Igreja, liberdade de express├úo</li></ul>`,
        },
        {
            title:'Brasil Rep├║blica: Per├¡odos e Constitui├º├Áes',
            content:`<h4>Linha do tempo</h4><ul>
<li><strong>Rep├║blica Velha (1889ÔÇô1930):</strong> Oligarquias, pol├¡tica do caf├®-com-leite (SP├ùMG), coronelismo, Revolta da Chibata (1910), Semana de Arte Moderna (1922)</li>
<li><strong>Era Vargas (1930ÔÇô45):</strong> industrializa├º├úo, trabalhismo, Estado Novo</li>
<li><strong>Democracia Populista (1945ÔÇô64):</strong> JK (Bras├¡lia, 50 anos em 5), J├ónio Quadros, Jo├úo Goulart</li>
<li><strong>Ditadura Militar (1964ÔÇô85):</strong> 5 AI, AI-5 (1968), milagre econ├┤mico, abertura gradual</li>
<li><strong>Nova Rep├║blica (1985ÔÇô):</strong> Diretas J├í, Constitui├º├úo de 1988 (cidad├ú), Collor, FHC, Lula, Dilma, Temer, Bolsonaro, Lula</li></ul>
<h4>Constitui├º├Áes</h4><p>1824 (Imperial) ┬À 1891 (1┬¬ Rep├║blica) ┬À 1934 ┬À 1937 ┬À 1946 ┬À 1967/69 ┬À <strong>1988</strong> (atual ÔÇö redemocratiza├º├úo, direitos sociais amplos).</p>`,
        },
    ]},
    natureza: { icon:'­ƒö¼', name:'Ci├¬ncias da Natureza', topics:[
        {
            title:'Leis de Mendel e Gen├®tica',
            content:`<h4>1┬¬ Lei ÔÇö Segrega├º├úo dos Fatores</h4>
<p>Cada car├íter ├® determinado por dois fatores (alelos) que se separam na forma├º├úo dos gametas, cada gameta recebe um alelo. Ex: Aa ÔåÆ 50% gametas A + 50% gametas a.</p>
<h4>2┬¬ Lei ÔÇö Segrega├º├úo Independente</h4>
<p>Genes de cromossomos diferentes se separam de modo independente. Propor├º├úo cl├íssica F2 di├¡brido: <strong>9:3:3:1</strong>.</p>
<h4>Exce├º├Áes importantes</h4><ul>
<li><strong>Codomin├óncia:</strong> ambos os alelos se expressam (tipo sangu├¡neo AB)</li>
<li><strong>Domin├óncia incompleta:</strong> fen├│tipo intermedi├írio (flor rosa = V├ùB)</li>
<li><strong>Pleiotropia:</strong> 1 gene ÔåÆ m├║ltiplos fen├│tipos (anemia falciforme)</li>
<li><strong>Epistase:</strong> gene mascara outro (albinismo)</li>
<li><strong>Liga├º├úo g├¬nica:</strong> genes no mesmo cromossomo ÔÇö violam 2┬¬ Lei</li></ul>
<h4>Tipo sangu├¡neo ABO</h4><p>Iß┤¼ e Iß┤« s├úo codominantes com i recessivo. Rh: Rr ou RR = Rh+; rr = RhÔêÆ.</p>`,
        },
        {
            title:'Fun├º├Áes Org├ónicas (Qu├¡mica)',
            content:`<h4>Grupos funcionais principais</h4>
<ul>
<li><strong>├ülcool:</strong> ÔÇôOH ligado a C saturado ┬À Ex: etanol (CÔééHÔéàOH)</li>
<li><strong>Fenol:</strong> ÔÇôOH ligado a anel benz├¬nico ┬À Ex: fenol, ├ícido salic├¡lico</li>
<li><strong>Alde├¡do:</strong> ÔÇôCHO na extremidade da cadeia ┬À Ex: formalde├¡do, acetalde├¡do</li>
<li><strong>Cetona:</strong> C=O no interior da cadeia ┬À Ex: acetona</li>
<li><strong>├ücido carbox├¡lico:</strong> ÔÇôCOOH ┬À Ex: ├ícido ac├®tico (vinagre), ├ícido c├¡trico</li>
<li><strong>├ëster:</strong> RÔÇôCOOÔÇôR' ┬À respons├ível por aromas; formado por esterifica├º├úo (├ícido + ├ílcool ÔåÆ ├®ster + ├ígua)</li>
<li><strong>Amina:</strong> ÔÇôNHÔéé ┬À Ex: metilamina, dopamina</li>
<li><strong>Amida:</strong> ÔÇôCOÔÇôNHÔÇô ┬À Ex: ur├®ia, nylon</li>
<li><strong>├ëter:</strong> RÔÇôOÔÇôR' ┬À Ex: ├®ter et├¡lico (anest├®sico)</li></ul>
<h4>Dica ENEM</h4><p>Identificar o grupo funcional pelo sufixo: -ol (├ílcool), -al (alde├¡do), -ona (cetona), -oico (├ícido), -ato (├®ster), -amina, -amida.</p>`,
        },
        {
            title:'Termodin├ómica',
            content:`<h4>1┬¬ Lei ÔÇö Conserva├º├úo de Energia</h4>
<p>╬öU = Q ÔêÆ W. Q>0: sistema absorve calor. W>0: sistema realiza trabalho sobre a vizinhan├ºa.</p>
<h4>2┬¬ Lei ÔÇö Entropia e Irreversibilidade</h4>
<p>O calor flui espontaneamente do corpo mais quente para o mais frio. A entropia (desordem) do universo sempre aumenta em processos reais. Imposs├¡vel construir motor de 100% rendimento.</p>
<h4>Rendimento de m├íquinas t├®rmicas</h4>
<p>╬À = W/QÔéü = 1 ÔêÆ QÔéé/QÔéü. M├íquina de Carnot (ideal): ╬À = 1 ÔêÆ Tf/Tq (em Kelvin). T(K) = T(┬░C) + 273.</p>
<h4>Processos termodin├ómicos</h4><ul>
<li>Isot├®rmico: T constante ÔåÆ ╬öU=0 ÔåÆ Q=W</li>
<li>Isob├írico: P constante ÔåÆ W=P╬öV</li>
<li>Isovolum├®trico (isoc├│rico): V constante ÔåÆ W=0 ÔåÆ ╬öU=Q</li>
<li>Adiab├ítico: Q=0 ÔåÆ ╬öU=ÔêÆW</li></ul>`,
        },
        {
            title:'Ecologia e Meio Ambiente',
            content:`<h4>N├¡veis de organiza├º├úo ecol├│gica</h4>
<p>Indiv├¡duo ÔåÆ Popula├º├úo ÔåÆ Comunidade ÔåÆ Ecossistema ÔåÆ Biosfera.</p>
<h4>Cadeias e teias alimentares</h4>
<ul>
<li><strong>Produtores:</strong> plantas e algas (fotoss├¡ntese)</li>
<li><strong>Consumidores prim├írios:</strong> herb├¡voros</li>
<li><strong>Consumidores secund├írios/terci├írios:</strong> carn├¡voros</li>
<li><strong>Decompositores:</strong> fungos e bact├®rias ÔÇö reciclam nutrientes</li></ul>
<h4>Ciclos biogeoqu├¡micos</h4>
<p>Carbono (fotoss├¡ntese/respira├º├úo), Nitrog├¬nio (fixa├º├úo ÔåÆ nitrifica├º├úo ÔåÆ desnitrifica├º├úo), ├ügua (evapora├º├úo ÔåÆ precipita├º├úo ÔåÆ percola├º├úo).</p>
<h4>Biomas brasileiros (ENEM adora!)</h4>
<ul>
<li><strong>Amaz├┤nia:</strong> maior biodiversidade terrestre; amea├ºa: desmatamento</li>
<li><strong>Cerrado:</strong> savana tropical; 2┬¬ maior biodiversidade brasileira; "ber├ºo das ├íguas"</li>
<li><strong>Mata Atl├óntica:</strong> 12-13% remanescente; hotspot de biodiversidade</li>
<li><strong>Caatinga:</strong> ├║nico bioma exclusivamente brasileiro; semi├írido</li>
<li><strong>Pampa e Pantanal:</strong> menor extens├úo; Pantanal = maior ├írea ├║mida do mundo</li></ul>`,
        },
        {
            title:'F├¡sica Moderna ÔÇö Relatividade e Qu├óntica',
            content:`<h4>Relatividade Especial (Einstein, 1905)</h4>
<ul>
<li>A velocidade da luz c = 3├ù10Ôü© m/s ├® constante para todos os observadores</li>
<li><strong>Dilata├º├úo do tempo</strong> e <strong>contra├º├úo do espa├ºo</strong> para corpos em alta velocidade</li>
<li>E = mc┬▓: equival├¬ncia massa-energia ÔÇö base da energia nuclear</li></ul>
<h4>F├¡sica Qu├óntica</h4>
<ul>
<li><strong>Efeito fotoel├®trico (Einstein, Nobel 1921):</strong> luz em f├│tons E=hf; el├®trons s├úo ejetados quando f ÔëÑ frequ├¬ncia limiar</li>
<li><strong>Modelo at├┤mico de Bohr:</strong> el├®trons em ├│rbitas estacion├írias; emiss├úo/absor├º├úo de luz ao mudar de n├¡vel</li>
<li><strong>Dualidade onda-part├¡cula (De Broglie):</strong> mat├®ria tem comportamento ondulat├│rio ╬╗=h/mv</li>
<li><strong>Princ├¡pio da Incerteza (Heisenberg):</strong> n├úo ├® poss├¡vel medir posi├º├úo e velocidade simultaneamente com precis├úo ilimitada</li></ul>`,
        },
    ]},
    linguagens: { icon:'­ƒôØ', name:'Linguagens', topics:[
        {
            title:'5 Compet├¬ncias da Reda├º├úo ENEM',
            content:`<h4>Cada compet├¬ncia vale 0ÔÇô200 pts (total: 1000)</h4>
<ul>
<li><strong>C1 ÔÇö Norma culta:</strong> gram├ítica, ortografia, pontua├º├úo, concord├óncia. Erros graves zeram a nota!</li>
<li><strong>C2 ÔÇö Compreens├úo do tema + repert├│rio:</strong> entender o tema, n├úo fugir, usar dados/cita├º├Áes/leis relevantes. Repert├│rio deve ser pertinente e bem articulado.</li>
<li><strong>C3 ÔÇö Argumenta├º├úo:</strong> selecionar, organizar e interpretar informa├º├Áes. Tese clara, argumentos que a sustentam, exemplos e dados concretos.</li>
<li><strong>C4 ÔÇö Coes├úo textual:</strong> articula├º├úo entre partes usando conectivos, pronomes e sin├┤nimos. Sem repeti├º├úo e sem incoer├¬ncias.</li>
<li><strong>C5 ÔÇö Proposta de interven├º├úo:</strong> obrigatoriamente 5 elementos: a├º├úo + agente + modo/instrumento + efeito esperado + finalidade. Deve respeitar os direitos humanos.</li></ul>
<h4>Conectivos mais usados</h4>
<p>Causais: porque, pois, visto que ┬À Concessivos: embora, ainda que, apesar de ┬À Conclusivos: portanto, logo, assim ┬À Adversativos: por├®m, contudo, entretanto ┬À Aditivos: al├®m disso, tamb├®m, n├úo s├│...mas tamb├®m</p>`,
        },
        {
            title:'Figuras de Linguagem completo',
            content:`<ul>
<li><strong>Met├ífora:</strong> compara├º├úo impl├¡cita ÔÇö "meu cora├º├úo ├® uma pedra"; "tempo ├® dinheiro"</li>
<li><strong>Meton├¡mia:</strong> substitui├º├úo por rela├º├úo ÔÇö "li Clarice" (autor/obra); "Brasil venceu" (pa├¡s/time); "beber o c├ílice" (recipiente/conte├║do)</li>
<li><strong>Catacrese:</strong> met├ífora cristalizada ÔÇö "p├® da mesa", "bra├ºo do rio", "asa da x├¡cara"</li>
<li><strong>Ironia:</strong> dizer o oposto do que se pensa com inten├º├úo cr├¡tica ÔÇö "Que bela ideia!"</li>
<li><strong>Hip├®rbole:</strong> exagero expressivo ÔÇö "chorei um oceano"; "te liguei mil vezes"</li>
<li><strong>Eufemismo:</strong> suavizar ideia negativa ÔÇö "partiu para um lugar melhor"; "colaborador" (empregado)</li>
<li><strong>Ant├¡tese:</strong> ideias opostas aproximadas ÔÇö "era o melhor dos tempos, era o pior dos tempos"</li>
<li><strong>Paradoxo:</strong> contradi├º├úo aparente mas verdadeira ÔÇö "morro de tanto viver"; "claridade cega"</li>
<li><strong>Personifica├º├úo/Prosopopeia:</strong> humanos atributos ao inanimado ÔÇö "o vento gemeu"; "a esperan├ºa suspirou"</li>
<li><strong>Sinestesia:</strong> mistura de sentidos ÔÇö "voz aveludada"; "cor quente"</li>
<li><strong>Alitera├º├úo:</strong> repeti├º├úo de consoantes ÔÇö "Peter Piper picked peppers"</li>
<li><strong>An├ífora:</strong> repeti├º├úo de palavra no in├¡cio dos versos/frases ÔÇö discurso de M.L.King: "I have a dream"</li></ul>`,
        },
        {
            title:'G├¬neros Textuais e Tipologias',
            content:`<h4>Tipos textuais (como est├í organizado o texto)</h4>
<ul>
<li><strong>Narrativo:</strong> conta um relato com personagens, enredo, tempo e espa├ºo</li>
<li><strong>Descritivo:</strong> apresenta caracter├¡sticas de um ser, objeto ou lugar</li>
<li><strong>Dissertativo-argumentativo:</strong> defende tese com argumentos ÔÇö g├¬nero da reda├º├úo ENEM</li>
<li><strong>Expositivo:</strong> informa e explica sem argumentar (artigo cient├¡fico, enciclop├®dia)</li>
<li><strong>Injuntivo/Instrucional:</strong> orienta a├º├Áes (receita, manual, bula)</li></ul>
<h4>G├¬neros discursivos (como circula na sociedade)</h4>
<p>Cada g├¬nero tem estrutura composicional, estilo e conte├║do tem├ítico. Ex: carta, reportagem, charge, tirinha, editorial, blog, post, discurso pol├¡tico, conto, cr├┤nica, poema.</p>
<h4>Dica ENEM</h4><p>A prova cobra: infer├¬ncia, intertextualidade, ironia em charges/tirinhas, varia├º├úo lingu├¡stica (norma culta vs. variedades), fun├º├Áes da linguagem (referencial, emotiva, conativa, f├ítica, po├®tica, metalingu├¡stica).</p>`,
        },
        {
            title:'Literatura Brasileira ÔÇö Escolas Liter├írias',
            content:`<h4>Pr├®-Modernismo e Modernismo</h4>
<ul>
<li><strong>Realismo (1881):</strong> Machado de Assis ÔÇö narrativa psicol├│gica, ironia, cr├¡tica social. Obras: Dom Casmurro, Quincas Borba</li>
<li><strong>Naturalismo:</strong> Alu├¡sio Azevedo ÔÇö determinismo, meio e ra├ºa. O Corti├ºo</li>
<li><strong>Pr├®-Modernismo:</strong> Euclides da Cunha (Os Sert├Áes), Lima Barreto, Gra├ºa Aranha</li></ul>
<h4>1┬¬ Fase Modernista (1922ÔÇô30) ÔÇö "Destrui├º├úo"</h4>
<p>Semana de Arte Moderna (fev/1922): liberdade formal, valoriza├º├úo do popular e nacional. Oswald de Andrade (Manifesto Antrop├│fago), M├írio de Andrade (Macuna├¡ma).</p>
<h4>2┬¬ Fase Modernista (1930ÔÇô45) ÔÇö "Constru├º├úo"</h4>
<p>Prosa regionalista e maior preocupa├º├úo social. Carlos Drummond de Andrade (poesia social), Cec├¡lia Meireles, Jo├úo Cabral de Melo Neto. Em prosa: Graciliano Ramos (Vidas Secas), Jorge Amado, Jos├® Lins do Rego.</p>
<h4>Literatura Contempor├ónea (p├│s-1945)</h4>
<p>Guimar├úes Rosa (Grande Sert├úo: Veredas ÔÇö linguagem inventiva), Clarice Lispector (fluxo de consci├¬ncia), Jo├úo Guimar├úes Rosa, Rubem Fonseca (conto urbano violento). Poesia concreta: D├®cio Pignatari.</p>`,
        },
    ]},
    matematica: { icon:'Ô×ù', name:'Matem├ítica', topics:[
        {
            title:'Fun├º├Áes de 1┬║ e 2┬║ Grau',
            content:`<h4>Fun├º├úo Afim ÔÇö f(x) = ax + b</h4>
<p>Crescente se a>0; decrescente se a<0; constante se a=0. Zero (raiz): x = ÔêÆb/a. Gr├ífico: reta.</p>
<h4>Fun├º├úo Quadr├ítica ÔÇö f(x) = ax┬▓ + bx + c</h4>
<p>Gr├ífico: par├íbola. Concavidade: Ôê¬ se a>0; Ôê® se a<0.<br>
V├®rtice: xßÁÑ = ÔêÆb/2a ┬À yßÁÑ = ÔêÆ╬ö/4a.<br>
╬ö = b┬▓ÔêÆ4ac: se ╬ö>0 ÔåÆ 2 ra├¡zes; ╬ö=0 ÔåÆ 1 raiz dupla; ╬ö<0 ÔåÆ sem ra├¡zes reais.<br>
Bhaskara: x = (ÔêÆb ┬▒ ÔêÜ╬ö) / 2a.</p>
<h4>Dicas visuais</h4>
<ul><li>Se a pergunta envolve "maior valor" ou "menor valor" ÔåÆ busque o v├®rtice</li>
<li>Se a par├íbola corta o eixo x ÔåÆ use Bhaskara ou fatora├º├úo</li>
<li>Fun├º├úo afim: velocidade, sal├írio, taxa fixa + vari├ível</li>
<li>Quadr├ítica: trajet├│ria de proj├®teis, ├írea em fun├º├úo de medida</li></ul>`,
        },
        {
            title:'Geometria Plana ÔÇö ├üreas e Per├¡metros',
            content:`<h4>F├│rmulas essenciais</h4>
<ul>
<li><strong>Quadrado:</strong> A = l┬▓ ┬À P = 4l</li>
<li><strong>Ret├óngulo:</strong> A = b ├ù h ┬À P = 2(b+h)</li>
<li><strong>Tri├óngulo:</strong> A = b├ùh/2 ┬À Equil├ítero: A = l┬▓ÔêÜ3/4</li>
<li><strong>C├¡rculo:</strong> A = ¤Çr┬▓ ┬À Comprimento: C = 2¤Çr ┬À Arco: s = r╬© (╬© em rad)</li>
<li><strong>Trap├®zio:</strong> A = (B+b)├ùh/2</li>
<li><strong>Losango:</strong> A = dÔéü├ùdÔéé/2</li>
<li><strong>Paralelogramo:</strong> A = b├ùh</li></ul>
<h4>Geometria Espacial</h4>
<ul>
<li>Cubo: V = a┬│ ┬À A = 6a┬▓</li>
<li>Paralelep├¡pedo: V = a├ùb├ùc</li>
<li>Cilindro: V = ¤Çr┬▓h ┬À Alateral = 2¤Çrh</li>
<li>Cone: V = ¤Çr┬▓h/3 ┬À Alateral = ¤Çrl (l = geratriz)</li>
<li>Esfera: V = 4¤Çr┬│/3 ┬À A = 4¤Çr┬▓</li>
<li>Pir├ómide: V = Ab├ùh/3 (Ab = ├írea da base)</li></ul>`,
        },
        {
            title:'Probabilidade e Combinat├│ria',
            content:`<h4>Probabilidade</h4>
<p>P(A) = n┬║ casos favor├íveis / n┬║ casos totais. P Ôêê [0,1]. P(A') = 1 ÔêÆ P(A).<br>
<strong>Adi├º├úo:</strong> P(AÔê¬B) = P(A) + P(B) ÔêÆ P(AÔê®B).<br>
<strong>Multiplica├º├úo (independentes):</strong> P(AÔê®B) = P(A)┬ÀP(B).<br>
<strong>Condicional:</strong> P(A|B) = P(AÔê®B)/P(B).</p>
<h4>An├ílise Combinat├│ria</h4>
<ul>
<li><strong>Princ├¡pio Fundamental da Contagem:</strong> nÔéü ├ù nÔéé ├ù ... ├ù nÔéû</li>
<li><strong>Permuta├º├úo simples:</strong> PÔéÖ = n!</li>
<li><strong>Arranjo:</strong> A(n,p) = n!/(nÔêÆp)!</li>
<li><strong>Combina├º├úo:</strong> C(n,p) = n!/(p!┬À(nÔêÆp)!)</li>
<li><strong>Permuta├º├úo com repeti├º├úo:</strong> n!/(nÔéü!┬ÀnÔéé!┬À┬À┬À)</li></ul>
<h4>Truque ENEM</h4>
<p>Se a ordem importa ÔåÆ Arranjo/Permuta├º├úo. Se a ordem N├âO importa ÔåÆ Combina├º├úo. Senhas e filas pedem Arranjo; comiss├Áes e grupos pedem Combina├º├úo.</p>`,
        },
        {
            title:'Progress├Áes Aritm├®ticas e Geom├®tricas',
            content:`<h4>PA ÔÇö Progress├úo Aritm├®tica (raz├úo r)</h4>
<ul>
<li>Termo geral: aÔéÖ = aÔéü + (nÔêÆ1)r</li>
<li>Soma dos n termos: SÔéÖ = n┬À(aÔéü+aÔéÖ)/2</li>
<li>Exemplos: 2, 5, 8, 11ÔÇª (r=3) ┬À sal├írios com aumento fixo</li></ul>
<h4>PG ÔÇö Progress├úo Geom├®trica (raz├úo q)</h4>
<ul>
<li>Termo geral: aÔéÖ = aÔéü ┬À qÔü┐Ôü╗┬╣</li>
<li>Soma dos n termos: SÔéÖ = aÔéü┬À(qÔü┐ÔêÆ1)/(qÔêÆ1)</li>
<li>PG infinita (|q|<1): SÔê× = aÔéü/(1ÔêÆq)</li>
<li>Exemplos: 1, 2, 4, 8ÔÇª (q=2) ┬À juros compostos ┬À crescimento populacional</li></ul>
<h4>Juros Compostos</h4>
<p>M = C┬À(1+i)Ôü┐, onde C = capital, i = taxa, n = per├¡odos. PG com q = (1+i). Aparecem em quest├Áes de investimento, d├¡vida e infla├º├úo no ENEM.</p>`,
        },
        {
            title:'Trigonometria e Fun├º├Áes Trigonom├®tricas',
            content:`<h4>Raz├Áes no tri├óngulo ret├óngulo</h4>
<p>sen ╬© = oposto/hipotenusa ┬À cos ╬© = adjacente/hipotenusa ┬À tg ╬© = oposto/adjacente</p>
<h4>Valores especiais</h4>
<table style="width:100%;border-collapse:collapse;font-size:12px">
<tr><th style="border:1px solid var(--border-subtle);padding:4px">╬©</th><th style="border:1px solid var(--border-subtle);padding:4px">sen</th><th style="border:1px solid var(--border-subtle);padding:4px">cos</th><th style="border:1px solid var(--border-subtle);padding:4px">tg</th></tr>
<tr><td style="border:1px solid var(--border-subtle);padding:4px;text-align:center">30┬░</td><td style="border:1px solid var(--border-subtle);padding:4px;text-align:center">1/2</td><td style="border:1px solid var(--border-subtle);padding:4px;text-align:center">ÔêÜ3/2</td><td style="border:1px solid var(--border-subtle);padding:4px;text-align:center">ÔêÜ3/3</td></tr>
<tr><td style="border:1px solid var(--border-subtle);padding:4px;text-align:center">45┬░</td><td style="border:1px solid var(--border-subtle);padding:4px;text-align:center">ÔêÜ2/2</td><td style="border:1px solid var(--border-subtle);padding:4px;text-align:center">ÔêÜ2/2</td><td style="border:1px solid var(--border-subtle);padding:4px;text-align:center">1</td></tr>
<tr><td style="border:1px solid var(--border-subtle);padding:4px;text-align:center">60┬░</td><td style="border:1px solid var(--border-subtle);padding:4px;text-align:center">ÔêÜ3/2</td><td style="border:1px solid var(--border-subtle);padding:4px;text-align:center">1/2</td><td style="border:1px solid var(--border-subtle);padding:4px;text-align:center">ÔêÜ3</td></tr>
</table>
<h4>Identidades fundamentais</h4>
<p>sen┬▓╬© + cos┬▓╬© = 1 ┬À tg ╬© = sen╬©/cos╬© ┬À Lei dos cossenos: a┬▓=b┬▓+c┬▓ÔêÆ2bc┬Àcos A</p>`,
        },
    ]},
};

let _fcCards = [...FLASHCARDS];
let _fcIdx   = 0;
let _fcKnown = new Set();      // ├¡ndices originais dominados
let _fcDifficult = new Set();  // ├¡ndices originais confusos
let _fcDisc  = '';
let _fcLvl   = 0;
let _fcReviewMode = false;     // true = modo "Revisar confusos"
let _tutorMessages = [];

function renderConteudo() {
    // Inicializar flashcards na primeira vez
    if (_fcCards.length === 0) _fcCards = [...FLASHCARDS];
    renderCurrentFlashcard();
    renderResumosPanel();

    // Mensagem inicial do tutor ÔÇö recupera hist├│rico da sess├úo se houver
    if (_tutorMessages.length === 0) {
        try {
            const saved = sessionStorage.getItem('tutor_history');
            if (saved) _tutorMessages = JSON.parse(saved);
        } catch {}
    }
    if (_tutorMessages.length === 0) {
        _tutorMessages = [{
            role: 'ai',
            text: 'Ol├í! Sou o **Tutor IA** do ENEM Master ­ƒÄô\n\nPosso te explicar qualquer assunto do ENEM: *Matem├ítica, F├¡sica, Qu├¡mica, Biologia, Humanas, Linguagens e Reda├º├úo*.\n\nUse as sugest├Áes acima ou fa├ºa sua pergunta! ­ƒæå',
        }];
    }
    _renderTutorMessages();
}

function switchConteudoTab(tab, btn) {
    document.querySelectorAll('.conteudo-tab').forEach(t => t.classList.remove('active'));
    // Oculta todos os pain├®is respeitando o display correto de cada um
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

// ÔöÇÔöÇ Progresso ÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇ
function renderProgressoPanel() {
    // Streak
    const streak = (state.user && state.user.streak) || 0;
    const streakEl = document.getElementById('prog-streak-num');
    if (streakEl) streakEl.textContent = streak;

    // Barras por disciplina
    const discs = ['humanas', 'natureza', 'linguagens', 'matematica'];
    const discIcons  = { humanas: '­ƒîì', natureza: '­ƒö¼', linguagens: '­ƒôØ', matematica: 'Ô×ù' };
    const discNames  = { humanas: 'Humanas', natureza: 'Natureza', linguagens: 'Linguagens', matematica: 'Matem├ítica' };
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

    // Top 3 t├│picos com mais erros
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
            errorsEl.innerHTML = '<li class="prog-no-errors">Nenhum cart├úo marcado como "confuso" ainda.</li>';
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

// ÔöÇÔöÇ Flashcards ÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇ
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
        _showQuickToast('Nenhum card com esses filtros ­ƒÿà');
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

    // Mostrar bot├úo Revisar confusos somente se houver confusos e n├úo estiver no modo review
    if (reviewBtn) {
        if (_fcDifficult.size > 0 && !_fcReviewMode) {
            reviewBtn.style.display = 'inline-flex';
            reviewBtn.textContent   = `­ƒöü Revisar ${_fcDifficult.size} confuso${_fcDifficult.size > 1 ? 's' : ''}`;
        } else if (_fcReviewMode) {
            reviewBtn.style.display = 'inline-flex';
            reviewBtn.textContent   = 'ÔåÉ Todos os cards';
        } else {
            reviewBtn.style.display = 'none';
        }
    }

    if (lvlBadge) {
        const lvlMap = {
            1: { label:'F├üCIL',   color:'#4ade80', bg:'rgba(74,222,128,0.15)' },
            2: { label:'M├ëDIO',   color:'#fbbf24', bg:'rgba(251,191,36,0.15)' },
            3: { label:'DIF├ìCIL', color:'#f87171', bg:'rgba(248,113,113,0.15)' },
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
        _showQuickToast('­ƒÄë Voc├¬ revisou todos os flashcards!');
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
        _showQuickToast(`Ô£à Dominado! ${_fcKnown.size} de ${_fcCards.length}`);
    } else {
        _fcDifficult.add(globalIdx);
        _fcKnown.delete(globalIdx);
        _showQuickToast(`­ƒôû Anotado para revisar`);
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
        _showQuickToast('­ƒôï Voltando a todos os cards');
    } else {
        // Entrar no modo revisar: filtra apenas os confusos
        const difficultCards = [..._fcDifficult].map(i => FLASHCARDS[i]).filter(Boolean);
        if (!difficultCards.length) { _showQuickToast('Nenhum card marcado como confuso ainda!'); return; }
        _fcReviewMode = true;
        _fcCards = difficultCards;
        _fcIdx   = 0;
        _showQuickToast(`­ƒöü Revisando ${difficultCards.length} card${difficultCards.length > 1 ? 's' : ''} confuso${difficultCards.length > 1 ? 's' : ''}`);
        renderCurrentFlashcard();
    }
}

// ÔöÇÔöÇ Resumos ÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇ
// Carrega IDs de t├│picos estudados do localStorage
function _loadStudiedTopics() {
    try { return new Set(JSON.parse(localStorage.getItem('resumos_studied') || '[]')); }
    catch { return new Set(); }
}
function _saveStudiedTopics(set) {
    try { localStorage.setItem('resumos_studied', JSON.stringify([...set])); } catch {}
}

function renderResumosPanel() {
    const listEl = document.getElementById('resumos-list');
    if (!listEl || listEl.children.length > 0) return; // s├│ renderiza uma vez

    const studied = _loadStudiedTopics();

    Object.entries(RESUMOS).forEach(([disc, data]) => {
        const discBtn = document.createElement('button');
        discBtn.className = 'resumo-disc-btn';

        // Conta t├│picos estudados desta disciplina
        const studiedCount = data.topics.filter((_, i) => studied.has(`${disc}_${i}`)).length;
        const allStudied = studiedCount === data.topics.length;

        discBtn.innerHTML = `
            <span class="resumo-disc-icon">${data.icon}</span>
            <div style="flex:1">
                <p class="resumo-disc-name">${data.name}</p>
                <p class="resumo-disc-sub">${studiedCount > 0 ? `${studiedCount}/${data.topics.length} estudados` : `${data.topics.length} t├│picos`}</p>
            </div>
            ${allStudied ? '<span style="font-size:11px;font-weight:700;color:#4ade80">&#10003; Completo</span>' : ''}
            <span class="resumo-disc-arrow">ÔÇ║</span>`;
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

            // Bot├úo Marcar como estudado
            const markBtn = document.createElement('button');
            markBtn.className = `resumo-mark-btn${isStudied ? ' studied' : ''}`;
            markBtn.textContent = isStudied ? 'Ô£ô Estudado' : 'Marcar como estudado';
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
    document.querySelectorAll('.resumo-disc-arrow').forEach(a => a.textContent = 'ÔÇ║');

    if (!isOpen) {
        content.classList.add('open');
        const arrow = btn.querySelector('.resumo-disc-arrow');
        if (arrow) arrow.textContent = '╦à';
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
        btn.textContent = 'Ô£ô Estudado';
        btn.classList.add('studied');
        _showQuickToast('Ô£à T├│pico marcado como estudado!');
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
        if (subEl) subEl.textContent = studiedCount > 0 ? `${studiedCount}/${data.topics.length} estudados` : `${data.topics.length} t├│picos`;
        const allStudied = studiedCount === data.topics.length;
        let completeTag = discBtn.querySelector('.resumo-complete-tag');
        if (allStudied && !completeTag) {
            completeTag = document.createElement('span');
            completeTag.className = 'resumo-complete-tag';
            completeTag.style.cssText = 'font-size:11px;font-weight:700;color:#4ade80';
            completeTag.textContent = 'Ô£ô Completo';
            discBtn.insertBefore(completeTag, discBtn.querySelector('.resumo-disc-arrow'));
        } else if (!allStudied && completeTag) {
            completeTag.remove();
        }
    }
}

// ÔöÇÔöÇ Tutor IA ÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇ
const _TUTOR_KB = {
    // ÔöÇÔöÇ Matem├ítica ÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇ
    'pit[a├í]goras|cat[e├¬]to|hipotenusa':
        'O **Teorema de Pit├ígoras**: em tri├óngulo ret├óngulo, **a┬▓ = b┬▓ + c┬▓**, onde *a* = hipotenusa e *b, c* = catetos. Exemplo: catetos 3 e 4 ÔåÆ hipotenusa = ÔêÜ(9+16) = **5**.',
    'bhaskara|equa.*segundo grau|fun.*quadr':
        'A **F├│rmula de Bhaskara** resolve ax┬▓+bx+c=0: **x = (ÔêÆb ┬▒ ÔêÜ╬ö) / 2a**, onde **╬ö = b┬▓ÔêÆ4ac**. ╬ö>0: 2 ra├¡zes; ╬ö=0: 1 raiz dupla; ╬ö<0: sem ra├¡zes reais.',
    'probabilidade|combinat|fatorial|permuta':
        '**Probabilidade:** P(A) = favor├íveis / poss├¡veis. **Combina├º├úo:** C(n,k) = n! / (k!┬À(n-k)!). **Permuta├º├úo:** PÔéÖ = n!. Se a ordem importa ÔåÆ Arranjo/Permuta├º├úo. Se a ordem N├âO importa ÔåÆ Combina├º├úo.',
    'fun.*afim|fun.*primeiro grau|fun.*linear':
        '**Fun├º├úo Afim** f(x)=ax+b: a>0 ÔåÆ crescente; a<0 ÔåÆ decrescente. Zero (raiz): x=ÔêÆb/a. O coeficiente angular *a* diz "quanto y varia para cada 1 unidade de x".',
    'logaritmo|log|exponenci':
        '**Logaritmo:** logÔéÉb=x Ôåö a╦ú=b. Propriedades: log(AB)=logA+logB; log(A/B)=logAÔêÆlogB; log(AÔü┐)=n┬ÀlogA. **Exponencial:** f(x)=b╦ú, invers├úo do log. Modela: crescimento populacional, juros compostos, meia-vida radioativa.',
    'trigon|seno|cosseno|tangente':
        '**Trigonometria:** sen ╬© = oposto/hipotenusa ┬À cos ╬© = adjacente/hipotenusa ┬À tg ╬© = oposto/adjacente. Valores: 30┬░ÔåÆ(1/2, ÔêÜ3/2, ÔêÜ3/3); 45┬░ÔåÆ(ÔêÜ2/2, ÔêÜ2/2, 1); 60┬░ÔåÆ(ÔêÜ3/2, 1/2, ÔêÜ3). Identidade: **sen┬▓╬© + cos┬▓╬© = 1**.',
    'juros.*compost|montante|capital':
        '**Juros Compostos:** M = C┬À(1+i)Ôü┐ ÔÇö M=montante, C=capital, i=taxa, n=per├¡odos. Cada per├¡odo o juros incide sobre o montante anterior ("juros sobre juros"). No ENEM aparecem em quest├Áes de financiamento, poupan├ºa e d├¡vida.',
    'geometria|[a├í]rea|volume|peri[m├¡]metro':
        '**Geometria:** Tri├óngulo A=bh/2; C├¡rculo A=¤Çr┬▓, C=2¤Çr; Ret├óngulo A=bh. Volumes: Esfera V=4¤Çr┬│/3; Cilindro V=¤Çr┬▓h; Cone V=¤Çr┬▓h/3; Cubo V=a┬│. Pit├ígoras para diagonal: d=ÔêÜ(a┬▓+b┬▓+c┬▓).',

    // ÔöÇÔöÇ Ci├¬ncias da Natureza ÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇ
    'dna|gen[e├®]tica|alelo|mendel|here':
        '**Gen├®tica:** DNA armazena informa├º├Áes em bases A-T-C-G (dupla h├®lice). **1┬¬ Lei de Mendel:** cada alelo se separa nos gametas (Aa ÔåÆ 50%A + 50%a). **2┬¬ Lei:** genes em cromossomos diferentes segregam independentemente ÔåÆ propor├º├úo 9:3:3:1. Exce├º├Áes: codomin├óncia, epistase, liga├º├úo g├¬nica.',
    'termodin[a├ó]mica|calor|entropia|carnot':
        '**1┬¬ Lei:** ╬öU = Q ÔêÆ W (energia se conserva). **2┬¬ Lei:** calor flui do quente para o frio; entropia do universo sempre aumenta. Rendimento de Carnot: ╬À = 1 ÔêÆ Tf/Tq (em Kelvin).',
    'ph|[a├í]cido|base|neutraliz':
        '**pH:** < 7 = ├ícido (HÔü║ livre); = 7 = neutro; > 7 = b├ísico (OHÔü╗ livre). Neutraliza├º├úo: ├ícido + base ÔåÆ sal + ├ígua. Indicadores: tornassol fica vermelho em ├ícidos, azul em bases.',
    'elect|[e├®]letricidade|corrente|ohm|tens[a├ú]o|resist[e├¬]ncia':
        '**Lei de Ohm:** V = R┬ÀI (Tens├úo = Resist├¬ncia ├ù Corrente). Pot├¬ncia: P = V┬ÀI = V┬▓/R = I┬▓R. Em paralelo: 1/Rt = 1/RÔéü+1/RÔéé. Em s├®rie: Rt = RÔéü+RÔéé. Coulomb: F=kqÔéüqÔéé/d┬▓.',
    'oxirredu|oxida|reduz|redu[├ºc][a├ú]o|agente':
        '**Oxirredu├º├úo:** quem perde el├®trons = **oxidado** (agente redutor); quem ganha el├®trons = **reduzido** (agente oxidante). Mnem├┤nico: **OILRIG** ÔÇö Oxidation Is Loss, Reduction Is Gain.',
    'fotoss[i├¡]ntese|clorof|glic[o├│]se|plant':
        '**Fotoss├¡ntese:** 6COÔéé + 6HÔééO + luz ÔåÆ CÔéåHÔéüÔééOÔéå + 6OÔéé. Fase clara (membranas tilac├│ides): fot├│lise da ├ígua + ATP/NADPH. Fase escura/Ciclo de Calvin (estroma): fixa├º├úo do COÔéé em glicose.',
    'evolu|darwin|sele[├ºc][a├ú]o.*natural|esp├®cie':
        '**Teoria da Evolu├º├úo (Darwin):** Sele├º├úo Natural ÔÇö organismos com caracter├¡sticas vantajosas sobrevivem e reproduzem mais. Junto com **muta├º├úo** e **deriva gen├®tica**, explica a diversidade da vida. Evid├¬ncias: f├│sseis, anatomia comparada, biogeografia, gen├®tica.',
    'radioat|radioa[├ºc][a├ú]o|is├│topo|nuclear|meia.*vida':
        '**Radioatividade:** emiss├úo espont├ónea por n├║cleos inst├íveis. Tipos: ╬▒ (part├¡cula He┬▓Ôü║, baixa penetra├º├úo), ╬▓Ôü╗ (el├®tron, m├®dia), ╬│ (onda EM, alta penetra├º├úo). **Meia-vida:** tempo para metade da amostra se desintegrar. Aplica├º├Áes: data├º├úo C-14, medicina nuclear, energia nuclear.',

    // ÔöÇÔöÇ Ci├¬ncias Humanas ÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇ
    'revolu.*industrial':
        'A **Revolu├º├úo Industrial** (s├®c. XVIII, Inglaterra) substituiu o artesanato por f├íbricas a vapor, gerando urbaniza├º├úo, proletariado e capitalismo industrial. 1┬¬ Revolu├º├úo: carv├úo e ferro. 2┬¬ Revolu├º├úo: petr├│leo, eletricidade e a├ºo (s├®c. XIX). 3┬¬ Revolu├º├úo: digital (s├®c. XX).',
    'plano marshall|guerra fria|urss|eua.*soci':
        'A **Guerra Fria** (1947-91): EUA (capitalismo) ├ù URSS (socialismo). **Plano Marshall** ÔåÆ reconstruiu a Europa Ocidental contra o comunismo. OTAN ├ù Pacto de Vars├│via. Corrida armamentista, espacial e guerras proxy (Coreia, Vietn├ú). Fim: queda do Muro de Berlim (1989) e dissolu├º├úo da URSS (1991).',
    'revolu.*france|iluminismo|rousseau|montesquieu|locke|voltaire':
        'A **Revolu├º├úo Francesa (1789)**: derrubou o absolutismo de Lu├¡s XVI. Ideais: Liberdade, Igualdade, Fraternidade. Fases: Monarquia Constitucional ÔåÆ Terror (Robespierre) ÔåÆ Diret├│rio ÔåÆ Napole├úo. **Iluminismo**: Locke (direitos naturais), Montesquieu (triparti├º├úo dos poderes), Rousseau (contrato social), Voltaire (toler├óncia e cr├¡tica ├á Igreja).',
    'fascismo|nazismo|totalitar|hitler|mussolini':
        '**Totalitarismo** (entre-guerras): partido ├║nico, culto ao l├¡der, propaganda, repress├úo. **Fascismo italiano** (Mussolini, 1922): Estado forte, anticomunismo, expansionismo. **Nazismo alem├úo** (Hitler, 1933): racismo, antissemitismo, Holocausto (6 mi de judeus). Causas: sequelas de Versalhes e Grande Depress├úo de 1929.',
    'era vargas|estado novo|get├║lio|trabalhismo|clt':
        'A **Era Vargas (1930-45)**: Revolu├º├úo de 1930 ÔåÆ fim da Rep├║blica Velha. Legado trabalhista: **CLT** (1943), sal├írio m├¡nimo, Minist├®rio do Trabalho. Estado Novo (1937-45): ditadura com censura pelo DIP. Industrializa├º├úo pesada: CSN, Vale do Rio Doce, Petrobras (1953, 2┬║ governo).',
    'globaliz|neoliberal|privatiz|fmi|banco mundial':
        '**Globaliza├º├úo**: integra├º├úo econ├┤mica, cultural e pol├¡tica p├│s-1980, impulsionada pela tecnologia e queda do comunismo. **Neoliberalismo** (Thatcher/Reagan): livre mercado, Estado m├¡nimo, privatiza├º├Áes, abertura financeira. No Brasil: Collor e FHC (1990s) privatizaram estatais e abriram o mercado.',
    'indigen|povo.*origin|coloniz|amer├¡ndio':
        'Povos ind├¡genas brasileiros: ~1 milh├úo de pessoas, 305 etnias, 274 l├¡nguas. Impacto da coloniza├º├úo: doen├ºas, escravid├úo, viol├¬ncia, catequiza├º├úo. Demarca├º├úo de terras (Constitui├º├úo 1988, Art. 231). Quest├úo ENEM: direitos territoriais, diversidade cultural, Estatuto do ├ìndio vs. Marco Temporal.',

    // ÔöÇÔöÇ Linguagens e Reda├º├úo ÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇ
    'reda.*|dissertativo|compet[e├¬]ncia|proposta.*interven':
        'A **Reda├º├úo ENEM** ├® dissertativo-argumentativa: Introdu├º├úo (contextualiza├º├úo + tese) ÔåÆ Desenvolvimento 1 (argumento + exemplo) ÔåÆ Desenvolvimento 2 (argumento + dados) ÔåÆ Conclus├úo (proposta com **5 elementos**: a├º├úo, agente, modo/instrumento, efeito esperado, finalidade). Nota m├íxima = 1000 pts. Nunca fuja do tema ÔÇö risco de nota 0!',
    'met[a├í]fora|meton├¡m|figura.*ling|hip[e├®]rbole|eufemismo|ironia':
        '**Figuras de Linguagem:** Met├ífora (compara├º├úo impl├¡cita: "ele ├® uma pedra"), Meton├¡mia (substitui├º├úo por rela├º├úo: "li Clarice"), Hip├®rbole (exagero: "chorei um rio"), Eufemismo (suaviza├º├úo: "foi para um lugar melhor"), Ironia (dizer o oposto), Ant├¡tese (opostos juntos), Paradoxo (contradi├º├úo verdadeira), Personifica├º├úo (humanos ao inanimado).',
    'intertextual|inter.*text|parodia|par├ífrase':
        '**Intertextualidade**: quando um texto dialoga com outro por meio de cita├º├úo, par├│dia (deforma com humor), par├ífrase (reformula mantendo a ideia) ou alus├úo (refer├¬ncia impl├¡cita). No ENEM aparece em charges, tirinhas e publicidade ÔÇö exige repert├│rio cultural para identificar a refer├¬ncia.',
    'coes[a├ú]o|coes[a├ú]o|coer[e├¬]ncia|conect|articu':
        '**Coes├úo** (C4 da reda├º├úo): uso de pronomes, sin├┤nimos, conectivos e elipses para encadear o texto. **Coer├¬ncia**: consist├¬ncia l├│gica das ideias ÔÇö n├úo pode haver contradi├º├úo. Conectivos essenciais: portanto/logo/assim (conclus├úo); por├®m/entretanto/contudo (oposi├º├úo); porque/pois/visto que (causa); al├®m disso/tamb├®m (adi├º├úo).',
    'g[e├¬]nero.*text|narrativ|descrit|expositiv|injuntiv':
        '**Tipos textuais**: Narrativo (conta eventos ÔÇö conto, cr├┤nica), Descritivo (apresenta caracter├¡sticas), Dissertativo-argumentativo (defende tese ÔÇö reda├º├úo ENEM), Expositivo (informa sem argumentar), Injuntivo (instrui ÔÇö manual, receita). **G├¬neros discursivos**: como o texto circula na sociedade (artigo, carta, charge, tirinha, reportagem, blog etc.).',
};

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
        if (m.role === 'typing') return `<div class="tutor-msg ai"><div class="tutor-avatar">🤖</div><div class="tutor-bubble tutor-typing"><span></span><span></span><span></span></div></div>`;
        // Escape HTML primeiro, depois aplica markdown — evita XSS
        const safe = _escapeTutorText(m.text);
        const bubble = safe.replace(/\*\*(.+?)\*\*/g,'<strong>$1</strong>').replace(/\*(.+?)\*/g,'<em>$1</em>').replace(/\n/g,'<br>');
        return m.role === 'ai'
            ? `<div class="tutor-msg ai"><div class="tutor-avatar">🤖</div><div class="tutor-bubble">${bubble}</div></div>`
            : `<div class="tutor-msg user"><div class="tutor-bubble">${bubble}</div></div>`;
    }).join('');
    el.scrollTop = el.scrollHeight;

    // Oculta grid de sugest├Áes ap├│s a primeira mensagem do usu├írio
    const grid = document.getElementById('tutor-suggestions');
    const hasUserMsg = _tutorMessages.some(m => m.role === 'user');
    if (grid) grid.style.display = hasUserMsg ? 'none' : 'grid';

    // Persiste hist├│rico na sessionStorage
    try { sessionStorage.setItem('tutor_history', JSON.stringify(_tutorMessages.filter(m => m.role !== 'typing'))); } catch {}
}

function tutorNovaConversa() {
    _tutorMessages = [{
        role: 'ai',
        text: 'Ol├í! Sou o **Tutor IA** do ENEM Master ­ƒÄô\n\nPosso te explicar qualquer assunto do ENEM: *Matem├ítica, F├¡sica, Qu├¡mica, Biologia, Humanas, Linguagens e Reda├º├úo*.\n\nUse as sugest├Áes acima ou fa├ºa sua pergunta! ­ƒæå',
    }];
    try { sessionStorage.removeItem('tutor_history'); } catch {}
    _renderTutorMessages();
    // Reexibe o grid
    const grid = document.getElementById('tutor-suggestions');
    if (grid) grid.style.display = 'grid';
    _showQuickToast('­ƒôú Nova conversa iniciada');
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
    // Limpa o input ap├│s um tick para o usu├írio ver o que foi enviado
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
                            { role:'system', content:'Voc├¬ ├® um tutor especialista no ENEM. Responda em portugu├¬s, de forma did├ítica e concisa (m├íx. 3 par├ígrafos). Use exemplos pr├íticos das disciplinas: Humanas, Natureza, Linguagens, Matem├ítica.' },
                            ..._tutorMessages.filter(m=>m.role!=='typing').slice(-8).map(m=>({ role: m.role==='ai'?'assistant':'user', content: m.text })),
                        ],
                        temperature: 0.5, max_tokens: 500,
                    }),
                });
                if (res.ok) { const d = await res.json(); response = d.choices?.[0]?.message?.content || null; }
            } catch { /* ignore */ }
        }
    }

    if (!response) response = 'Hmm, n├úo encontrei uma resposta exata para isso! ­ƒñö Tente perguntar sobre: **gen├®tica, revolu├º├úo industrial, bhaskara, reda├º├úo ENEM, figuras de linguagem, probabilidade, pH, termodin├ómica**, etc.';

    _tutorMessages = _tutorMessages.filter(m => m.role !== 'typing');
    _tutorMessages.push({ role:'ai', text: response });
    _renderTutorMessages();
}

