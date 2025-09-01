import Link from 'next/link';

export default function BubblePopPage() {
  return (
    <div className="container mx-auto px-4 py-8 flex flex-col items-center">
      <h1 className="text-4xl font-bold text-center mb-2">Estoura Bolhas 🫧</h1>
      <h2 className="text-xl text-center text-gray-500 mb-10">Não deixes que te escape nenhuma!</h2>
      <p className="text-center mb-8">Calma, que isto ainda não está pronto. Mas em breve vais poder estourar bolhas como um profissional. Nem que chovam picaretas!</p>
      <Link href="/games">
        <button className="btn btn-secondary">Voltar aos Jogos</button>
      </Link>
    </div>
  );
}
