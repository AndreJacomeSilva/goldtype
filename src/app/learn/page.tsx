"use client";
import React, { useState } from 'react';
import { ChevronDown, Target, Keyboard, Zap, Award, Hand, Monitor, Wind, Trophy, BookOpen, History, Languages, Coffee } from 'lucide-react';

type Section = {
  id: string;
  title: string;
  icon: React.ReactNode;
  text?: string;
  points?: string[];
};

type Item = {
  id: string;
  title: string;
  icon: React.ReactNode;
  sections: Section[];
};

const tipsContent: Item[] = [
  {
    id: 'group1',
    title: 'Grupo 1: A Base (A Fundamentação, pá!)',
    icon: <Hand size={24} className="text-blue-500" />,
    sections: [
      {
        id: 'posture',
        title: '1. Postura de Chefe: Senta-te como deve ser! 💪',
        icon: <Monitor size={20} className="text-blue-400" />,
        text: `Antes de tocares numa única tecla, a tua postura é fundamental. Escrever todo o dia numa posição marada é receita para dores nas costas e um mau humor que nem um cliente satisfeito cura.`,
        points: [
          "**Costas Direitas:** Senta-te com as costas retas e os ombros para trás. A tua cadeira deve apoiar a zona lombar.",
          "**Pés no Chão:** Ambos os pés devem estar bem assentes no chão. Se não chegas, usa um apoio. Deixa de balançar na cadeira!",
          "**Cotovelos em L:** Os teus cotovelos devem formar um ângulo de 90 graus. Ajusta a altura da cadeira se for preciso.",
          "**Pulsos Flutuantes:** Evita poisar os pulsos na secretária ou no teclado. Devem \"flutuar\" ligeiramente acima das teclas. Isto previne lesões e dá-te mais agilidade.",
          "**Olhos no Prémio:** O topo do teu ecrã deve estar ao nível dos teus olhos, a uma distância de um braço esticado."
        ]
      },
      {
        id: 'homerow',
        title: "2. A 'Home Row' é a Tua Casa 🏠",
        icon: <Keyboard size={20} className="text-blue-400" />,
        text: `A "home row" (ou linha de base) é a fila de teclas onde os teus dedos devem descansar. É o teu ponto de partida e de regresso para cada palavra.`,
        points: [
          "**Mão Esquerda:** O teu dedo mindinho vai para o **A**, o anelar para o **S**, o médio para o **D** e o indicador para o **F**.",
          "**Mão Direita:** O teu indicador vai para o **J**, o médio para o **K**, o anelar para o **L** e o mindinho para o **Ç**.",
          "**Polegares:** Ambos os polegares pairam sobre a barra de espaços.",
          "**Sente as Marcas:** Repara que as teclas **F** e **J** têm um pequeno relevo. São os teus guias! Usa-os para encontrares a posição correta sem teres de olhar para o teclado. Fecha os olhos e tenta encontrá-los. É o teu novo superpoder."
        ]
      }
    ]
  },
  {
    id: 'group2',
    title: 'Grupo 2: A Técnica (Mãos à Obra!)',
    icon: <Target size={24} className="text-green-500" />,
    sections: [
      {
        id: 'fingers',
        title: '3. Usa os 10 Dedos, Sem Desculpas! 👇',
        icon: <Hand size={20} className="text-green-400" />,
        text: `Catar milho com dois ou três dedos é coisa do passado. O objetivo é o "touch typing": escrever usando todos os dedos e sem olhar para o teclado. Cada dedo é responsável por um conjunto de teclas.`,
        points: [
          "**O Mapa dos Dedos:** O teu dedo indicador esquerdo trata do F, G, R, T, V, B, 4, 5. O indicador direito do J, H, U, Y, M, N, 6, 7. E assim por diante.",
          "**Confia no Processo:** No início, vais sentir-te mais lento do que uma procissão em Trás-os-Montes. É NORMAL! Resiste à tentação de voltar aos teus velhos (e maus) hábitos. Acredita, a recompensa é gigante."
        ]
      },
      {
        id: 'rhythm',
        title: '4. Ritmo é o Segredo, Não a Força Bruta 🎹',
        icon: <Wind size={20} className="text-green-400" />,
        text: `Tenta manter um ritmo constante ao escrever, em vez de acelerares nas palavras fáceis e depois emperrares nas difíceis. Pensa num baterista a manter o tempo. Tapa-tapa-tapa-tapa.`,
        points: [
          "**Cadência é Tudo:** Um fluxo de escrita ritmado é mais rápido e com menos erros do que picos de velocidade seguidos de paragens bruscas para corrigir.",
          "**Ouve o Som:** Ouve o som das tuas teclas. Deveria ser um som constante e rítmico, não uma confusão de cliques apressados."
        ]
      },
      {
        id: 'precision',
        title: '5. Primeiro a Pontaria, Depois a Velocidade 🎯',
        icon: <Target size={20} className="text-green-400" />,
        text: `Este é talvez o conselho mais importante. De que serve escrever a 100 palavras por minuto se metade delas estão erradas?`,
        points: [
          "**Foca-te na Precisão:** No início, esquece a velocidade. O teu único objetivo deve ser pressionar a tecla certa, com o dedo certo, sempre. A velocidade virá naturalmente com a prática e a memória muscular.",
          "**Não Tenhas Pressa em Corrigir:** Quando cometeres um erro, respira fundo, usa o backspace com o dedo mindinho direito e corrige com calma. Analisa porque erraste. Foi o dedo errado? Foi o ritmo? Aprende com cada erro."
        ]
      }
    ]
  },
  {
    id: 'group3',
    title: 'Grupo 3: O Treino e as Ferramentas (Faz-te ao Bife!)',
    icon: <Zap size={24} className="text-orange-500" />,
    sections: [
        {
            id: 'practice',
            title: '6. Pratica, Pratica e... Adivinhaste, Pratica! 🏋️',
            icon: <Keyboard size={20} className="text-orange-400" />,
            text: `A memória muscular é a tua melhor amiga. E ela só se desenvolve com repetição.`,
            points: [
                "**Consistência > Intensidade:** É muito melhor praticar 15-20 minutos todos os dias do que 3 horas ao sábado. Cria o hábito. Podes fazê-lo enquanto o computador arranca ou enquanto esperas por um sistema.",
                "**Usa os Nossos Módulos:** A secção \"Praticar\" do \"Tecla Certa\" foi desenhada exatamente para isto. Começa com os exercícios de letras, passa para as palavras e, quando te sentires com alma, atira-te aos textos completos."
            ]
        },
        {
            id: 'shortcuts',
            title: '7. Os Atalhos São os Teus Melhores Amigos ⚡',
            icon: <Zap size={20} className="text-orange-400" />,
            text: `No apoio ao cliente, cada segundo conta. Dominar os atalhos de teclado é como ter um teletransporte para a eficiência.`,
            points: [
                "**Os Essenciais:** `Ctrl + C` (Copiar), `Ctrl + V` (Colar), `Ctrl + X` (Cortar), `Ctrl + Z` (Anular), `Ctrl + F` (Procurar).",
                "**O Pro-Tip:** `Ctrl + Backspace` apaga a palavra inteira anterior. Muda a vida! `Ctrl + Setas` move o cursor palavra a palavra.",
                "**No CRM:** Aprende os atalhos específicos do vosso software de gestão de clientes. Vais poupar um tempo precioso."
            ]
        }
    ]
  },
  {
    id: 'group4',
    title: 'Grupo 4: A Mentalidade de Campeão (O Toque Final)',
    icon: <Award size={24} className="text-purple-500" />,
    sections: [
        {
            id: 'mindset',
            title: '8. Sê Simpático para Ti Mesmo e Celebra as Vitórias 🧘',
            icon: <Trophy size={20} className="text-purple-400" />,
            text: `Vais ter dias frustrantes. Vais sentir que não estás a evoluir. Respira.`,
            points: [
                "**Progresso, Não Perfeição:** O objetivo não é seres perfeito da noite para o dia. O objetivo é seres um bocadinho melhor hoje do que eras ontem.",
                "**Festeja:** Conseguiste escrever uma frase inteira sem olhar? BOA! Bateste o teu recorde de velocidade? FANTÁSTICO! Reconhece e celebra estas pequenas conquistas."
            ]
        },
        {
            id: 'trust',
            title: '9. Confia nos Teus Dedos: Olha para o Ecrã! 👀',
            icon: <Monitor size={20} className="text-purple-400" />,
            text: `O passo final para a liberdade é quebrar a dependência de olhar para o teclado.`,
            points: [
                "**Força o Hábito:** Se necessário, no início, cobre o teclado com um pano ou usa post-its para tapar as letras. Vai custar, mas é o empurrão que precisas para que o teu cérebro confie na memória muscular dos teus dedos.",
                "**O Prémio:** Ao olhares apenas para o ecrã, vês os erros assim que acontecem, permitindo-te corrigi-los de imediato, e manténs o foco total na conversa com o cliente."
            ]
        }
    ]
  }
];

const factsContent: Item[] = [
    {
        id: 'group1',
        title: 'Grupo 1: A Grande Marosca do QWERTY',
        icon: <History size={24} className="text-amber-600" />,
        sections: [
            {
                id: 'qwerty-origin',
                title: '1. Nascido para ser Lento: A Origem Inesperada do QWERTY 🐌',
                icon: <Keyboard size={20} className="text-amber-500" />,
                text: `Ao contrário do que possas pensar, o layout **QWERTY** não foi desenhado para ser o mais rápido ou ergonómico. Foi desenhado para ser... lento. Sim, leste bem!

Nos anos 1870, as primeiras máquinas de escrever mecânicas tinham um problema grave: se um dactilógrafo escrevesse demasiado depressa, as hastes metálicas com as letras colidiam e encravavam umas nas outras. Era uma chatice monumental.

Então, um inventor chamado **Christopher Latham Sholes** teve uma ideia "genial": vamos redesenhar o teclado para separar os pares de letras mais comuns em inglês (como "th", "he", "er"). Ao forçar os dedos do dactilógrafo a viajar mais pelo teclado, ele abrandava a escrita o suficiente para evitar que a máquina encravasse.

O QWERTY é, literalmente, um produto de uma limitação mecânica que já não existe há quase um século. Ficou como padrão porque foi o primeiro a ser massificado, e nunca mais ninguém teve vontade de mudar. Incrível, não é?`
            },
            {
                id: 'qwerty-cousins',
                title: '2. Os Primos do QWERTY: AZERTY, QWERTZ e o Rebelde Dvorak',
                icon: <Languages size={20} className="text-amber-500" />,
                text: `* **AZERTY:** Se alguma vez tentares usar um teclado francês ou belga, vais dar de caras com o **AZERTY**. É uma adaptação direta do QWERTY, onde as teclas Q/A e W/Z foram trocadas. O M também foi passear para outra fila. É essencialmente o mesmo princípio, mas com um toque de croissant.
* **QWERTZ:** Usado na Alemanha e Europa Central. A principal diferença é a troca do Y com o Z, porque o Z é muito mais comum em alemão. Simples e... germânico.
* **O Rebelde Dvorak:** Nos anos 30, um senhor chamado August Dvorak disse: "Isto do QWERTY é uma parvoíce!". E criou um teclado super eficiente, o **Dvorak Simplified Keyboard**. Põe as vogais e as consoantes mais usadas na "home row", permitindo escrever milhares de palavras sem mover muito as mãos. É comprovadamente mais rápido e ergonómico. Então porque não o usamos? Porque o QWERTY já era o rei do pedaço e ninguém quis reaprender tudo de novo. O Dvorak é o génio incompreendido da história dos teclados.`
            }
        ]
    },
    {
        id: 'group2',
        title: 'Grupo 2: Como Raios se Escreve em Chinês?!',
        icon: <BookOpen size={24} className="text-red-500" />,
        sections: [
            {
                id: 'pinyin',
                title: 'O Truque do Pinyin: Escrever o Som, Escolher a Imagem 🔊 » 选',
                icon: <Monitor size={20} className="text-red-400" />,
                text: `Os teclados na China são, na sua maioria, QWERTY, iguais aos nossos. O segredo é um sistema chamado **IME (Input Method Editor)**. O mais popular é o **Pinyin**.

Funciona assim:
1.  **Escreves o Som:** O utilizador escreve foneticamente a palavra chinesa usando o nosso alfabeto. Por exemplo, para escrever "olá" (你好), ele escreve no teclado "nihao".
2.  **Aparece um Menu:** Assim que ele escreve "nihao", uma pequena janela flutuante aparece no ecrã com uma lista de todos os caracteres ou combinações de caracteres que têm esse som.
3.  **Selecionas o Carácter Certo:** A primeira opção é, geralmente, a mais comum (你好). O utilizador pode simplesmente carregar na barra de espaços ou na tecla '1' para a selecionar, e o "nihao" é substituído pelos caracteres chineses. Se quisesse outro carácter com o mesmo som, escolheria o número correspondente na lista.

Os IMEs modernos são super inteligentes e usam inteligência artificial para prever a palavra seguinte, tornando o processo incrivelmente rápido e fluido. É um sistema brilhante que resolve um problema que parece impossível.`
            }
        ]
    },
    {
        id: 'group3',
        title: 'Grupo 3: Pérolas da Dactilografia para Mandares o Bitaite',
        icon: <Coffee size={24} className="text-teal-500" />,
        sections: [
            {
                id: 'pearls',
                title: 'Factos Rápidos',
                icon: <Zap size={20} className="text-teal-400" />,
                text: `* **Artista de uma Fila Só:** A palavra "typewriter" (máquina de escrever) pode ser escrita usando apenas as letras da fila de cima do teclado QWERTY. Experimenta!
* **Mão Esquerda ao Poder:** "Stewardesses" (hospedeiras de bordo) é uma das palavras mais longas que se pode escrever usando apenas a mão esquerda na posição correta do "touch typing".
* **O Recorde Mundial:** O Guinness World Records reconhece Barbara Blackburn como a dactilógrafa mais rápida do mundo em língua inglesa. Em 2005, ela atingiu uma velocidade máxima de **212 palavras por minuto** usando um teclado Dvorak. É mais rápido do que a maioria das pessoas fala!
* **O Poder do SHIFT:** A tecla SHIFT foi uma revolução. Nas primeiras máquinas, só havia letras maiúsculas. A tecla SHIFT permitiu que cada haste metálica tivesse dois caracteres (ex: 'a' e 'A'), duplicando a capacidade do teclado sem adicionar mais teclas. Chamava-se "shift" porque literalmente fazia uma "mudança" (shift) mecânica no cesto das hastes.`
            }
        ]
    }
];


type AccordionItemProps = {
  item: Item;
  isOpen: boolean;
  onToggle: () => void;
};

const AccordionItem: React.FC<AccordionItemProps> = ({ item, isOpen, onToggle }) => (
  <div className="border-b border-gray-200">
    <button
      onClick={onToggle}
      className="w-full flex justify-between items-center p-5 text-left font-semibold text-lg text-gray-800 hover:bg-gray-50 focus:outline-none"
    >
      <span className="flex items-center gap-4">
        {item.icon}
        {item.title}
      </span>
      <ChevronDown
        className={`transform transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`}
      />
    </button>
    <div
      className={`overflow-hidden transition-all duration-500 ease-in-out ${isOpen ? 'max-h-[2000px]' : 'max-h-0'}`}
    >
      <div className="p-5 pt-0 space-y-6">
        {item.sections.map(section => (
          <div key={section.id} className="p-4 bg-gray-50 rounded-lg shadow-sm border border-gray-100">
            <h4 className="flex items-center gap-3 font-bold text-md text-gray-700 mb-3">
              {section.icon}
              {section.title}
            </h4>
            {section.text && <div className="text-gray-600 mb-3 prose prose-sm max-w-none" dangerouslySetInnerHTML={{ __html: section.text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>').replace(/\n/g, '<br />') }} />}
            {section.points && <ul className="space-y-2">
              {section.points.map((point, index) => (
                <li key={index} className="flex items-start gap-2 text-gray-600">
                  <span className="text-blue-500 mt-1">◆</span>
                  <span dangerouslySetInnerHTML={{ __html: point.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') }} />
                </li>
              ))}
            </ul>}
          </div>
        ))}
      </div>
    </div>
  </div>
);

type ContentDisplayProps = {
  content: Item[];
};

const ContentDisplay: React.FC<ContentDisplayProps> = ({ content }) => {
    const [openId, setOpenId] = useState<string | null>(content[0]?.id ?? null);
    return (
        <div className="max-w-4xl mx-auto bg-white rounded-xl shadow-lg overflow-hidden">
            {content.map(item => (
                <AccordionItem
                key={item.id}
                item={item}
                isOpen={openId === item.id}
                onToggle={() => setOpenId(openId === item.id ? null : item.id)}
                />
            ))}
        </div>
    )
}

export default function LearnPage() {
  const [activeTab, setActiveTab] = useState('tips');

  return (
    <div className="bg-white min-h-screen">
      <div className="container mx-auto px-4 py-12">
        <div className="text-center mb-12">
          <h1 className="text-5xl font-extrabold text-gray-800 mb-3">Aprende a Escrever Melhor</h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            {activeTab === 'tips' 
                ? "O teu guia para dominares o teclado e seres mais rápido. 🚀"
                : "Cultura de Teclado: Desvenda os Segredos Por Trás das Teclas! 🧐"
            }
          </p>
        </div>

        <div className="flex justify-center gap-4 mb-10">
            <button 
                className={`btn btn-lg ${activeTab === 'tips' ? 'btn-primary' : 'btn-outline btn-primary'}`} 
                onClick={() => setActiveTab('tips')}>
                Dicas para Escrever Rápido
            </button> 
            <button 
                className={`btn btn-lg ${activeTab === 'facts' ? 'btn-primary' : 'btn-outline btn-primary'}`} 
                onClick={() => setActiveTab('facts')}>
                Factos Interessantes
            </button>
        </div>

        {activeTab === 'tips' && <ContentDisplay content={tipsContent} />}
        {activeTab === 'facts' && <ContentDisplay content={factsContent} />}

        <div className="text-center mt-12">
            <p className="text-lg text-gray-700">Agora, chega de conversa. Está na hora de aquecer esses dedos e mostrar quem manda neste teclado.</p>
            <p className="text-lg text-gray-700 font-semibold">Toca a praticar! Vemo-nos no ranking! 😉</p>
        </div>
      </div>
    </div>
  );
}
