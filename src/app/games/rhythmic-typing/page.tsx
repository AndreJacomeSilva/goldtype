import Link from 'next/link';

export default function RhythmicTypingPage() {
  return (
    <div className="container mx-auto px-4 py-8 flex flex-col items-center">
      <h1 className="text-4xl font-bold text-center mb-2">Dactilografia Rítmica 🎵</h1>
      <h2 className="text-xl text-center text-gray-500 mb-10">Apanha o ritmo e não percas o compasso!</h2>
      <p className="text-center mb-8">Este jogo está quase no ponto. Falta só afinar a viola. Em breve, vais dar um show de digitação. É para malhar!</p>
      <Link href="/games">
        <button className="btn btn-accent">Voltar aos Jogos</button>
      </Link>
    </div>
  );
}
