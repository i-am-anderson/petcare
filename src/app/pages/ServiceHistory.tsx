import { useState, useMemo } from "react";
import { useLocalStorage } from "../hooks/useLocalStorage";
import { Appointment } from "../types";
import { Transaction } from "./CheckOut";
import {
  Search, Calendar, User, PawPrint, CheckCircle, XCircle, Clock,
  FileText, TrendingUp, BarChart2, Download, Filter
} from "lucide-react";
import { format, parseISO, startOfMonth, endOfMonth, isWithinInterval, subMonths } from "date-fns";
import { ptBR } from "date-fns/locale";

export function ServiceHistory() {
  const [appointments, setAppointments] = useLocalStorage<Appointment[]>("appointments", []);
  const [transactions] = useLocalStorage<Transaction[]>("transactions", []);

  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [monthOffset, setMonthOffset] = useState(0);

  const targetMonth = subMonths(new Date(), monthOffset);
  const monthStart = startOfMonth(targetMonth);
  const monthEnd = endOfMonth(targetMonth);

  const filteredAppointments = useMemo(() => {
    return appointments
      .filter((apt) => {
        const matchesSearch =
          apt.petName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          apt.clientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          apt.service.toLowerCase().includes(searchTerm.toLowerCase()) ||
          apt.employeeName.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus = statusFilter === "all" || apt.status === statusFilter;
        return matchesSearch && matchesStatus;
      })
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [appointments, searchTerm, statusFilter]);

  const monthAppointments = useMemo(() => {
    return appointments.filter((apt) =>
      isWithinInterval(parseISO(apt.date), { start: monthStart, end: monthEnd })
    );
  }, [appointments, monthOffset]);

  const monthTransactions = useMemo(() => {
    return transactions.filter((t) =>
      isWithinInterval(parseISO(t.createdAt), { start: monthStart, end: monthEnd })
    );
  }, [transactions, monthOffset]);

  const statistics = useMemo(() => {
    const total = appointments.length;
    const scheduled = appointments.filter((a) => a.status === "scheduled").length;
    const completed = appointments.filter((a) => a.status === "completed").length;
    const cancelled = appointments.filter((a) => a.status === "cancelled").length;

    const serviceCount: Record<string, number> = {};
    appointments.forEach((apt) => {
      serviceCount[apt.service] = (serviceCount[apt.service] || 0) + 1;
    });

    const employeeCount: Record<string, number> = {};
    appointments
      .filter((a) => a.status === "completed")
      .forEach((apt) => {
        employeeCount[apt.employeeName] = (employeeCount[apt.employeeName] || 0) + 1;
      });

    return { total, scheduled, completed, cancelled, serviceCount, employeeCount };
  }, [appointments]);

  const monthRevenue = monthTransactions.reduce((s, t) => s + t.amount, 0);
  const monthCompleted = monthAppointments.filter((a) => a.status === "completed").length;
  const monthCancelled = monthAppointments.filter((a) => a.status === "cancelled").length;

  const handleStatusChange = (id: string, newStatus: "scheduled" | "completed" | "cancelled") => {
    setAppointments(
      appointments.map((apt) => (apt.id === id ? { ...apt, status: newStatus } : apt))
    );
  };

  const handleExportCSV = () => {
    const headers = ["Data", "Horário", "Pet", "Cliente", "Serviço", "Funcionário", "Status"];
    const rows = filteredAppointments.map((apt) => [
      format(parseISO(apt.date), "dd/MM/yyyy"),
      apt.time,
      apt.petName,
      apt.clientName,
      apt.service,
      apt.employeeName,
      apt.status === "scheduled" ? "Agendado" : apt.status === "completed" ? "Concluído" : "Cancelado",
    ]);
    const csv = [headers, ...rows].map((row) => row.join(";")).join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `atendimentos_${format(new Date(), "yyyy-MM-dd")}.csv`;
    a.click();
  };

  return (
    <div>
      <div className="mb-6 flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Relatórios</h1>
          <p className="text-slate-600 mt-1">Visualize todos os atendimentos e estatísticas</p>
        </div>
        <button
          onClick={handleExportCSV}
          className="inline-flex items-center gap-2 px-4 py-2 bg-slate-800 text-white rounded-md hover:bg-slate-900 text-sm font-medium"
        >
          <Download className="h-4 w-4" />
          Exportar CSV
        </button>
      </div>

      {/* Overall KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-4">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-blue-100 rounded-lg"><FileText className="h-6 w-6 text-blue-600" /></div>
            <div>
              <p className="text-sm text-slate-600">Total</p>
              <p className="text-2xl font-bold text-slate-900">{statistics.total}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-4">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-orange-100 rounded-lg"><Clock className="h-6 w-6 text-orange-600" /></div>
            <div>
              <p className="text-sm text-slate-600">Agendados</p>
              <p className="text-2xl font-bold text-slate-900">{statistics.scheduled}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-4">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-green-100 rounded-lg"><CheckCircle className="h-6 w-6 text-green-600" /></div>
            <div>
              <p className="text-sm text-slate-600">Concluídos</p>
              <p className="text-2xl font-bold text-slate-900">{statistics.completed}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-4">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-red-100 rounded-lg"><XCircle className="h-6 w-6 text-red-600" /></div>
            <div>
              <p className="text-sm text-slate-600">Cancelados</p>
              <p className="text-2xl font-bold text-slate-900">{statistics.cancelled}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Monthly report */}
      <div className="bg-white rounded-lg shadow-sm border border-slate-200 mb-6 p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-slate-900">
            Resumo Mensal — {format(targetMonth, "MMMM yyyy", { locale: ptBR })}
          </h2>
          <div className="flex gap-2">
            <button
              onClick={() => setMonthOffset((m) => m + 1)}
              className="px-3 py-1.5 text-sm border border-slate-300 rounded-md hover:bg-slate-50"
            >
              ← Anterior
            </button>
            <button
              onClick={() => setMonthOffset((m) => Math.max(0, m - 1))}
              disabled={monthOffset === 0}
              className="px-3 py-1.5 text-sm border border-slate-300 rounded-md hover:bg-slate-50 disabled:opacity-40"
            >
              Próximo →
            </button>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-slate-50 rounded-lg p-4 border border-slate-200">
            <p className="text-xs text-slate-500 uppercase font-medium">Agendamentos</p>
            <p className="text-2xl font-bold text-slate-900 mt-1">{monthAppointments.length}</p>
          </div>
          <div className="bg-green-50 rounded-lg p-4 border border-green-200">
            <p className="text-xs text-green-600 uppercase font-medium">Concluídos</p>
            <p className="text-2xl font-bold text-green-800 mt-1">{monthCompleted}</p>
          </div>
          <div className="bg-red-50 rounded-lg p-4 border border-red-200">
            <p className="text-xs text-red-600 uppercase font-medium">Cancelados</p>
            <p className="text-2xl font-bold text-red-800 mt-1">{monthCancelled}</p>
          </div>
          <div className="bg-emerald-50 rounded-lg p-4 border border-emerald-200">
            <p className="text-xs text-emerald-600 uppercase font-medium">Faturamento</p>
            <p className="text-2xl font-bold text-emerald-800 mt-1">R$ {monthRevenue.toFixed(2)}</p>
          </div>
        </div>
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
          <h2 className="text-lg font-semibold text-slate-900 mb-4">Serviços Mais Solicitados</h2>
          <div className="space-y-3">
            {Object.entries(statistics.serviceCount)
              .sort((a, b) => b[1] - a[1])
              .slice(0, 5)
              .map(([service, count]) => (
                <div key={service} className="flex items-center justify-between">
                  <span className="text-sm text-slate-700">{service}</span>
                  <div className="flex items-center gap-3">
                    <div className="w-32 h-2 bg-slate-200 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-blue-500 rounded-full"
                        style={{ width: `${(count / statistics.total) * 100}%` }}
                      />
                    </div>
                    <span className="text-sm font-semibold text-slate-700 w-6 text-right">{count}</span>
                  </div>
                </div>
              ))}
            {Object.keys(statistics.serviceCount).length === 0 && (
              <p className="text-slate-500 text-sm">Nenhum serviço registrado</p>
            )}
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
          <h2 className="text-lg font-semibold text-slate-900 mb-4">Atendimentos por Funcionário</h2>
          <div className="space-y-3">
            {Object.entries(statistics.employeeCount)
              .sort((a, b) => b[1] - a[1])
              .slice(0, 5)
              .map(([employee, count]) => (
                <div key={employee} className="flex items-center justify-between">
                  <span className="text-sm text-slate-700">{employee}</span>
                  <div className="flex items-center gap-3">
                    <div className="w-32 h-2 bg-slate-200 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-purple-500 rounded-full"
                        style={{ width: `${(count / statistics.completed) * 100}%` }}
                      />
                    </div>
                    <span className="text-sm font-semibold text-slate-700 w-6 text-right">{count}</span>
                  </div>
                </div>
              ))}
            {Object.keys(statistics.employeeCount).length === 0 && (
              <p className="text-slate-500 text-sm">Nenhum atendimento concluído</p>
            )}
          </div>
        </div>
      </div>

      {/* Full appointment table */}
      <div className="bg-white rounded-lg shadow-sm border border-slate-200">
        <div className="p-4 border-b border-slate-200">
          <div className="flex gap-4 flex-wrap">
            <div className="flex-1 relative min-w-48">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
              <input
                type="text"
                placeholder="Buscar por pet, cliente, serviço ou funcionário..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
            >
              <option value="all">Todos os status</option>
              <option value="scheduled">Agendados</option>
              <option value="completed">Concluídos</option>
              <option value="cancelled">Cancelados</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Data/Hora</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Pet/Cliente</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Serviço</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Funcionário</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Obs.</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {filteredAppointments.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-slate-500">
                    {searchTerm || statusFilter !== "all" ? "Nenhum atendimento encontrado" : "Nenhum atendimento registrado"}
                  </td>
                </tr>
              ) : (
                filteredAppointments.map((apt) => (
                  <tr key={apt.id} className="hover:bg-slate-50">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-slate-400" />
                        <div>
                          <div className="font-medium text-slate-900">
                            {format(parseISO(apt.date), "dd/MM/yyyy", { locale: ptBR })}
                          </div>
                          <div className="text-sm text-slate-600">{apt.time}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col gap-1">
                        <div className="flex items-center gap-2">
                          <PawPrint className="h-4 w-4 text-slate-400" />
                          <span className="font-medium text-slate-900">{apt.petName}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-slate-600">
                          <User className="h-3 w-3" />
                          {apt.clientName}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-900">{apt.service}</td>
                    <td className="px-6 py-4 text-sm text-slate-600">{apt.employeeName}</td>
                    <td className="px-6 py-4">
                      <select
                        value={apt.status}
                        onChange={(e) =>
                          handleStatusChange(apt.id, e.target.value as "scheduled" | "completed" | "cancelled")
                        }
                        className={`px-2 py-1 rounded text-xs font-medium border-0 cursor-pointer ${
                          apt.status === "scheduled" ? "bg-orange-100 text-orange-800" :
                          apt.status === "completed" ? "bg-green-100 text-green-800" :
                          "bg-red-100 text-red-800"
                        }`}
                      >
                        <option value="scheduled">Agendado</option>
                        <option value="completed">Concluído</option>
                        <option value="cancelled">Cancelado</option>
                      </select>
                    </td>
                    <td className="px-6 py-4">
                      {apt.notes ? (
                        <span className="text-blue-600 hover:text-blue-800 text-sm cursor-help" title={apt.notes}>
                          Ver obs.
                        </span>
                      ) : (
                        <span className="text-slate-400 text-sm">—</span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
