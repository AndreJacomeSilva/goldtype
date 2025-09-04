"use client";
import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { isAllowedDomain, allowedDomains } from "@/lib/auth";

function LoginForm() {
  const [step, setStep] = useState<"email" | "code">("email");
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [needsDisplayName, setNeedsDisplayName] = useState(false);
  const [needsDepartment, setNeedsDepartment] = useState(false);
  const [department, setDepartment] = useState("Outro");
  const departments = [
    "After Sales","Billing","Comercial B2B","Comercial B2C","Continuous Improvement","Controlling, Reporting & Data Analysis","Customer Service","Customer Success","Cut-off & Debt Management","Energy Management","F2F","HR","IT","Legal","Marketing","New Energy","Operations","Partnerships","Retail","Switch","Tax, Accounting & Treasury","Telemarketing","Winback","Outro"
  ];
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  
  const router = useRouter();
  const searchParams = useSearchParams();

  async function requestCode(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim()) return;
    const normalizedEmail = email.trim().toLowerCase();
    if (!isAllowedDomain(normalizedEmail)) {
      setMessage(`Acesso restrito a emails corporativos aprovados: ${allowedDomains.join(", ")}.`);
      return;
    }
    
    setLoading(true);
    setMessage("");
    
    try {
      const res = await fetch("/api/auth/request", {
        method: "POST",
        body: JSON.stringify({ email: normalizedEmail }),
        headers: { "Content-Type": "application/json" }
      });
      
      const data = await res.json();
      
      if (res.ok) {
        setNeedsDisplayName(!!data.needsDisplayName);
        setNeedsDepartment(!!data.needsDepartment);
        if (data.throttled) {
          setMessage("Código enviado recentemente. Aguarda um minuto antes de solicitar outro.");
        } else {
          setMessage("Código enviado para o teu email!");
          setStep("code");
        }
      } else {
        setMessage(data.error || "Erro ao enviar código");
      }
    } catch {
      setMessage("Erro de conexão. Tenta novamente.");
    } finally {
      setLoading(false);
    }
  }

  async function verify(e: React.FormEvent) {
    e.preventDefault();
    if (!code.trim()) return;
    const normalizedEmail = email.trim().toLowerCase();
    if (!isAllowedDomain(normalizedEmail)) {
      setMessage(`Acesso restrito a emails corporativos aprovados: ${allowedDomains.join(", ")}.`);
      return;
    }
    
    setLoading(true);
    setMessage("");
    
    try {
      const res = await fetch("/api/auth/verify", {
        method: "POST",
        body: JSON.stringify({ 
          email: normalizedEmail, 
          code: code.trim(), 
          ...(needsDisplayName && displayName.trim() ? { displayName: displayName.trim() } : {}),
          ...(needsDepartment && department ? { department } : {}),
        }),
        headers: { "Content-Type": "application/json" },
        credentials: 'include'
      });
      
      const data = await res.json();
      
      if (res.ok) {
        setMessage("Login realizado com sucesso!");
  try { localStorage.setItem('auth:event', `${Date.now()}:login`); } catch {}
  try { window.dispatchEvent(new Event('auth:changed')); } catch {}
        setTimeout(() => router.push("/"), 500);
      } else {
        setMessage(data.error || "Código inválido");
      }
    } catch {
      setMessage("Erro de conexão. Tenta novamente.");
    } finally {
      setLoading(false);
    }
  }

  // se chega por link mágico (?email=&t=)
  useEffect(() => {
    const emailParam = searchParams.get("email");
    const tokenParam = searchParams.get("t");
    
    if (emailParam && tokenParam) {
      setLoading(true);
      fetch("/api/auth/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: emailParam, token: tokenParam }),
        credentials: 'include'
      })
        .then(res => res.json())
        .then(data => {
          if (data.ok) {
            setMessage("Login automático realizado com sucesso!");
            try { localStorage.setItem('auth:event', `${Date.now()}:login`); } catch {}
            try { window.dispatchEvent(new Event('auth:changed')); } catch {}
            setTimeout(() => router.push("/"), 500);
          } else {
            setMessage("Link inválido ou expirado");
            setEmail(emailParam);
          }
        })
        .catch(() => {
          setMessage("Erro ao processar link mágico");
          setEmail(emailParam);
        })
        .finally(() => setLoading(false));
    }
  }, [searchParams, router]);

  return (
    <main className="min-h-screen bg-gradient-to-br from-yellow-50 to-yellow-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl p-8 w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">🏆 Tecla Certa</h1>
          <p className="text-gray-600">Goldenergy, Vila Real</p>
        </div>

        {step === "email" && (
          <form onSubmit={requestCode} className="space-y-6">
            <div>
              <h2 className="text-2xl font-semibold text-gray-800 mb-6">Entrar</h2>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                Email
              </label>
              <input
                id="email"
                required
                type="email"
                placeholder="o.teu@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                disabled={loading}
              />
            </div>
            
            <button
              type="submit"
              disabled={loading || !email.trim()}
              className="w-full bg-yellow-500 hover:bg-yellow-600 text-white font-semibold py-3 px-4 rounded-lg transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "A enviar..." : "Enviar código"}
            </button>
          </form>
        )}

        {step === "code" && (
          <form onSubmit={verify} className="space-y-6">
            <div>
              <h2 className="text-2xl font-semibold text-gray-800 mb-2">Insere o código</h2>
              <p className="text-gray-600 mb-6">Enviámos um código para {email}</p>
              
              <label htmlFor="code" className="block text-sm font-medium text-gray-700 mb-2">
                Código de 6 dígitos
              </label>
              <input
                id="code"
                required
                placeholder="000000"
                value={code}
                onChange={(e) => setCode(e.target.value.replace(/\D/g, '').substring(0, 6))}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent text-center text-2xl tracking-widest font-mono"
                disabled={loading}
                maxLength={6}
              />
            </div>
            
            {(needsDisplayName || needsDepartment) && (
              <>
                {needsDisplayName && (
                  <div>
                    <label htmlFor="displayName" className="block text-sm font-medium text-gray-700 mb-2">
                      Como te chamamos? (opcional)
                    </label>
                    <input
                      id="displayName"
                      placeholder="O teu nome"
                      value={displayName}
                      onChange={(e) => setDisplayName(e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                      disabled={loading}
                    />
                  </div>
                )}
                {needsDepartment && (
                  <div>
                    <label htmlFor="department" className="block text-sm font-medium text-gray-700 mb-2">
                      Departamento (opcional)
                    </label>
                    <select
                      id="department"
                      value={department}
                      onChange={(e) => setDepartment(e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                      disabled={loading}
                    >
                      {departments.map((d) => (
                        <option key={d} value={d}>{d}</option>
                      ))}
                    </select>
                  </div>
                )}
              </>
            )}
            
            <button
              type="submit"
              disabled={loading || !code.trim()}
              className="w-full bg-yellow-500 hover:bg-yellow-600 text-white font-semibold py-3 px-4 rounded-lg transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "A verificar..." : "Confirmar"}
            </button>
            
            <button
              type="button"
              onClick={() => setStep("email")}
              className="w-full text-gray-600 hover:text-gray-800 py-2 transition duration-200"
              disabled={loading}
            >
              ← Voltar ao email
            </button>
          </form>
        )}

        {message && (
          <div className={`mt-6 p-4 rounded-lg text-center ${
            message.includes("sucesso") || message.includes("enviado")
              ? "bg-green-100 text-green-800"
              : "bg-red-100 text-red-800"
          }`}>
            {message}
          </div>
        )}
      </div>
    </main>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <main className="min-h-screen bg-gradient-to-br from-yellow-50 to-yellow-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-xl p-8 w-full max-w-md">
          <div className="text-center">
            <div className="loading loading-spinner loading-lg text-yellow-500 mb-4"></div>
            <p className="text-gray-600">A carregar...</p>
          </div>
        </div>
      </main>
    }>
      <LoginForm />
    </Suspense>
  );
}
