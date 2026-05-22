import { useState, useRef, useEffect } from "react";
import { Outlet, Link } from "react-router";
import { PawPrint, Settings, LogOut, User, Bell, HelpCircle, Shield, ChevronDown } from "lucide-react";

export function Layout() {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <div className="min-h-screen bg-slate-50">
      <nav className="bg-white border-b border-slate-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">

            {/* Logo */}
            <Link to="/" className="flex items-center gap-2.5 group">
              <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center shadow-sm group-hover:bg-blue-700 transition-colors">
                <PawPrint className="h-5 w-5 text-white" />
              </div>
              <span className="text-lg font-bold text-slate-900 tracking-tight">
                PI!<span className="text-blue-600">Pet</span>
              </span>
            </Link>

            {/* Profile area */}
            <div className="relative" ref={menuRef}>
              <button
                onClick={() => setMenuOpen((o) => !o)}
                className="flex items-center gap-2.5 px-2 py-1.5 rounded-lg hover:bg-slate-100 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1"
              >
                {/* Avatar */}
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center text-white text-sm font-semibold shadow-sm select-none">
                  J
                </div>
                <div className="hidden sm:block text-left">
                  <p className="text-sm font-medium text-slate-800 leading-none">João Lemes</p>
                  <p className="text-xs text-slate-400 mt-0.5 leading-none">Gerente</p>
                </div>
                <ChevronDown
                  className={`h-4 w-4 text-slate-400 transition-transform duration-200 ${menuOpen ? "rotate-180" : ""}`}
                />
              </button>

              {/* Dropdown */}
              {menuOpen && (
                <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-lg border border-slate-200 py-1.5 z-50 animate-in">
                  {/* User info header */}
                  <div className="px-4 py-3 border-b border-slate-100">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center text-white text-sm font-semibold shrink-0">
                        A
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-slate-800 truncate">João Lemes</p>
                        <p className="text-xs text-slate-400 truncate">joao.lemes@petcare.com.br</p>
                      </div>
                    </div>
                  </div>

                  {/* Menu items */}
                  <div className="py-1">
                    <MenuItem icon={<User className="h-4 w-4" />} label="Meu Perfil" />
                    <MenuItem icon={<Bell className="h-4 w-4" />} label="Notificações" badge="3" />
                    <MenuItem icon={<Settings className="h-4 w-4" />} label="Configurações" />
                    <MenuItem icon={<Shield className="h-4 w-4" />} label="Privacidade e Segurança" />
                    <MenuItem icon={<HelpCircle className="h-4 w-4" />} label="Ajuda e Suporte" />
                  </div>

                  <div className="border-t border-slate-100 py-1">
                    <MenuItem
                      icon={<LogOut className="h-4 w-4" />}
                      label="Sair"
                      danger
                    />
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Outlet />
      </main>
    </div>
  );
}

// ── helpers ──────────────────────────────────────────────────────────────────

interface MenuItemProps {
  icon: React.ReactNode;
  label: string;
  badge?: string;
  danger?: boolean;
}

function MenuItem({ icon, label, badge, danger }: MenuItemProps) {
  return (
    <button
      className={`w-full flex items-center gap-3 px-4 py-2 text-sm transition-colors text-left ${
        danger
          ? "text-red-600 hover:bg-red-50"
          : "text-slate-700 hover:bg-slate-50"
      }`}
    >
      <span className={danger ? "text-red-500" : "text-slate-400"}>{icon}</span>
      <span className="flex-1">{label}</span>
      {badge && (
        <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-blue-600 text-white text-xs font-medium">
          {badge}
        </span>
      )}
    </button>
  );
}