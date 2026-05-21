import { useState, useMemo } from "react";
import { useLocalStorage } from "../hooks/useLocalStorage";
import { Transaction } from "./CheckOut";
import {
  Banknote, CreditCard, Smartphone, TrendingUp, DollarSign,
  Calendar, BarChart2, FileText, ChevronDown, ChevronUp, X
} from "lucide-react";
import { format, parseISO, startOfDay, endOfDay, isWithinInterval, startOfMonth, endOfMonth } from "date-fns";
import { ptBR } from "date-fns/locale";

const PAYMENT_LABELS: Record<string, string> = {
  cash: "Dinheiro",
  credit_card: "Cartão de Crédito",
  debit_card: "Cartão de Débito",
  pix: "Pix",
};

const PAYMENT_COLORS: Record<string, string> = {
  cash: "bg-green-100 text-green-800",
  credit_card: "bg-blue-100 text-blue-800",
  debit_card: "bg-purple-100 text-purple-800",
  pix: "bg-teal-100 text-teal-800",
};

export interface ManualTransaction {
  id: string;
  type: "income" | "expense";
  description: string;
  amount: number;
  category: string;
  paymentMethod: string;
  date: string;
  createdAt: string;
}

export function FinancialDashboard() {
  const [transactions] = useLocalStorage<Transaction[]>("transactions", []);
  const [manualTransactions, setManualTransactions] = useLocalStorage<ManualTransaction[]>("manualTransactions", []);

  const [period, setPeriod] = useState<"today" | "month" | "custom">("today");
  const [customStart, setCustomStart] = useState(format(new Date(), "yyyy-MM-dd"));
  const [customEnd, setCustomEnd] = useState(format(new Date(), "yyyy-MM-dd"));
  const [showManualModal, setShowManualModal] = useState(false);
  const [manualForm, setManualForm] = useState({
    type: "income" as "income" | "expense",
    description: "",
    amount: "",
    category: "",
    paymentMethod: "cash",
  });

  const dateRange = useMemo(() => {
    const now = new Date();
    if (period === "today") return { start: startOfDay(now), end: endOfDay(now) };
    if (period === "month") return { start: startOfMonth(now), end: endOfMonth(now) };
    return {
      start: startOfDay(new Date(customStart + "T00:00:00")),
      end: endOfDay(new Date(customEnd + "T23:59:59")),
    };
  }, [period, customStart, customEnd]);

  const filteredServiceTransactions = useMemo(() => {
    return transactions.filter((t) =>
      isWithinInterval(parseISO(t.createdAt), dateRange)
    );
  }, [transactions, dateRange]);

  const filteredManual = useMemo(() => {
    return manualTransactions.filter((t) =>
      isWithinInterval(parseISO(t.createdAt), dateRange)
    );
  }, [manualTransactions, dateRange]);

  const totalRevenue = filteredServiceTransactions.reduce((s, t) => s + t.amount, 0);
  const totalManualIncome = filteredManual
    .filter((t) => t.type === "income")
    .reduce((s, t) => s + t.amount, 0);
  const totalExpenses = filteredManual
    .filter((t) => t.type === "expense")
    .reduce((s, t) => s + t.amount, 0);
  const netTotal = totalRevenue + totalManualIncome - totalExpenses;

  const byPaymentMethod = useMemo(() => {
    const map: Record<string, number> = {};
    filteredServiceTransactions.forEach((t) => {
      map[t.paymentMethod] = (map[t.paymentMethod] || 0) + t.amount;
    });
    return map;
  }, [filteredServiceTransactions]);

  const byService = useMemo(() => {
    const map: Record<string, { count: number; total: number }> = {};
    filteredServiceTransactions.forEach((t) => {
      if (!map[t.service]) map[t.service] = { count: 0, total: 0 };
      map[t.service].count++;
      map[t.service].total += t.amount;
    });
    return Object.entries(map).sort((a, b) => b[1].total - a[1].total);
  }, [filteredServiceTransactions]);

  const handleAddManual = (e: React.FormEvent) => {
    e.preventDefault();
    const newTransaction: ManualTransaction = {
      id: crypto.randomUUID(),
      type: manualForm.type,
      description: manualForm.description,
      amount: parseFloat(manualForm.amount),
      category: manualForm.category,
      paymentMethod: manualForm.paymentMethod,
      date: format(new Date(), "yyyy-MM-dd"),
      createdAt: new Date().toISOString(),
    };
    setManualTransactions([...manualTransactions, newTransaction]);
    setManualForm({ type: "income", description: "", amount: "", category: "", paymentMethod: "cash" });
    setShowManualModal(false);
  };

  const periodLabel = () => {
    if (period === "today") return `Hoje, ${format(new Date(), "dd/MM/yyyy")}`;
    if (period === "month") return format(new Date(), "MMMM yyyy", { locale: ptBR });
    return `${customStart} a ${customEnd}`;
  };

  return (
    <div>
      <div className="mb-6 flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Caixa / Financeiro</h1>
          <p className="text-slate-600 mt-1">Controle financeiro e fechamento de caixa</p>
        </div>
        <button
          onClick={() => setShowManualModal(true)}
          className="inline-flex items-center gap-2 px-4 py-2 bg-slate-800 text-white rounded-md hover:bg-slate-900 text-sm font-medium"
        >
          + Lançamento Manual
        </button>
      </div>

      {/* Period selector */}
      <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-4 mb-6 flex items-center gap-4 flex-wrap">
        <span className="text-sm font-medium text-slate-700">Período:</span>
        {(["today", "month", "custom"] as const).map((p) => (
          <button
            key={p}
            onClick={() => setPeriod(p)}
            className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
              period === p ? "bg-slate-800 text-white" : "bg-slate-100 text-slate-700 hover:bg-slate-200"
            }`}
          >
            {p === "today" ? "Hoje" : p === "month" ? "Este Mês" : "Personalizado"}
          </button>
        ))}
        {period === "custom" && (
          <div className="flex items-center gap-2">
            <input
              type="date"
              value={customStart}
              onChange={(e) => setCustomStart(e.target.value)}
              className="px-3 py-1.5 border border-slate-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-slate-400"
            />
            <span className="text-slate-500">até</span>
            <input
              type="date"
              value={customEnd}
              onChange={(e) => setCustomEnd(e.target.value)}
              className="px-3 py-1.5 border border-slate-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-slate-400"
            />
          </div>
        )}
        <span className="ml-auto text-sm text-slate-500">{periodLabel()}</span>
      </div>

      {/* KPI cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-4">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-emerald-100 rounded-lg">
              <Banknote className="h-6 w-6 text-emerald-600" />
            </div>
            <div>
              <p className="text-sm text-slate-600">Serviços</p>
              <p className="text-2xl font-bold text-emerald-700">R$ {totalRevenue.toFixed(2)}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-4">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-blue-100 rounded-lg">
              <TrendingUp className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-slate-600">Entradas Extras</p>
              <p className="text-2xl font-bold text-blue-700">R$ {totalManualIncome.toFixed(2)}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-4">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-red-100 rounded-lg">
              <TrendingUp className="h-6 w-6 text-red-600 rotate-180" />
            </div>
            <div>
              <p className="text-sm text-slate-600">Despesas</p>
              <p className="text-2xl font-bold text-red-700">R$ {totalExpenses.toFixed(2)}</p>
            </div>
          </div>
        </div>
        <div className={`rounded-lg shadow-sm border p-4 ${netTotal >= 0 ? "bg-emerald-50 border-emerald-200" : "bg-red-50 border-red-200"}`}>
          <div className="flex items-center gap-3">
            <div className={`p-3 rounded-lg ${netTotal >= 0 ? "bg-emerald-200" : "bg-red-200"}`}>
              <DollarSign className={`h-6 w-6 ${netTotal >= 0 ? "text-emerald-700" : "text-red-700"}`} />
            </div>
            <div>
              <p className="text-sm text-slate-600">Saldo Líquido</p>
              <p className={`text-2xl font-bold ${netTotal >= 0 ? "text-emerald-700" : "text-red-700"}`}>
                R$ {netTotal.toFixed(2)}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        {/* Payment methods breakdown */}
        <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
          <h2 className="text-lg font-semibold text-slate-900 mb-4">Por Forma de Pagamento</h2>
          {Object.keys(byPaymentMethod).length === 0 ? (
            <p className="text-slate-500 text-sm">Nenhuma transação no período</p>
          ) : (
            <div className="space-y-3">
              {Object.entries(byPaymentMethod)
                .sort((a, b) => b[1] - a[1])
                .map(([method, amount]) => (
                  <div key={method} className="flex items-center justify-between">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${PAYMENT_COLORS[method] || "bg-slate-100 text-slate-700"}`}>
                      {PAYMENT_LABELS[method] || method}
                    </span>
                    <div className="flex items-center gap-3">
                      <div className="w-24 h-2 bg-slate-200 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-emerald-500 rounded-full"
                          style={{ width: `${(amount / totalRevenue) * 100}%` }}
                        />
                      </div>
                      <span className="text-sm font-semibold text-slate-700 w-20 text-right">
                        R$ {amount.toFixed(2)}
                      </span>
                    </div>
                  </div>
                ))}
            </div>
          )}
        </div>

        {/* Services breakdown */}
        <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
          <h2 className="text-lg font-semibold text-slate-900 mb-4">Por Serviço</h2>
          {byService.length === 0 ? (
            <p className="text-slate-500 text-sm">Nenhuma transação no período</p>
          ) : (
            <div className="space-y-3">
              {byService.map(([service, { count, total }]) => (
                <div key={service} className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-slate-800">{service}</p>
                    <p className="text-xs text-slate-500">{count} atendimento{count > 1 ? "s" : ""}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-24 h-2 bg-slate-200 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-blue-500 rounded-full"
                        style={{ width: `${(total / totalRevenue) * 100}%` }}
                      />
                    </div>
                    <span className="text-sm font-semibold text-slate-700 w-20 text-right">
                      R$ {total.toFixed(2)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Transaction table */}
      <div className="bg-white rounded-lg shadow-sm border border-slate-200">
        <div className="p-4 border-b border-slate-200">
          <h2 className="text-lg font-semibold text-slate-900">Lançamentos do Período</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Data/Hora</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Descrição</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Tipo</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Pagamento</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Valor</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {filteredServiceTransactions.length === 0 && filteredManual.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-slate-500">
                    Nenhum lançamento no período
                  </td>
                </tr>
              ) : (
                <>
                  {filteredServiceTransactions.map((t) => (
                    <tr key={t.id} className="hover:bg-slate-50">
                      <td className="px-6 py-4 text-sm text-slate-600">
                        {format(parseISO(t.createdAt), "dd/MM HH:mm")}
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-sm font-medium text-slate-900">{t.service} — {t.petName}</p>
                        <p className="text-xs text-slate-500">{t.clientName}</p>
                      </td>
                      <td className="px-6 py-4">
                        <span className="px-2 py-0.5 bg-green-100 text-green-800 rounded-full text-xs font-medium">
                          Serviço
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${PAYMENT_COLORS[t.paymentMethod] || ""}`}>
                          {PAYMENT_LABELS[t.paymentMethod]}
                        </span>
                      </td>
                      <td className="px-6 py-4 font-semibold text-emerald-700">
                        + R$ {t.amount.toFixed(2)}
                      </td>
                    </tr>
                  ))}
                  {filteredManual.map((t) => (
                    <tr key={t.id} className="hover:bg-slate-50">
                      <td className="px-6 py-4 text-sm text-slate-600">
                        {format(parseISO(t.createdAt), "dd/MM HH:mm")}
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-sm font-medium text-slate-900">{t.description}</p>
                        <p className="text-xs text-slate-500">{t.category}</p>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${t.type === "income" ? "bg-blue-100 text-blue-800" : "bg-red-100 text-red-800"}`}>
                          {t.type === "income" ? "Entrada" : "Saída"}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-600">{PAYMENT_LABELS[t.paymentMethod] || t.paymentMethod}</td>
                      <td className={`px-6 py-4 font-semibold ${t.type === "income" ? "text-blue-700" : "text-red-700"}`}>
                        {t.type === "income" ? "+" : "-"} R$ {t.amount.toFixed(2)}
                      </td>
                    </tr>
                  ))}
                </>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Manual transaction modal */}
      {showManualModal && (
        <div className="fixed inset-0 bg-[#00000090] bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-slate-900">Lançamento Manual</h2>
              <button onClick={() => setShowManualModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="h-5 w-5" />
              </button>
            </div>
            <form onSubmit={handleAddManual} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Tipo *</label>
                <div className="flex gap-3">
                  {(["income", "expense"] as const).map((type) => (
                    <button
                      key={type}
                      type="button"
                      onClick={() => setManualForm({ ...manualForm, type })}
                      className={`flex-1 py-2 rounded-md border text-sm font-medium ${
                        manualForm.type === type
                          ? type === "income"
                            ? "border-emerald-500 bg-emerald-50 text-emerald-800"
                            : "border-red-500 bg-red-50 text-red-800"
                          : "border-slate-300 text-slate-700 hover:bg-slate-50"
                      }`}
                    >
                      {type === "income" ? "Entrada" : "Saída"}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Descrição *</label>
                <input
                  type="text"
                  required
                  value={manualForm.description}
                  onChange={(e) => setManualForm({ ...manualForm, description: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-slate-400"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Categoria</label>
                <input
                  type="text"
                  value={manualForm.category}
                  onChange={(e) => setManualForm({ ...manualForm, category: e.target.value })}
                  placeholder="Ex: Produtos, Aluguel, Outros..."
                  className="w-full px-3 py-2 border border-slate-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-slate-400"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Valor (R$) *</label>
                <input
                  type="number"
                  required
                  min="0"
                  step="0.01"
                  value={manualForm.amount}
                  onChange={(e) => setManualForm({ ...manualForm, amount: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-slate-400"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Forma de Pagamento</label>
                <select
                  value={manualForm.paymentMethod}
                  onChange={(e) => setManualForm({ ...manualForm, paymentMethod: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-slate-400"
                >
                  <option value="cash">Dinheiro</option>
                  <option value="credit_card">Cartão de Crédito</option>
                  <option value="debit_card">Cartão de Débito</option>
                  <option value="pix">Pix</option>
                </select>
              </div>
              <div className="flex gap-3 pt-2">
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-slate-800 text-white rounded-md hover:bg-slate-900 font-medium text-sm"
                >
                  Salvar Lançamento
                </button>
                <button
                  type="button"
                  onClick={() => setShowManualModal(false)}
                  className="px-4 py-2 bg-slate-200 text-slate-700 rounded-md hover:bg-slate-300 text-sm"
                >
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
