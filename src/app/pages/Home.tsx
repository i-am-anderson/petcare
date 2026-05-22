import { Link } from "react-router";
import { 
  Users, PawPrint, UserCog, Calendar, FileText, Plus, 
  Search, ClipboardList, LogIn, LogOut, Wallet, History 
} from "lucide-react";

export function Home() {
  return (
    <div className="p-6 space-y-12">
      {/* HEADER */}
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Sistema de Gestão PI!Pet</h1>
        <p className="text-slate-600 mt-2">Painel de controle e operações</p>
      </div>

      {/* SEÇÃO DE REGISTROS E OPERAÇÕES */}
      <section>
        <div className="flex items-center gap-2 mb-6 border-b pb-2">
          <Plus className="h-5 w-5 text-blue-600" />
          <h2 className="text-xl font-semibold text-slate-800">Registros e Operações</h2>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <HomeCard to="/clientes/cadastro" icon={Users} color="bg-blue-100" textColor="text-blue-600" title="Novo Cliente" description="Cadastrar tutor" />
          <HomeCard to="/pets/cadastro" icon={PawPrint} color="bg-green-100" textColor="text-green-600" title="Novo Pet" description="Cadastrar animal" />
          <HomeCard to="/funcionarios/cadastro" icon={UserCog} color="bg-purple-100" textColor="text-purple-600" title="Novo Funcionário" description="Adicionar equipe" />
          <HomeCard to="/checkin" icon={LogIn} color="bg-cyan-100" textColor="text-cyan-600" title="Check-In" description="Entrada de pet" />
          <HomeCard to="/ordem-servico" icon={ClipboardList} color="bg-yellow-100" textColor="text-yellow-700" title="Ordem de Serviço" description="Iniciar serviço" />
          <HomeCard to="/checkout" icon={LogOut} color="bg-rose-100" textColor="text-rose-600" title="Check-Out" description="Saída e pagamento" />
          <HomeCard to="/agendamentos" icon={Calendar} color="bg-orange-100" textColor="text-orange-600" title="Novo Agendamento" description="Reservar horário" />
        </div>
      </section>

      {/* SEÇÃO DE CONSULTAS E RELATÓRIOS */}
      <section>
        <div className="flex items-center gap-2 mb-6 border-b pb-2">
          <Search className="h-5 w-5 text-slate-600" />
          <h2 className="text-xl font-semibold text-slate-800">Consultas e Relatórios</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <HomeCard to="/clientes/consulta" icon={Users} color="bg-slate-100" textColor="text-slate-600" title="Clientes" description="Lista de tutores" isSearch />
          <HomeCard to="/pets/consulta" icon={PawPrint} color="bg-slate-100" textColor="text-slate-600" title="Pets" description="Prontuários" isSearch />
          <HomeCard to="/funcionarios/consulta" icon={UserCog} color="bg-slate-100" textColor="text-slate-600" title="Equipe" description="Lista de funcionários" isSearch />
          <HomeCard to="/historico-pets" icon={History} color="bg-indigo-100" textColor="text-indigo-600" title="Histórico Pets" description="Linha do tempo" />
          <HomeCard to="/financeiro" icon={Wallet} color="bg-emerald-100" textColor="text-emerald-600" title="Financeiro" description="Fluxo de caixa" />
          <HomeCard to="/historico" icon={FileText} color="bg-slate-100" textColor="text-slate-600" title="Relatórios" description="Logs do sistema" />
        </div>
      </section>
    </div>
  );
}

/* Componente Auxiliar para evitar repetição de código */
function HomeCard({ to, icon: Icon, color, textColor, title, description, isSearch = false }) {
  return (
    <Link
      to={to}
      className="bg-white p-4 rounded-xl border border-slate-200 hover:border-blue-300 hover:shadow-md transition-all group"
    >
      <div className="flex items-center gap-4">
        <div className={`p-3 ${color} rounded-lg group-hover:scale-110 transition-transform`}>
          <Icon className={`h-5 w-5 ${textColor}`} />
        </div>
        <div>
          <h3 className="font-semibold text-slate-900 leading-tight">{title}</h3>
          <p className="text-xs text-slate-500 mt-1">{description}</p>
        </div>
      </div>
      <div className="mt-4 flex items-center justify-end text-[10px] font-bold uppercase tracking-wider opacity-0 group-hover:opacity-100 transition-opacity">
        <span className={textColor}>{isSearch ? "Visualizar →" : "Acessar →"}</span>
      </div>
    </Link>
  );
}