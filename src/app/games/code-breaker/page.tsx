import Link from 'next/link';

export default function CodeBreakerPage() {
  return (
    <div className="container mx-auto px-4 py-8 flex flex-col items-center">
      <h1 className="text-4xl font-bold text-center mb-2">Quebra-Código 💻</h1>
      <h2 className="text-xl text-center text-gray-500 mb-10">Mostra o que vales a decifrar estes enigmas!</h2>
      <p className="text-center mb-8">Ainda estamos a criar os códigos mais complexos. Prepara-te para um desafio à altura. Isto vai ser de abalar o capacete!</p>
      <Link href="/games">
        <button className="btn btn-info">Voltar aos Jogos</button>
      </Link>
    </div>
  );
}
