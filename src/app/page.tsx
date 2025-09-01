import Link from "next/link";
import { getCurrentUser } from "@/lib/session";

export default async function Home() {
  const user = await getCurrentUser();

  return (
    <div className="w-full">
      {/* Hero */}
      <section className="gradient-hero relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 py-24 md:py-32 flex flex-col items-start gap-8">
          <div className="space-y-6 max-w-3xl">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight leading-[1.05] bg-clip-text text-transparent bg-gradient-to-br from-primary via-neutral to-accent">
              A Energia na Ponta dos Teus Dedos.
            </h1>
            <h2 className="text-lg md:text-xl lg:text-2xl font-medium text-neutral/80">
              Transforma cada clique numa vitória. Bem-vindo ao <span className="font-semibold text-primary">Tecla Certa</span>, a plataforma que vai turbinar a tua performance no apoio ao cliente.
            </h2>
          </div>
          {!user ? (
            <Link href="/login" className="btn btn-primary btn-lg shadow-lg shadow-primary/25 hover:shadow-primary/40 transition-all">
              Entrar e Começar o Treino!
            </Link>
          ) : (
            <div className="flex flex-col gap-4">
              <p className="text-lg">
                Olá, <span className="font-semibold text-primary">{user.displayName || user.email}</span>! 👋
              </p>
              <Link href="/dashboard" className="btn btn-secondary btn-lg">
                Ir para o Dashboard
              </Link>
            </div>
          )}
        </div>
      </section>

      {/* Funcionalidades */}
      <section id="funcionalidades" className="max-w-7xl mx-auto px-4 py-20 md:py-28">
        <div className="grid md:grid-cols-2 gap-12 items-start">
          <div className="prose-custom space-y-6">
            <h2 className="text-3xl md:text-4xl font-bold">Mais Rápido que o Corgo a chegar ao Douro!</h2>
            <p className="text-base md:text-lg text-neutral/80">Na Goldenergy, a eficiência é a nossa energia. O <strong>Tecla Certa</strong> foi criado para te ajudar a comunicar de forma mais rápida e precisa, melhorando a experiência dos nossos clientes e o teu dia a dia. Prepara-te para desbloquear o teu potencial máximo.</p>
            <ul className="space-y-4">
              <li className="flex gap-4 items-start p-4 rounded-box bg-base-100 shadow-sm border border-base-300/60">
                <span className="text-2xl">⚡️</span>
                <div>
                  <p className="font-semibold">Treino Contínuo</p>
                  <p className="text-neutral/70 text-sm md:text-base">Acede a dezenas de exercícios de transcrição e cópia para aperfeiçoares a tua técnica.</p>
                </div>
              </li>
              <li className="flex gap-4 items-start p-4 rounded-box bg-base-100 shadow-sm border border-base-300/60">
                <span className="text-2xl">🎮</span>
                <div>
                  <p className="font-semibold">Jogos Desafiantes</p>
                  <p className="text-neutral/70 text-sm md:text-base">Aprender não tem de ser aborrecido. Aumenta a tua velocidade e precisão com jogos divertidos.</p>
                </div>
              </li>
              <li className="flex gap-4 items-start p-4 rounded-box bg-base-100 shadow-sm border border-base-300/60">
                <span className="text-2xl">🏆</span>
                <div>
                  <p className="font-semibold">Competição Saudável</p>
                  <p className="text-neutral/70 text-sm md:text-base">Participa nas competições internas, mede a tua performance e sobe no ranking da empresa.</p>
                </div>
              </li>
            </ul>
          </div>
          <div className="relative">
            <div className="absolute -inset-4 -z-10 bg-gradient-to-br from-secondary/30 via-primary/10 to-accent/20 blur-2xl rounded-full opacity-70" />
            <div className="mockup-window border border-base-300 bg-base-100 shadow-xl">
              <div className="p-8 space-y-4 text-sm md:text-base">
                <p className="font-semibold text-primary">Painel de Progresso (Exemplo)</p>
                <div className="space-y-3">
                  <div>
                    <div className="flex justify-between text-xs mb-1"><span>Velocidade</span><span>78 PPM</span></div>
                    <progress className="progress progress-primary w-full" value={78} max={120}></progress>
                  </div>
                  <div>
                    <div className="flex justify-between text-xs mb-1"><span>Precisão</span><span>93%</span></div>
                    <progress className="progress progress-secondary w-full" value={93} max={100}></progress>
                  </div>
                  <div>
                    <div className="flex justify-between text-xs mb-1"><span>Nível</span><span>3/10</span></div>
                    <progress className="progress progress-accent w-full" value={30} max={100}></progress>
                  </div>
                </div>
                <div className="divider my-4">Próximo Objetivo</div>
                <p className="text-neutral/70 leading-relaxed">Completa mais 2 sessões de treino hoje para desbloqueares o modo Competição semanal.</p>
                <button className="btn btn-primary w-full">Ir Treinar</button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Curiosidade */}
      <section id="sobre" className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-secondary/10 to-transparent" />
        <div className="max-w-5xl mx-auto px-4 py-24 relative">
          <div className="space-y-6">
            <h2 className="text-3xl md:text-4xl font-bold">Curiosidade a 200 WPM!</h2>
            <div className="space-y-4 text-neutral/80 text-base md:text-lg">
              <p>Já pensaste na velocidade das tuas mãos?</p>
              <p>Um bom dactilógrafo atinge facilmente as 80 palavras por minuto (PPM). Os profissionais chegam às 120 PPM. O recorde mundial está acima das 200 PPM!</p>
              <p>Em Vila Real, estamos habituados à velocidade do nosso famoso Circuito Internacional. Acreditas que a distância que os dedos de um dactilógrafo profissional percorrem no teclado durante uma hora de escrita intensiva <strong>equivale a dar quase duas voltas completas ao Circuito de Vila Real</strong>?</p>
              <p>É a prova de que em Trás-os-Montes, a energia e a velocidade estão no nosso ADN, seja na pista ou no teclado!</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
