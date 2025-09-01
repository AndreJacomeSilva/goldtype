import Link from 'next/link';
import { FaKeyboard, FaTint, FaMusic, FaCode, FaBookOpen } from 'react-icons/fa';

export default function GamesPage() {
  const games = [
    {
      href: '/games/letter-rain',
      icon: <FaKeyboard className="text-5xl text-primary" />,
      title: 'Chuva de Letras 🌧️',
      subtitle: 'Letras e palavras caem do topo do ecrã. Digita-as antes que cheguem ao fundo para ganhar pontos. Ideal para treinar a velocidade de reação.',
    },
    {
      href: '/games/bubble-pop',
      icon: <FaTint className="text-5xl text-secondary" />,
      title: 'Estoura Bolhas 🫧',
      subtitle: 'Bolhas com palavras sobem pelo ecrã. Digita a palavra corretamente para estourar a bolha. Um ótimo exercício para melhorar a precisão.',
    },
    {
      href: '/games/rhythmic-typing',
      icon: <FaMusic className="text-5xl text-accent" />,
      title: 'Dactilografia Rítmica 🎵',
      subtitle: 'Mantém um ritmo de digitação constante, como se estivesses a seguir uma batida musical. Perfeito para desenvolver consistência e fluidez.',
    },
    {
      href: '/games/code-breaker',
      icon: <FaCode className="text-5xl text-info" />,
      title: 'Quebra-Código 💻',
      subtitle: 'Testa a tua precisão digitando sequências complexas de caracteres, incluindo letras, números e símbolos. Essencial para programadores e aspirantes a ninja do teclado!',
    },
    {
      href: '/games/story-mode',
      icon: <FaBookOpen className="text-5xl text-success" />,
      title: 'Modo História 📖',
      subtitle: 'Avança numa narrativa cativante digitando os parágrafos de cada capítulo. A forma mais envolvente de praticar por longos períodos. Estás pronto para a aventura?',
    },
  ];

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold text-center mb-2">Tecla Certa</h1>
      <h2 className="text-xl text-center text-gray-500 mb-10">Passe para o próximo nível no apoio ao cliente.</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {games.map((game) => (
          <Link href={game.href} key={game.href} className="card bg-base-100 shadow-xl hover:shadow-2xl transition-shadow duration-300 ease-in-out transform hover:-translate-y-1">
            <figure className="px-10 pt-10">
              {game.icon}
            </figure>
            <div className="card-body items-center text-center">
              <h2 className="card-title">{game.title}</h2>
              <p>{game.subtitle}</p>
              <div className="card-actions">
                <button className="btn btn-primary mt-4">Jogar Agora!</button>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
