import Link from 'next/link';

export default function StoryModePage() {
  return (
    <div className="container mx-auto px-4 py-8 flex flex-col items-center">
      <h1 className="text-4xl font-bold text-center mb-2">Modo História 📖</h1>
      <h2 className="text-xl text-center text-gray-500 mb-10">Embarca nesta aventura e escreve o teu próprio final!</h2>
      <p className="text-center mb-8">A história está a ser escrita. Em breve, vais poder mergulhar num mundo de palavras e fantasia. Vai ser uma jornada e pêras!</p>
      <Link href="/games">
        <button className="btn btn-success">Voltar aos Jogos</button>
      </Link>
    </div>
  );
}
