import { getCurrentUser } from "@/lib/session";
import { redirect } from "next/navigation";

export default async function DashboardPage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-xl p-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-800 mb-2">🏆 Dashboard Tecla Certa</h1>
            <p className="text-gray-600">Goldenergy, Vila Real</p>
          </div>

          <div className="bg-gradient-to-r from-yellow-50 to-yellow-100 rounded-lg p-6 mb-8">
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">
              Bem-vindo, {user.displayName || user.email}! 👋
            </h2>
            <p className="text-gray-700">
              Autenticação realizada com sucesso! O teu sistema de magic links está a funcionar perfeitamente.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-gray-50 rounded-lg p-6">
              <h3 className="font-semibold text-gray-800 mb-3">📊 Informações da Conta</h3>
              <ul className="space-y-2 text-sm">
                <li><strong>ID:</strong> {user.id}</li>
                <li><strong>Email:</strong> {user.email}</li>
                <li><strong>Nome:</strong> {user.displayName || "Não definido"}</li>
              </ul>
            </div>

            <div className="bg-gray-50 rounded-lg p-6">
              <h3 className="font-semibold text-gray-800 mb-3">🚀 Próximos Passos</h3>
              <ul className="space-y-2 text-sm text-gray-700">
                <li>• Explorar jogos de dactilografia</li>
                <li>• Participar em competições</li>
                <li>• Ver o leaderboard</li>
                <li>• Melhorar as tuas estatísticas</li>
              </ul>
            </div>
          </div>

          <div className="mt-8 text-center">
            <p className="text-gray-600 mb-4">
              Sistema de autenticação custom implementado com sucesso! 🎉
            </p>
            <div className="flex gap-4 justify-center">
              <a href="/training" className="btn btn-primary">
                Começar Treino
              </a>
              <a href="/games" className="btn btn-secondary">
                Ver Jogos
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
