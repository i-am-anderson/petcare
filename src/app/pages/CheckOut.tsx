import { useState, useMemo } from "react";
import { useLocalStorage } from "../hooks/useLocalStorage";
import { LogOut, CreditCard, Banknote, Smartphone, CheckCircle, PawPrint, User, Clock } from "lucide-react";
import { format, parseISO } from "date-fns";
import { CheckInRecord } from "./CheckIn";
import { ServiceOrder } from "./ServiceOrderPage";

export interface Transaction {
  id: string;
  checkInId: string;
  serviceOrderId: string;
  petName: string;
  clientName: string;
  service: string;
  amount: number;
  paymentMethod: "cash" | "credit_card" | "debit_card" | "pix";
  status: "paid";
  checkOutTime: string;
  createdAt: string;
}

const SERVICE_PRICES: Record<string, number> = {
  "Banho": 60,
  "Tosa": 80,
  "Banho e Tosa": 120,
  "Hidratação": 50,
  "Corte de Unhas": 30,
};

const PAYMENT_METHODS = [
  { value: "cash", label: "Dinheiro", icon: Banknote, color: "text-green-600" },
  { value: "credit_card", label: "Cartão de Crédito", icon: CreditCard, color: "text-blue-600" },
  { value: "debit_card", label: "Cartão de Débito", icon: CreditCard, color: "text-purple-600" },
  { value: "pix", label: "Pix", icon: Smartphone, color: "text-teal-600" },
] as const;

export function CheckOut() {
  const [checkIns, setCheckIns] = useLocalStorage<CheckInRecord[]>("checkIns", []);
  const [serviceOrders, setServiceOrders] = useLocalStorage<ServiceOrder[]>("serviceOrders", []);
  const [transactions, setTransactions] = useLocalStorage<Transaction[]>("transactions", []);

  const [selectedCheckIn, setSelectedCheckIn] = useState<CheckInRecord | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<Transaction["paymentMethod"]>("pix");
  const [customAmount, setCustomAmount] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [lastCheckOut, setLastCheckOut] = useState<{ petName: string; amount: number } | null>(null);

  const readyForCheckOut = useMemo(() => {
    return checkIns.filter((ci) => ci.status === "done");
  }, [checkIns]);

  const todayCheckOuts = useMemo(() => {
    const today = format(new Date(), "yyyy-MM-dd");
    return transactions.filter((t) => t.createdAt.startsWith(today));
  }, [transactions]);

  const getServiceOrder = (checkInId: string) =>
    serviceOrders.find((so) => so.checkInId === checkInId);

  const getSuggestedPrice = (service: string) => SERVICE_PRICES[service] || 0;

  const handleOpenModal = (ci: CheckInRecord) => {
    setSelectedCheckIn(ci);
    setPaymentMethod("pix");
    setCustomAmount(String(getSuggestedPrice(ci.service)));
    setShowModal(true);
  };

  const handleCheckOut = () => {
    if (!selectedCheckIn) return;
    const amount = parseFloat(customAmount) || getSuggestedPrice(selectedCheckIn.service);
    const order = getServiceOrder(selectedCheckIn.id);

    const transaction: Transaction = {
      id: crypto.randomUUID(),
      checkInId: selectedCheckIn.id,
      serviceOrderId: order?.id || "",
      petName: selectedCheckIn.petName,
      clientName: selectedCheckIn.clientName,
      service: selectedCheckIn.service,
      amount,
      paymentMethod,
      status: "paid",
      checkOutTime: format(new Date(), "HH:mm"),
      createdAt: new Date().toISOString(),
    };

    setTransactions([...transactions, transaction]);
    setCheckIns(
      checkIns.map((ci) =>
        ci.id === selectedCheckIn.id ? { ...ci, status: "checked_out" } : ci
      )
    );

    setLastCheckOut({ petName: selectedCheckIn.petName, amount });
    setShowModal(false);
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 3000);
  };

  const paymentLabel = (method: Transaction["paymentMethod"]) => {
    return PAYMENT_METHODS.find((m) => m.value === method)?.label || method;
  };

  const totalToday = todayCheckOuts.reduce((sum, t) => sum + t.amount, 0);

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-slate-900">Check-out de Pets</h1>
        <p className="text-slate-600 mt-1">Finalize o atendimento e registre o pagamento</p>
      </div>

      {/* Success Toast */}
      {showSuccess && lastCheckOut && (
        <div className="fixed top-4 right-4 z-50 bg-green-600 text-white px-6 py-3 rounded-lg shadow-lg flex items-center gap-3 animate-pulse">
          <CheckCircle className="h-5 w-5" />
          <span>Check-out de <strong>{lastCheckOut.petName}</strong> — R$ {lastCheckOut.amount.toFixed(2)}</span>
        </div>
      )}

      {/* Summary card */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-4">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-green-100 rounded-lg">
              <CheckCircle className="h-6 w-6 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-slate-600">Prontos p/ Check-out</p>
              <p className="text-2xl font-bold text-slate-900">{readyForCheckOut.length}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-4">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-teal-100 rounded-lg">
              <LogOut className="h-6 w-6 text-teal-600" />
            </div>
            <div>
              <p className="text-sm text-slate-600">Check-outs Hoje</p>
              <p className="text-2xl font-bold text-slate-900">{todayCheckOuts.length}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-4">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-emerald-100 rounded-lg">
              <Banknote className="h-6 w-6 text-emerald-600" />
            </div>
            <div>
              <p className="text-sm text-slate-600">Faturado Hoje</p>
              <p className="text-2xl font-bold text-emerald-700">R$ {totalToday.toFixed(2)}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Ready for checkout */}
      <div className="bg-white rounded-lg shadow-sm border border-slate-200 mb-6">
        <div className="p-4 border-b border-slate-200">
          <h2 className="text-lg font-semibold text-slate-900">Prontos para Retirada</h2>
        </div>
        {readyForCheckOut.length === 0 ? (
          <div className="p-8 text-center text-slate-500">Nenhum pet aguardando retirada</div>
        ) : (
          <div className="divide-y divide-slate-100">
            {readyForCheckOut.map((ci) => {
              const order = getServiceOrder(ci.id);
              return (
                <div key={ci.id} className="p-4 flex items-center justify-between hover:bg-slate-50">
                  <div className="flex items-center gap-4">
                    <div className="p-2 bg-green-100 rounded-full">
                      <PawPrint className="h-5 w-5 text-green-600" />
                    </div>
                    <div>
                      <p className="font-semibold text-slate-900">{ci.petName}</p>
                      <div className="flex items-center gap-3 text-sm text-slate-600 mt-0.5">
                        <span className="flex items-center gap-1"><User className="h-3 w-3" />{ci.clientName}</span>
                        <span className="px-2 py-0.5 bg-orange-100 text-orange-700 rounded-full text-xs font-medium">
                          {ci.service}
                        </span>
                        {order?.endTime && (
                          <span className="flex items-center gap-1 text-green-700">
                            <Clock className="h-3 w-3" />
                            Pronto às {format(parseISO(order.endTime), "HH:mm")}
                          </span>
                        )}
                      </div>
                      <p className="text-sm font-semibold text-slate-700 mt-0.5">
                        Valor sugerido: R$ {getSuggestedPrice(ci.service).toFixed(2)}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => handleOpenModal(ci)}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-md hover:bg-emerald-700 text-sm font-medium"
                  >
                    <LogOut className="h-4 w-4" />
                    Check-out
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Today's checkouts */}
      {todayCheckOuts.length > 0 && (
        <div className="bg-white rounded-lg shadow-sm border border-slate-200">
          <div className="p-4 border-b border-slate-200">
            <h2 className="text-lg font-semibold text-slate-900">Check-outs Realizados Hoje</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Pet / Cliente</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Serviço</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Horário</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Pagamento</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Valor</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {todayCheckOuts.map((t) => (
                  <tr key={t.id} className="hover:bg-slate-50">
                    <td className="px-6 py-4">
                      <p className="font-medium text-slate-900">{t.petName}</p>
                      <p className="text-sm text-slate-500">{t.clientName}</p>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-700">{t.service}</td>
                    <td className="px-6 py-4 text-sm text-slate-600">{t.checkOutTime}</td>
                    <td className="px-6 py-4">
                      <span className="text-sm text-slate-700">{paymentLabel(t.paymentMethod)}</span>
                    </td>
                    <td className="px-6 py-4 font-semibold text-emerald-700">
                      R$ {t.amount.toFixed(2)}
                    </td>
                  </tr>
                ))}
                <tr className="bg-slate-50 font-bold">
                  <td colSpan={4} className="px-6 py-3 text-right text-slate-700">Total do dia:</td>
                  <td className="px-6 py-3 text-emerald-700">R$ {totalToday.toFixed(2)}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Checkout Modal */}
      {showModal && selectedCheckIn && (
        <div className="fixed inset-0 bg-[#00000090] bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
            <div className="p-6">
              <h2 className="text-xl font-bold text-slate-900 mb-1">Finalizar Atendimento</h2>
              <p className="text-slate-600 text-sm mb-5">
                <span className="font-semibold">{selectedCheckIn.petName}</span> —{" "}
                {selectedCheckIn.clientName} · {selectedCheckIn.service}
              </p>

              <div className="space-y-5">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Forma de Pagamento</label>
                  <div className="grid grid-cols-2 gap-2">
                    {PAYMENT_METHODS.map(({ value, label, icon: Icon, color }) => (
                      <button
                        key={value}
                        type="button"
                        onClick={() => setPaymentMethod(value)}
                        className={`flex items-center gap-2 px-3 py-2.5 rounded-md border text-sm font-medium transition-colors ${
                          paymentMethod === value
                            ? "border-emerald-500 bg-emerald-50 text-emerald-800"
                            : "border-slate-300 text-slate-700 hover:bg-slate-50"
                        }`}
                      >
                        <Icon className={`h-4 w-4 ${paymentMethod === value ? "text-emerald-600" : color}`} />
                        {label}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Valor (R$)</label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={customAmount}
                    onChange={(e) => setCustomAmount(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-md text-lg font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                  <p className="text-xs text-slate-500 mt-1">
                    Valor sugerido: R$ {getSuggestedPrice(selectedCheckIn.service).toFixed(2)}
                  </p>
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  onClick={handleCheckOut}
                  className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-emerald-600 text-white rounded-md hover:bg-emerald-700 font-semibold text-sm"
                >
                  <CheckCircle className="h-4 w-4" />
                  Confirmar Pagamento — R$ {(parseFloat(customAmount) || 0).toFixed(2)}
                </button>
                <button
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 bg-slate-200 text-slate-700 rounded-md hover:bg-slate-300 text-sm"
                >
                  Cancelar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
