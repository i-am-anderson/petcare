import { useState } from "react";
import { useNavigate } from "react-router";
import { PawPrint, Eye, EyeOff, LogIn, Lock, User } from "lucide-react";

export function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("joao.lemes@petcare.com.br");
  const [password, setPassword] = useState("petcare2026");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => navigate("/"), 900);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4">

      {/* Subtle background decoration */}
      <div
        aria-hidden
        className="pointer-events-none fixed inset-0 overflow-hidden"
      >
        <div className="absolute -top-32 -right-32 w-[500px] h-[500px] rounded-full bg-blue-100 opacity-40 blur-3xl" />
        <div className="absolute -bottom-40 -left-20 w-[400px] h-[400px] rounded-full bg-slate-200 opacity-60 blur-3xl" />
      </div>

      <div className="relative w-full max-w-sm">

        {/* Card */}
        <div className="bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden">

          {/* Header strip */}
          <div className="bg-blue-600 px-8 py-7 flex flex-col items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center shadow-inner">
              <PawPrint className="h-6 w-6 text-white" />
            </div>
            <div className="text-center">
              <h1 className="text-xl font-bold text-white tracking-tight">
                PI!<span className="text-blue-200">Pet</span>
              </h1>
              <p className="text-blue-200 text-xs mt-0.5 font-medium tracking-wide uppercase">
                Sistema Interno
              </p>
            </div>
          </div>

          {/* Form */}
          <div className="px-8 py-8">
            <p className="text-slate-500 text-sm text-center mb-7">
              Acesso restrito a colaboradores.
            </p>

            <form onSubmit={handleSubmit} className="space-y-4">

              {/* Email */}
              <div>
                <label
                  htmlFor="email"
                  className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5"
                >
                  Usuário
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <input
                    id="email"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-9 pr-4 py-2.5 border border-slate-200 rounded-lg text-sm text-slate-800 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <label
                  htmlFor="password"
                  className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5"
                >
                  Senha
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-9 pr-10 py-2.5 border border-slate-200 rounded-lg text-sm text-slate-800 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                    tabIndex={-1}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              {/* Forgot password */}
              <div className="flex justify-end">
                <button
                  type="button"
                  className="text-xs text-blue-600 hover:text-blue-800 transition-colors"
                >
                  Esqueceu sua senha?
                </button>
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 py-2.5 px-4 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white text-sm font-semibold rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 mt-2"
              >
                {loading ? (
                  <>
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Entrando…
                  </>
                ) : (
                  <>
                    <LogIn className="h-4 w-4" />
                    Entrar
                  </>
                )}
              </button>
            </form>
          </div>
        </div>

        {/* Footer note */}
        <p className="text-center text-xs text-slate-400 mt-5">
          Problemas de acesso? Fale com o{" "}
          <button className="text-blue-500 hover:underline">suporte interno</button>.
        </p>
      </div>
    </div>
  );
}